<?php

namespace AppBundle\Service;

use Doctrine\ORM\EntityManager;
use Symfony\Component\Serializer\SerializerInterface;
use AppBundle\Service\Cache;
use AppBundle\Entity\Radio;

class ScheduleManager
{
    /** @var EntityManager */
    protected $em;

    /** @var  Cache */
    protected $cache;

    /**
     * ScheduleManager constructor.
     *
     * @param EntityManager $entityManager
     * @param Cache $cache
     */
    public function __construct(EntityManager $entityManager, Cache $cache)
    {
        $this->em = $entityManager;
        $this->cache = $cache;
    }

    /**
     * @param \DateTime $dateTime
     * @return array
     */
    public function getDaySchedule(\DateTime $dateTime)
    {
        // Active radios
        $radios = $this->em->getRepository('AppBundle:Radio')->getAllCodename();
        $radiosInCache = $this->cache->getRadiosForDay($dateTime);

        $radiosNotInCache = array_diff($radios, $radiosInCache);
        $radiosToRemoveFromCache = array_diff($radiosInCache, $radios);

        // Remove any radio that are not active anymore but in cache
        if (count($radiosToRemoveFromCache) > 0) {
            $this->cache->removeRadiosFromDay($dateTime, $radiosToRemoveFromCache);
        }

        // Add any new radio schedule for that day in cache
        if (count($radiosNotInCache) > 0) {
            $radioNewSchedule = $this->em->getRepository('AppBundle:ScheduleEntry')->getDaySchedule($dateTime, $radiosNotInCache);
            if (count($radioNewSchedule) > 0) {
                $this->cache->addSchedulesToDay($dateTime, $radioNewSchedule);
            }
        }

        // Get cache & decode values
        $cachedSchedule = $this->cache->getScheduleForDay($dateTime);
        foreach ($cachedSchedule as $radio => $radioSchedule) {
            $cachedSchedule[$radio] = json_decode($radioSchedule); // @todo to be improved as we encode and decode in the same function
        }

        return $cachedSchedule;
    }
}
