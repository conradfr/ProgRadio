<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\ScheduleEntry;
use App\ValueObject\ScheduleResource;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Cache\Adapter\AdapterInterface;
use Symfony\Contracts\Cache\ItemInterface;

class ScheduleManager
{
    protected const CACHE_SCHEDULE_PREFIX = 'cache_schedule_';
    protected const CACHE_SCHEDULE_TTL = 604800; // in seconds = one week

    protected const CACHE_KEY_DAY_FORMAT = 'Y-m-d';
    protected const CACHE_KEY_SERIALIZER_FORMAT = 'json';

    protected EntityManagerInterface $em;
    protected AdapterInterface $cache;

    public function __construct(EntityManagerInterface $entityManager, AdapterInterface $cache)
    {
        $this->em = $entityManager;
        $this->cache = $cache;
    }

    /*
    * Basically there would be a bug is any radio would have the same name as a collection
    */
    protected static function getKey(ScheduleResource $scheduleResource): string
    {
        $key = self::CACHE_SCHEDULE_PREFIX . $scheduleResource->getDateTime()->format(self::CACHE_KEY_DAY_FORMAT);

        if ($scheduleResource->getType() !== null) {
            $key .= '_' . $scheduleResource->getValue();
        }

        return $key;
    }

    public function getDayScheduleOfCollection(\DateTime $dateTime, string $collectionCodeName): array
    {
        $scheduleResource = new ScheduleResource($dateTime, ScheduleResource::TYPE_COLLECTION, $collectionCodeName);
        return $this->getDaySchedule($scheduleResource);
    }

    public function getDayScheduleOfRadio(\DateTime $dateTime, string $radioCodeName): array
    {
        $scheduleResource = new ScheduleResource($dateTime, ScheduleResource::TYPE_RADIO, $radioCodeName);
        return $this->getDaySchedule($scheduleResource);
    }

    public function getDayScheduleOfDate(\DateTime $dateTime): array
    {
        $scheduleResource = new ScheduleResource($dateTime);
        return $this->getDaySchedule($scheduleResource);
    }

    protected function getDaySchedule(ScheduleResource $scheduleResource): array
    {
        return $this->cache->get(self::getKey($scheduleResource), function (ItemInterface $item) use($scheduleResource) {
            $item->expiresAfter(self::CACHE_SCHEDULE_TTL);

            return $this->em->getRepository(ScheduleEntry::class)->getDaySchedule($scheduleResource);
        });
    }
}
