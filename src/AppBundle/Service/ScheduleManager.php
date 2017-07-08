<?php

namespace AppBundle\Service;

use Doctrine\ORM\EntityManager;
use Symfony\Component\Serializer\SerializerInterface;
use Predis\Client;
use AppBundle\Entity\Radio;
use AppBundle\Service\Cache\Config as CacheConfig;

class ScheduleManager
{
    /** @var EntityManager */
    protected $em;

    /** @var Client */
    protected $redis;

    /** @var SerializerInterface */
    protected $serializer;

    /**
     * ScheduleManager constructor.
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
     * @param \DateTime $dateTime
     * @return array
     */
    public function getDaySchedule(\DateTime $dateTime)
    {
        $repository = $this->em->getRepository('AppBundle:Radio');

        $dateFormat = $dateTime->format('Y-m-d');
        $cacheKey = CacheConfig::CACHE_SCHEDULE_PREFIX . $dateFormat;

        /* active radios */
        $radios = $repository->getAllCodename();
        $radiosInCache = $this->redis->HKEYS($cacheKey);

        $radiosNotInCache = array_diff($radios, $radiosInCache);
        $radiosToRemoveFromCache = array_diff($radiosInCache, $radios);

        // Remove any radio that are not active anymore but in cache
        if (count($radiosToRemoveFromCache) > 0) {
            $this->redis->HDEL($cacheKey, $radiosToRemoveFromCache);
        }

        // Add any new radio schedule for that day in cache
        if (count($radiosNotInCache) > 0) {
            $radioNewSchedule = $repository->getDaySchedule($dateTime, $radiosNotInCache);
            if (count($radioNewSchedule) > 0) {
                $this->redis->HMSET($cacheKey, array_map(function ($entry) {
                    return $this->serializer->serialize($entry, 'json');
                }, $radioNewSchedule));
            }

            // Set TTL if none (new key)
            if ($this->redis->TTL($cacheKey) === -1) {
                $this->redis->EXPIRE($cacheKey, CacheConfig::CACHE_SCHEDULE_TTL);
            }
        }

        // Get cache & decode values
        $cachedSchedule = $this->redis->HGETALL($cacheKey);
        foreach ($cachedSchedule as $radio => $radioSchedule) {
            $cachedSchedule[$radio] = json_decode($radioSchedule);
        }

        return $cachedSchedule;
    }
}
