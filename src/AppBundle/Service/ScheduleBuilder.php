<?php

namespace AppBundle\Service;

use Doctrine\ORM\EntityManager;
use Symfony\Component\Serializer\SerializerInterface;
use Predis\Client;
use AppBundle\Entity\Radio;
use AppBundle\Entity\ScheduleEntry;
use AppBundle\Service\Cache\Config as CacheConfig;

class ScheduleBuilder
{
    /** @var EntityManager */
    protected $em;

    /** @var Client */
    protected $redis;

    /** @var SerializerInterface */
    protected $serializer;

    /**
     * ScheduleBuilder constructor.
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

        $this->deleteRadioSchedule(new \DateTime($payload->date), $radio);

        $collection = [];

        foreach ($payload->items as $item) {
            $dateTime = new \DateTime($item->schedule);
            $timeZoneValue = $item->timezone ?: $radio->getTimezone();
            $timeZone = new \DateTimeZone($timeZoneValue);
            $dateTime->setTimezone($timeZone);


            $entry = new ScheduleEntry();
            $entry->setTitle($item->title)
                  ->setHost($item->host)
                  ->setDescription($item->description ?: null)
                  ->setPictureUrl($item->img ?: null)
                  ->setDateTimeStart($dateTime)
                  ->setRadio($radio)
            ;

            $this->em->persist($entry);

            $collection[] = $entry;

            unset($dateTime, $timeZoneValue, $timeZone);
        }

        $this->em->flush();

        /* preemptive cache */
        $cacheKey = CacheConfig::CACHE_SCHEDULE_PREFIX . $payload->date;
        $this->redis->HSET($cacheKey, $radio->getCodeName(), $this->serializer->serialize($collection, 'json', ['groups' => array('export')]));
        $this->redis->EXPIRE($cacheKey, CacheConfig::CACHE_SCHEDULE_TTL);

        return true;
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
