<?php

namespace AppBundle\Service;

use Predis\Client;
use Monolog\Logger;

class Queue
{
    protected const QUEUE_LIST = 'schedule_input:queue';
    protected const QUEUE_PROCESSING = 'schedule_input:processing';
    protected const QUEUE_CLEANING_INTERVAL = 30; /* minutes, can't be more than 59 */

    /** @var Client */
    protected $redis;

    /** @var \DateTime */
    protected $lastCleaning;

    /**
     * @param Client $redis
     */
    public function __construct(\Predis\Client $redis)
    {
        $this->redis = $redis;
    }

    // ---------- PROCESS ----------

    /**
     * @return string|null
     */
    public function getNextKey(): ?string
    {
        return $this->redis->RPOPLPUSH(self::QUEUE_LIST, self::QUEUE_PROCESSING);
    }

    /**
     * @param string $key
     *
     * @return string|null Json encoded payload
     */
    public function getPayload(string $key): ?string
    {
        return $this->redis->GET($key);
    }

    /**
     * @param string $key
     *
     * @return void
     */
    public function hasBeenProcessed(string $key): void
    {
        $this->redis->LREM(self::QUEUE_PROCESSING, 1, $key);
        $this->redis->DEL($key);
    }

    // ---------- CLEAN ----------

    /**
     * @return bool
     */
    protected function shouldClean(): bool
    {
        if ($this->lastCleaning === null) {
            return true;
        }

        $currentDateTime = new \DateTime();
        $diff = $currentDateTime->diff($this->lastCleaning)->i;

        if ($diff > self::QUEUE_CLEANING_INTERVAL) {
            return true;
        }

        return false;
    }

    /**
     * @return bool True if cleaning happened, false otherwise
     */
    public function cleanProcessingQueue(): bool
    {
        if (!$this->shouldClean()) { return false; }

        while($this->redis->RPOPLPUSH(self::QUEUE_PROCESSING, self::QUEUE_LIST) !== null) {
            /* continue */
        }

        $this->lastCleaning = new \DateTime();
        return true;
    }
}
