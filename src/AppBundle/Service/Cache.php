<?php

namespace AppBundle\Service;

use Doctrine\ORM\EntityManager;
use Symfony\Component\Serializer\SerializerInterface;
use Predis\Client;

class Cache
{
    const CACHE_SCHEDULE_PREFIX = 'cache:schedule:';
    const CACHE_SCHEDULE_TTL = 604800; // in seconds = one week

    const CACHE_KEY_DAY_FORMAT = 'Y-m-d';
    const CACHE_KEY_SERIALIZER_FORMAT = 'json';

    /** @var EntityManager */
    protected $em;

    /** @var Client */
    protected $redis;

    /** @var SerializerInterface */
    protected $serializer;

    /**
     * Cache constructor.
     *
     * @param EntityManager $entityManager
     * @param Client $redis
     * @param SerializerInterface $serializer
     */
    public function __construct(EntityManager $entityManager, \Predis\Client $redis, SerializerInterface $serializer)
    {
        $this->em = $entityManager;
        $this->redis = $redis;
        $this->serializer = $serializer;
    }

    /**
     * @param \DateTime $day
     *
     * @return string
     */
    public static function getKey(\DateTime $day) {
        return self::CACHE_SCHEDULE_PREFIX . $day->format(self::CACHE_KEY_DAY_FORMAT);
    }

    /**
     * @param string $key
     *
     * @return void
     */
    protected function setTtlIfNone($key) {
        if ($this->redis->TTL($key) === -1) {
            $this->redis->EXPIRE($key, self::CACHE_SCHEDULE_TTL);
        }
    }

    /**
     * @param \DateTime $day
     *
     * @return array
     */
    public function getRadiosForDay(\DateTime $day) {
        return $this->redis->HKEYS(self::getKey($day));
    }

    /**
     * @param \DateTime $day
     *
     * @return array
     */
    public function getScheduleForDay(\DateTime $day) {
        return $this->redis->HGETALL(self::getKey($day));
    }

    /**
     * @param \DateTime $day
     * @param $schedules
     *
     * @return void
     */
    public function addSchedulesToDay(\DateTime $day, $schedules) {
        $cacheKey = self::getKey($day);

        $this->redis->HMSET($cacheKey, array_map(function ($entry) {
            return $this->serializer->serialize($entry, self::CACHE_KEY_SERIALIZER_FORMAT);
        }, $schedules));

        // Set TTL if none (new key)
        $this->setTtlIfNone($cacheKey);
    }

    /**
     * @param \DateTime $day
     * @param string|array $radioCodeName one or array of radio codename
     *
     * @return integer Number of fields that were removed
     */
    public function removeRadiosFromDay(\DateTime $day, $radioCodeName)
    {
        if (!is_array($radioCodeName)) {
            $radioCodeName = [$radioCodeName];
        }

        return $this->redis->HDEL(self::getKey($day), $radioCodeName);
    }
}
