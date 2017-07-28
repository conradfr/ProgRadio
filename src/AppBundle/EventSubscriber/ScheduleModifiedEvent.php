<?php

namespace AppBundle\EventSubscriber;

use Symfony\Component\EventDispatcher\Event;

class ScheduleModifiedEvent extends Event
{
    const NAME = 'schedule.modified';

    /** @var \DateTime */
    protected $dateTime;

    /** @var string */
    protected $radioCodeName;

    public function __construct(\DateTime $dateTime, $radioCodeName)
    {
        $this->dateTime = $dateTime;
        $this->radioCodeName = $radioCodeName;
    }

    /**
     * @return \DateTime
     */
    public function getDateTime()
    {
        return $this->dateTime;
    }

    /**
     * @return string
     */
    public function getRadioCodeName()
    {
        return $this->radioCodeName;
    }
}
