<?php

namespace AppBundle\Command;

use AppBundle\Service\Queue;
use Symfony\Bridge\Monolog\Logger;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use AppBundle\Service\ScheduleImporter;

/**
 * Class SchedulerImporterCommand
 * @package AppBundle\Command
 *
 * @todo move processing code in separate class ?
 */
class SchedulerImporterCommand extends ContainerAwareCommand
{
    const DAEMON_SLEEP = 1; /* seconds */

    /** @var Queue */
    private $queue;

    /** @var Logger */
    private $logger;

    protected function configure()
    {
        $this->setName('app:scheduler:import')
             ->setDescription("(daemon) Process the scrapper queue and import radios' schedule");
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $container = $this->getContainer();

        $this->logger = $container->get('logger');
        $this->logger->notice('Starting daemon ...');

        $this->queue = $container->get(Queue::class);
        $builder = $container->get(ScheduleImporter::class);

        /*
         * If daemon previously quit without finishing processed payload,
         * put them back in the queue
         */
        $this->logger->notice('Cleaning processing queue (init)');
        $this->queue->cleanProcessingQueue();

        while(true) {
            if ($this->queue->cleanProcessingQueue() === true) {
                $this->logger->notice('Cleaning processing queue');
            }

            // Manage queues & process keys
            $scheduleKey = $this->queue->getNextKey();
            if ($scheduleKey) {
                $this->logger->notice(print_r($scheduleKey, 1));

                $payload = $this->queue->getPayload($scheduleKey);

                if ($payload) {
                    $payloadDecoded = json_decode($payload);

                    try {
                        $buildStatus = $builder->build($payloadDecoded);
                    } catch (\Exception $e) {
                        $this->logger->warn(sprintf('ERROR: %s - %s', $scheduleKey, $e->getMessage()));
                        $buildStatus = false;
                    }


                    if ($buildStatus !== null) {
                        $this->queue->hasBeenProcessed($scheduleKey);
                        $this->logger->notice(sprintf('%s - imported: %d items', $payloadDecoded->radio, $buildStatus));
                    }
                }
                else {
                    // Stall list entry, delete it
                    $this->queue->hasBeenProcessed($scheduleKey);
                }
            }

            sleep(self::DAEMON_SLEEP);
        }

        $this->logger->notice('Stopping daemon ...');
    }
}
