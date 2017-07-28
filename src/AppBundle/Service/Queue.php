<?php

namespace AppBundle\Service;

use Predis\Client;
use Monolog\Logger;

class Queue
{
    const QUEUE_LIST = 'schedule_input:queue';
    const QUEUE_PROCESSING = 'schedule_input:processing';
    const QUEUE_CLEANING_INTERVAL = 30; /* minutes, can't be more than 59 */

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
     * @return string
     */
    public function getNextKey() {
        return $this->redis->RPOPLPUSH(self::QUEUE_LIST, self::QUEUE_PROCESSING);
    }

    /**
     * @param $key
     *
     * @return string Json encoded payload
     */
    public function getPayload($key) {
        return $this->redis->GET($key);
    }

    /**
     * @param $key
     */
    public function hasBeenProcessed($key)
    {
        $this->redis->LREM(self::QUEUE_PROCESSING, 1, $key);
        $this->redis->DEL($key);
    }

    // ---------- CLEAN ----------

    protected function shouldClean()
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
    public function cleanProcessingQueue()
    {
        if (!$this->shouldClean()) { return false; }

        while($this->redis->RPOPLPUSH(self::QUEUE_PROCESSING, self::QUEUE_LIST) !== null) {
            /* continue */
        }

        $this->lastCleaning = new \DateTime();
        return true;
    }
}
