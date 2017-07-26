<?php

namespace AppBundle\Service;

use Doctrine\ORM\EntityManager;
use Symfony\Component\Serializer\SerializerInterface;
use Predis\Client;
use AppBundle\Entity\Radio;
use AppBundle\Entity\ScheduleEntry;
use AppBundle\Service\Cache;

class ScheduleImporter
{
    /** @var EntityManager */
    protected $em;

    /** @var Client */
    protected $redis;

    /** @var SerializerInterface */
    protected $serializer;

    /**
     * ScheduleImporter constructor.
     *
     * @param EntityManager $entityManager
     * @param Client $redis
     * @param SerializerInterface $serializer
     */
    public function __construct(EntityManager $entityManager, \Predis\Client $redis, SerializerInterface $serializer)
    {
        $this->em = $entityManager;
        $this->redis = $redis;
        $this->serializer = $serializer;
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

        // Clean data for this radio & day
        $this->deleteRadioSchedule(new \DateTime($payload->date), $radio);

        $collection = [];

        foreach ($payload->items as $item) {
            $dateTimeStart = new \DateTime($item->schedule);
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

        // Calculate duration
        for($i=0;$i<count($collection);$i++) {
            if (!empty($collection[$i]->getDateTimeEnd())) {
               $duration = floor(($collection[$i+1]->getDateTimeEnd()->getTimestamp() - $collection[$i]->getDateTimeStart()->getTimestamp()) / 60);
               $collection[$i]->setDuration($duration);
            }
            elseif (!empty($collection[$i]->getDuration())) {
                $dateTimeEnd = clone $collection[$i]->getDateTimeStart();

                $duration = $collection[$i]->getDuratin();
                $days = floor($duration / 1440);
                $hours = floor(($duration % 1440) / 60);
                $minutes = floor($hours % 60);

                $dateTimeEnd->add(\DateInterval::createfromdatestring(sprintf('+%d day', $days)));
                $dateTimeEnd->add(\DateInterval::createfromdatestring(sprintf('+d hour', $hours)));
                $dateTimeEnd->add(\DateInterval::createfromdatestring(sprinf('+d minute', $minutes)));

                $collection[$i]->setDateTimeEnd($dateTimeEnd);
            }
            else {
                if (empty($collection[$i]->getDuration())) {
                    // If last of the day assume for now it will end at midnight
                    if ($i === (count($collection) - 1)) {
                        $dateTimeEnd = clone $collection[$i]->getDateTimeStart();
                        $dateTimeEnd->add(\DateInterval::createfromdatestring('+1 day'));
                        $dateTimeEnd->setTime('00', '00', '00');

                        $duration = floor(($dateTimeEnd->getTimestamp() - $collection[$i]->getDateTimeStart()->getTimestamp()) / 60);
                        $collection[$i]->setDuration($duration);
                    }
                    else {
                        $duration = ($collection[$i+1]->getDateTimeStart()->getTimestamp() - $collection[$i]->getDateTimeStart()->getTimestamp()) / 60;
                        $collection[$i]->setDuration($duration);
                    }
                }
            }

            $this->em->persist($collection[$i]);
        }

        $this->em->flush();

        /* preemptive cache */
        $cacheKey = Cache::CACHE_SCHEDULE_PREFIX . $payload->date;
        $this->redis->HSET($cacheKey, $radio->getCodeName(), $this->serializer->serialize($collection, 'json', ['groups' => array('export')]));
        $this->redis->EXPIRE($cacheKey, Cache::CACHE_SCHEDULE_TTL);

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
