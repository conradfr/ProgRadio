<?php

namespace AppBundle\EventSubscriber;

use AppBundle\Service\ImageCache;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
 * Delete obsolete thumbnails
 */
class ImageNewSubscriber implements EventSubscriberInterface
{
    /** @var ImageCache */
    protected $cache;

    public function __construct(ImageCache $cache)
    {
        $this->cache = $cache;
    }

    public static function getSubscribedEvents()
    {
        return array(
            ImageNewEvent::NAME => 'onNewImage',
        );
    }

    public function onNewImage(ImageNewEvent $event)
    {
        $this->cache->deleteThumbnails($event->getImageName());
    }
}
