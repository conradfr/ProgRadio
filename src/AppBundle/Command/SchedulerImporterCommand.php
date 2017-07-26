<?php

namespace AppBundle\Command;

use Symfony\Bridge\Monolog\Logger;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Predis\Client;
use AppBundle\Service\ScheduleImporter;

/**
 * Class SchedulerImporterCommand
 * @package AppBundle\Command
 *
 * @todo move processing code in separate class ?
 */
class SchedulerImporterCommand extends ContainerAwareCommand
{
    const QUEUE_LIST = 'schedule_input:queue';
    const QUEUE_PROCESSING = 'schedule_input:processing';
    const QUEUE_CLEANING_INTERVAL = 30; /* minutes, can't be more than 59 */
    const DAEMON_SLEEP = 1; /* seconds */

    /** @var \Predis\Client */
    private $redis;

    /** @var  \Monolog\Logger */
    private $logger;

    protected function configure()
    {
        $this->setName('app:scheduler:import')
             ->setDescription("(daemon) Process the scrapper queue and import radios' schedule");
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $this->logger = $this->getContainer()->get('logger');
        $this->logger->notice('Starting daemon ...');

        $this->redis = $this->getContainer()->get('snc_redis.default');
        $builder = $this->getContainer()->get(ScheduleImporter::class);

        /*
         * If daemon previously quit without finishing processed payload,
         * put them back in the queue
         */
        $this->cleanProcessingQueue();
        $lastQueueCleaning = new \DateTime();

        while(true) {

            // Clean queue at interval
            $currentDateTime = new \DateTime();
            $diff = $currentDateTime->diff($lastQueueCleaning)->i;

            if ($diff > self::QUEUE_CLEANING_INTERVAL) {
                $lastQueueCleaning = $currentDateTime;
                $this->cleanProcessingQueue();
                unset($diff);
            }

            // Manage queues & process keys
            $scheduleKey = $this->redis->RPOPLPUSH(self::QUEUE_LIST, self::QUEUE_PROCESSING);
            if ($scheduleKey) {
                $this->logger->notice(print_r($scheduleKey, 1));

                $payload = $this->redis->GET($scheduleKey);

                if ($payload) {
                    $payloadDecoded = json_decode($payload);

                    $buildStatus = $builder->build($payloadDecoded);
                    if ($buildStatus === true) {
                        $this->redis->LREM(self::QUEUE_PROCESSING, 1, $scheduleKey);
                        $this->redis->DEL($scheduleKey);
                    }
                }
                else {
                    // Stall list entry, delete it
                    $this->redis->LREM(self::QUEUE_PROCESSING, 1, $scheduleKey);
                }
            }

            sleep(self::DAEMON_SLEEP);
        }

        $this->logger->notice('Stopping daemon ...');
    }

    /**
     * @return void
     */
    protected function cleanProcessingQueue() {
        $this->logger->notice('Cleaning processing queue');

        while($this->redis->RPOPLPUSH(self::QUEUE_PROCESSING, self::QUEUE_LIST) !== null) {
            /* continue */
        }

        return;
    }

}
