<?php

namespace AppBundle\EventSubscriber;

use Symfony\Component\EventDispatcher\Event;

class ImageNewEvent extends Event
{
    const NAME = 'image.new';

    /** @var string */
    protected $imageName;

    public function __construct(string $imageName)
    {
        $this->imageName = $imageName;
    }

    /**
     * @return string
     */
    public function getImageName(): string
    {
        return $this->imageName;
    }
}
