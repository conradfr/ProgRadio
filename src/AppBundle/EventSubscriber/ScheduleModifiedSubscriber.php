<?php

namespace AppBundle\EventSubscriber;

use AppBundle\Service\Cache;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
 * Discard cache for a day & radio
 */
class ScheduleModifiedSubscriber implements EventSubscriberInterface
{
    /** @var Cache */
    protected $cache;

    public function __construct(Cache $cache)
    {
        $this->cache = $cache;
    }

    public static function getSubscribedEvents()
    {
        return array(
            ScheduleModifiedEvent::NAME => 'onCacheModified',
        );
    }

    public function onCacheModified(ScheduleModifiedEvent $event)
    {
        $this->cache->removeRadiosFromDay($event->getDateTime(), $event->getRadioCodeName());
    }
}
