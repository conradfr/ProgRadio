<?php

declare(strict_types=1);

namespace App\Service;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Serializer\SerializerInterface;
use Predis\Client;

class ScheduleCache
{
    protected const CACHE_SCHEDULE_PREFIX = 'cache:schedule:';
    protected const CACHE_SCHEDULE_TTL = 604800; // in seconds = one week

    protected const CACHE_KEY_DAY_FORMAT = 'Y-m-d';
    protected const CACHE_KEY_SERIALIZER_FORMAT = 'json';

    /** @var EntityManagerInterface */
    protected $em;

    /** @var Client */
    protected $redis;

    /** @var SerializerInterface */
    protected $serializer;

    public function __construct(EntityManagerInterface $entityManager, Client $redis, SerializerInterface $serializer)
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
    public static function getKey(\DateTime $day): string {
        return self::CACHE_SCHEDULE_PREFIX . $day->format(self::CACHE_KEY_DAY_FORMAT);
    }

    /**
     * @param string $key
     *
     * @return void
     */
    protected function setTtlIfNone(string $key): void {
        if ($this->redis->TTL($key) === -1) {
            $this->redis->EXPIRE($key, self::CACHE_SCHEDULE_TTL);
        }
    }

    /**
     * @param \DateTime $day
     *
     * @return array
     */
    public function getRadiosForDay(\DateTime $day): array {
        return $this->redis->HKEYS(self::getKey($day));
    }

    /**
     * @param \DateTime $day
     *
     * @return array
     */
    public function getScheduleForDay(\DateTime $day): array {
        return $this->redis->HGETALL(self::getKey($day));
    }

    /**
     * @param \DateTime $day
     * @param string $radioCodeName
     *
     * @return int 1|0
     */
    public function hasScheduleForDayAndRadio(\DateTime $day, string $radioCodeName): int {
        return $this->redis->HEXISTS(self::getKey($day), $radioCodeName);
    }

    /**
     * @param \DateTime $day
     * @param string $radioCodeName
     *
     * @return string|null
     */
    public function getScheduleForDayAndRadio(\DateTime $day, string $radioCodeName): ?string {
        return $this->redis->HGET(self::getKey($day), $radioCodeName);
    }

    /**
     * @param \DateTime $day
     * @param array $schedules
     *
     * @return void
     */
    public function addSchedulesToDay(\DateTime $day, array $schedules): void {
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
    public function removeRadiosFromDay(\DateTime $day, $radioCodeName): int
    {
        if (!is_array($radioCodeName)) {
            $radioCodeName = [$radioCodeName];
        }

        return $this->redis->HDEL(self::getKey($day), $radioCodeName);
    }
}
