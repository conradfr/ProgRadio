<?php

namespace AppBundle\Service;

use AppBundle\EventSubscriber\ScheduleModifiedEvent;
use Doctrine\ORM\EntityManager;
use Symfony\Component\EventDispatcher\EventDispatcher;
use AppBundle\Entity\Radio;
use AppBundle\Entity\ScheduleEntry;

class ScheduleImporter
{
    /** @var EntityManager */
    protected $em;

    /** @var EventDispatcher */
    protected $dispatcher;

    /**
     * ScheduleImporter constructor.
     *
     * @param EntityManager $entityManager
     * @param EventDispatcher $dispatcher
     */
    public function __construct(EntityManager $entityManager, EventDispatcher $dispatcher)
    {
        $this->em = $entityManager;
        $this->dispatcher = $dispatcher;
    }

    /**
     * @param \stdClass $payload
     * @return bool
     */
    public function build(\stdClass $payload)
    {
        /** @var Radio $radio */
        $radio = $this->em->getRepository('AppBundle:Radio')
            ->findOneByCodeName($payload->radio);

        if (!$radio) { return false; }

        // Use transaction to cancel day schedule delete if new schedule generates error
        $this->em->getConnection()->beginTransaction();

        // Clean data for this radio & day
        $this->deleteRadioSchedule(new \DateTime($payload->date), $radio);

        $collection = [];

        foreach ($payload->items as $item) {
            $dateTimeStart = new \DateTime($item->schedule_start);
            $timeZoneValue = $item->timezone ?: $radio->getTimezone();
            $timeZone = new \DateTimeZone($timeZoneValue);
            $dateTimeStart->setTimezone($timeZone);

            $dateTimeEnd = null;
            $dateTimeEndRaw = $this->getOrDefault($item, 'schedule_end');
            if (isset($dateTimeEndRaw)) {
                $dateTimeEnd = new \DateTime($dateTimeEndRaw);
                $dateTimeEnd->setTimezone($timeZone);
            }

            $entry = new ScheduleEntry();
            $entry->setTitle($item->title)
                  ->setHost($this->getOrDefault($item, 'host'))
                  ->setDescription($this->getOrDefault($item, 'description'))
                  ->setPictureUrl($this->getOrDefault($item, 'img'))
                  ->setDateTimeStart($dateTimeStart)
                  ->setDateTimeEnd($dateTimeEnd)
                  ->setDuration($this->getOrDefault($item, 'duration'))
                  ->setRadio($radio)
            ;

            $collection[] = $entry;

            unset($dateTimeStart, $dateTimeEnd, $dateTimeEndRaw, $timeZoneValue, $timeZone);
        }

        /* Set end time
           Done after first loop as we sometimes need to use the n+1 start time.
        */
        for($i=0;$i<count($collection);$i++) {
            if (empty($collection[$i]->getDateTimeEnd())) {
                // If last of the day assume for now it will end at midnight
                if ($i === (count($collection) - 1)) {
                    $dateTimeEnd = clone $collection[$i]->getDateTimeStart();
                    $dateTimeEnd->add(\DateInterval::createfromdatestring('+1 day'));
                    $dateTimeEnd->setTime('00', '00', '00');
                }
                else {
                    $dateTimeEnd = clone $collection[$i+1]->getDateTimeStart();
                }

                $collection[$i]->setDateTimeEnd($dateTimeEnd);
            }

            $this->em->persist($collection[$i]);
        }

        try {
            $this->em->flush();
            $this->em->getConnection()->commit();
         } catch (\Exception $e) {
            $this->em->getConnection()->rollBack();
            return false;
        }

        $this->dispatcher->dispatch(ScheduleModifiedEvent::NAME,
                                new ScheduleModifiedEvent($collection[0]->getDateTimeStart(), $radio->getCodeName()));

        return true;
    }

    /**
     * @param \StdClass $object
     * @param string $name
     * @param mixed $default default is null
     *
     * @return mixed|null
     */
    protected function getOrDefault($object, $name, $default=null) {
        if (property_exists($object , $name)) {
            return $object->{$name};
        }

        return $default;
    }

    /**
     * Clean schedule data for a radio & day
     *
     * @param \DateTime $date
     * @param Radio $radio
     */
    protected function deleteRadioSchedule(\DateTime $date, Radio $radio) {
        $dateToDeleteFormat = $date->format('Y-m-d');

        $deleteQuery =  $this->em->createQuery('delete from AppBundle:ScheduleEntry se where se.radio = :radio AND DATE(se.dateTimeStart) = :date');
        $deleteQuery->setParameters([
            'radio' => $radio,
            'date' => $dateToDeleteFormat
        ]);

        $deleteQuery->execute();
    }
}
