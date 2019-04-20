<?php

declare(strict_types=1);

namespace App\Service;

use Doctrine\ORM\EntityManager;
use Doctrine\ORM\EntityManagerInterface;

class ScheduleManager
{
    /** @var EntityManager */
    protected $em;

    /** @var  ScheduleCache */
    protected $cache;

    /**
     * ScheduleManager constructor.
     *
     * @param EntityManagerInterface $entityManager
     * @param ScheduleCache $cache
     */
    public function __construct(EntityManagerInterface $entityManager, ScheduleCache $cache)
    {
        $this->em = $entityManager;
        $this->cache = $cache;
    }

    /**
     * @param \DateTime $dateTime
     * @param array $radios
     *
     * @return void
     */
    protected function getScheduleAndPutInCache(\DateTime $dateTime, array $radios): void
    {
        $radioNewSchedule = $this->em->getRepository('App:ScheduleEntry')->getDaySchedule($dateTime, $radios);

        if (count($radioNewSchedule) > 0) {
            $this->cache->addSchedulesToDay($dateTime, $radioNewSchedule);
        }
    }

    /**
     * @param \DateTime $dateTime
     * @param string $radioCodeName
     *
     * @return null|array
     */
    public function getRadioDaySchedule(\DateTime $dateTime, string $radioCodeName): ?array
    {
        if ($this->cache->hasScheduleForDayAndRadio($dateTime, $radioCodeName) === 0) {
            $this->getScheduleAndPutInCache($dateTime, [$radioCodeName]);
        }

        return json_decode($this->cache->getScheduleForDayAndRadio($dateTime, $radioCodeName), true);
    }

    /**
     * @param \DateTime $dateTime
     * @param bool $decode
     *
     * @return array
     */
    public function getDaySchedule(\DateTime $dateTime, $decode = false): array
    {
        $radios = $this->em->getRepository('App:Radio')->getAllCodename();
        $radiosInCache = $this->cache->getRadiosForDay($dateTime);

        $radiosNotInCache = array_diff($radios, $radiosInCache);
        $radiosToRemoveFromCache = array_diff($radiosInCache, $radios);

        // Remove any radio that are not active anymore but in cache
        if (count($radiosToRemoveFromCache) > 0) {
            $this->cache->removeRadiosFromDay($dateTime, $radiosToRemoveFromCache);
        }

        // Add any new radio schedule for that day in cache
        if (count($radiosNotInCache) > 0) {
            $this->getScheduleAndPutInCache($dateTime, $radiosNotInCache);
        }

        // Get cache & decode values
        $cachedSchedule = $this->cache->getScheduleForDay($dateTime);

        if ($decode === true) {
            foreach ($cachedSchedule as $radio => $radioSchedule) {
                $cachedSchedule[$radio] = json_decode($radioSchedule);
            }
        }

        return $cachedSchedule;
    }
}
