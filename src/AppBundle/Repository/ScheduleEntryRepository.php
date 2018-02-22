<?php

namespace AppBundle\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * ScheduleEntryRepository
 */
class ScheduleEntryRepository extends EntityRepository
{
    /**
     * @param \DateTime $dateTime
     * @param array $radios array of radio codename, if null get all radios
     *
     * @return array
     */
    public function getDaySchedule(\DateTime $dateTime, array $radios=null)
    {
        $dateTime->setTime('00', '00', '00');
        $dateTimeEnd = clone $dateTime;
        $dateTimeEnd->add(\DateInterval::createfromdatestring('+1 day'));

        $qb = $this->getEntityManager()->createQueryBuilder();
        $qb->select('r.codeName, se.title, se.host,se.description, se.pictureUrl as picture_url,'
                . 'AT_TIME_ZONE(AT_TIME_ZONE(se.dateTimeStart,\'UTC\'), \'Europe/Paris\') as start_at, AT_TIME_ZONE(AT_TIME_ZONE(se.dateTimeEnd,\'UTC\'), \'Europe/Paris\') as end_at, EXTRACT(se.dateTimeEnd, se.dateTimeStart) / 60 AS duration,'
                . 'MD5(CONCAT(r.codeName, se.title, se.dateTimeStart)) as hash'
            )
            ->from('AppBundle:ScheduleEntry', 'se')
            ->innerJoin('se.radio', 'r')
            ->where('AT_TIME_ZONE(se.dateTimeStart, \'UTC\') >= :datetime_start')
            ->andWhere('AT_TIME_ZONE(se.dateTimeStart, \'UTC\') < :datetime_end ')
            ->andWhere('r.active = :active')
            ->orderBy('se.dateTimeStart', 'ASC')
        ;

        $qb->setParameters([
            'datetime_start' => $dateTime,
            'datetime_end' => $dateTimeEnd,
            'active' => true
        ]);


        if (!empty($radios)) {
            $qb->andWhere('r.codeName IN (:radios)');
            $qb->setParameter('radios', $radios);
        }

        $qb->getQuery()->useResultCache(false); // rely on app schedule cache and only get fresh data here
        $result = $qb->getQuery()->getResult();

        $export = [];
        foreach ($result as $row) {
            $radio = $row['codeName'];
            unset($row['codeName']);

            $export[$radio][] = $row;
        }

        return $export;
    }
}
