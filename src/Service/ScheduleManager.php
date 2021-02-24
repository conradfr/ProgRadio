<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Collection;
use App\Entity\ScheduleEntry;
use App\Entity\Radio;
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

    public function __construct(protected EntityManagerInterface $em, protected AdapterInterface $cache) { }

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

    public function getDayScheduleOfCollection(\DateTime $dateTime, string $collectionCodeName, array $favoritesFromCookies = []): array
    {
        if ($collectionCodeName === Radio::FAVORITES) {
            $radiosCodeName = $this->em->getRepository(Collection::class)->getFavorites($favoritesFromCookies);

            if (count($radiosCodeName) === 0) {
                return [];
            }

            $scheduleResource = new ScheduleResource($dateTime, ScheduleResource::TYPE_RADIOS, $radiosCodeName);
        } else {
            $scheduleResource = new ScheduleResource($dateTime, ScheduleResource::TYPE_COLLECTION, $collectionCodeName);
        }

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
        // no cache for favorites
        if ($scheduleResource->getType() === ScheduleResource::TYPE_RADIOS) {
            return $this->em->getRepository(ScheduleEntry::class)->getDaySchedule($scheduleResource);
        }

        return $this->cache->get(self::getKey($scheduleResource), function (ItemInterface $item) use($scheduleResource) {
            $item->expiresAfter(self::CACHE_SCHEDULE_TTL);

            return $this->em->getRepository(ScheduleEntry::class)->getDaySchedule($scheduleResource);
        });
    }
}
