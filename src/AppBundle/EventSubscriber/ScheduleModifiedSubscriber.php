<?php

namespace AppBundle\EventSubscriber;

use AppBundle\Service\ScheduleCache;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
 * Discard cache for a day & radio
 */
class ScheduleModifiedSubscriber implements EventSubscriberInterface
{
    /** @var ScheduleCache */
    protected $cache;

    public function __construct(ScheduleCache $cache)
    {
        $this->cache = $cache;
    }

    public static function getSubscribedEvents()
    {
        return array(
            ScheduleModifiedEvent::NAME => 'onModifiedSchedule',
        );
    }

    public function onModifiedSchedule(ScheduleModifiedEvent $event)
    {
        $this->cache->removeRadiosFromDay($event->getDateTime(), $event->getRadioCodeName());
    }
}
