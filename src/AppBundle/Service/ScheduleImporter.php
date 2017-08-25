<?php

namespace AppBundle\Service;

use AppBundle\EventSubscriber\ScheduleModifiedEvent;
use Doctrine\ORM\EntityManager;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use GuzzleHttp\Client;
use AppBundle\Entity\Radio;
use AppBundle\Entity\ScheduleEntry;

class ScheduleImporter
{
    /** @var EntityManager */
    protected $em;

    /** @var EventDispatcherInterface */
    protected $dispatcher;

    /** @var ImageImporter */
    protected $imgImporter;

    /** @var string */
    protected $imgPath;

    /**
     * @param EntityManager $entityManager
     * @param EventDispatcherInterface $dispatcher
     * @param Client $imgImporter
     */
    public function __construct(EntityManager $entityManager, EventDispatcherInterface $dispatcher, ImageImporter $imgImporter)
    {
        $this->em = $entityManager;
        $this->dispatcher = $dispatcher;
        $this->imgImporter = $imgImporter;
    }

    /**
     * @param \stdClass $payload
     *
     * @return int|false Number of items imported, false if error
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

        // Sort by datetime (needed for duration / end date calc)
        usort($payload->items, function ($a, $b)
        {
            $dateTime1 = new \DateTime($a->schedule_start);
            $dateTime2 = new \DateTime($b->schedule_start);

            if ($dateTime1 == $dateTime2) { return 0; }
            return ($dateTime1 > $dateTime2) ? 1 : -1;
        });

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

            $imgUrl = $this->getOrDefault($item, 'img');

            if (!is_null($imgUrl)) {
                try {
                    $promise = $this->imgImporter->import($imgUrl, $radio->getCodeName());
                    $promise->then(
                        function ($value) use ($entry, $imgUrl) {
                            $entry->setPictureUrl($value);
                        },
                        function ($message) use ($imgUrl) { }
                    );
                } catch (\Exception $e) {
                    // ho noes
                } finally {
                    unset($promise);
                }
            }

            $entry->setTitle($item->title)
                  ->setHost($this->getOrDefault($item, 'host'))
                  ->setDescription($this->getOrDefault($item, 'description'))
                  ->setDateTimeStart($dateTimeStart)
                  ->setDateTimeEnd($dateTimeEnd)
                  ->setDuration($this->getOrDefault($item, 'duration'))
                  ->setRadio($radio)
            ;

            if (isset($promise)) {
                while ($promise->getState() === 'pending') {
                    sleep(1);
                    echo 'wait' . PHP_EOL;
                }
            }

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

        return count($collection);
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
