<?php

namespace AppBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Predis\Client;
use AppBundle\Service\ScheduleBuilder;

class SchedulerBuilderCommand extends ContainerAwareCommand
{
    const QUEUE_LIST = 'schedule_input:queue';
    const QUEUE_PROCESSING = 'schedule_input:processing';

    /** @var \Predis\Client */
    protected $redis;

    protected function configure()
    {
        $this->setName('app:scheduler:build')
             ->setDescription("(daemon) Process the scrapper queue and build radios' schedule");
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $output->write('Starting daemon ...' . PHP_EOL);

        $this->redis = $this->getContainer()->get('snc_redis.default');
        $builder = $this->getContainer()->get(ScheduleBuilder::class);

        /*
         * If daemon previously quit without finishing processed payload,
         * put them back in the queue
         */
        $this->cleanProcessingQueue();

        while(true) {
//            $output->write('Awaiting data from redis ...' . PHP_EOL);
            $scheduleKey = $this->redis->RPOPLPUSH(self::QUEUE_LIST, self::QUEUE_PROCESSING);
            if ($scheduleKey) {
                $output->write('Got redis data !' . PHP_EOL);
                $output->write(print_r($scheduleKey, 1));
                $output->write(PHP_EOL);

                $payload = $this->redis->GET($scheduleKey);
                if ($payload) {
                    $payloadDecoded = json_decode($payload);

                    $buildStatus = $builder->build($payloadDecoded);
                    if ($buildStatus === true) {
                        $this->redis->LREM(self::QUEUE_PROCESSING, 1, $payload);
                        $this->redis->DEL($scheduleKey);
                    }

                    sleep(2);
                }

            }
        }

        $output->write('Stopping daemon ...' . PHP_EOL);
    }

    /**
     * @return void
     */
    protected function cleanProcessingQueue() {
        while($this->redis->RPOPLPUSH(self::QUEUE_PROCESSING, self::QUEUE_LIST) !== null) {
            /* continue */
        }

        return;
    }

}
