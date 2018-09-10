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
        $result = $this->getSchedulesAndSections( $dateTime, $radios);

        // array of radios, to be filled with schedules
        $export = array_fill_keys(array_column($result, 'codeName'), []);

        foreach ($result as $row) {
            $section = $this->hydrateSection($row);
            $codeName = $row['codeName'];
            unset($row['codeName']);

            // if schedule does not exists add it
            if (!isset($export[$codeName][$row['hash']])) {
                $export[$codeName][$row['hash']] = $row;
            }

            // if section, add it to collection
            if (isset($section)) {
                $export[$codeName][$row['hash']]['sections'][] = $section;
            }
        }

        return $export;
    }

    /**
     * @todo cleaner hydration
     *
     * @param \DateTime $dateTime
     * @param array $radios array of radio codename, if null get all radios
     *
     * @return array
     */
    public function getTimeSpecificSchedule(\DateTime $dateTime, array $radios=null)
    {
        $result = $this->getTimeSpecificSchedulesAndSections($dateTime, $radios);

        $export = [];

        foreach ($result as $row) {
            $section = $this->hydrateSection($row);
            $codeName = $row['codeName'];
            unset($row['codeName']);

            // add show if not already there
            if (!isset($export[$codeName])) {
                $radioData = [
                    'codeName' => $codeName,
                    'name' => $row['radio_name'],
                    'share' => $row['radio_share']
                ];

                unset($row['codeName'], $row['radio_name'], $row['radio_share']);

                $export[$codeName] = [
                    'radio' => $radioData,
                    'show' => $row
                ];
            }

            // if section, add it to collection
            if (isset($section)) {
                $export[$codeName]['show']['sections'][] = $section;
            }
        }

        return $export;
    }

    /**
     * @param array $row
     *
     * @return array|null
     */
    protected function hydrateSection(&$row) {
        if (!isset($row['section_title'])) {
            return null;
        }

        $section = [
            'title' => $row['section_title'],
            'presenter' => $row['section_presenter'],
            'description' => $row['section_description'],
            'start_at' => $row['section_start_at'],
            'picture_url' => $row['section_picture_url'],
            'hash' => $row['section_hash']
        ];

        unset($row['section_title'], $row['section_presenter'], $row['section_start_at'], $row['section_hash']);

        return $section;
    }

    /**
     * @return string
     */
    protected function getScheduleSelectString() {
        return 'r.codeName, se.title, se.host,se.description, se.pictureUrl as picture_url,'
                . 'AT_TIME_ZONE(AT_TIME_ZONE(se.dateTimeStart,\'UTC\'), \'Europe/Paris\') as start_at,'
                . 'AT_TIME_ZONE(AT_TIME_ZONE(se.dateTimeEnd,\'UTC\'), \'Europe/Paris\') as end_at, EXTRACT(se.dateTimeEnd, se.dateTimeStart) / 60 AS duration,'
                . 'MD5(CONCAT(r.codeName, se.title, se.dateTimeStart)) as hash,'
                . 'sc.title as section_title, sc.pictureUrl as section_picture_url, sc.presenter as section_presenter, sc.description as section_description,'
                . 'AT_TIME_ZONE(AT_TIME_ZONE(sc.dateTimeStart,\'UTC\'), \'Europe/Paris\') as section_start_at,'
                . 'MD5(CONCAT(CONCAT(r.codeName, se.title, se.dateTimeStart), sc.title, sc.dateTimeStart)) as section_hash';
    }

    /**
     * @param \DateTime $dateTime
     * @param array $radios
     *
     * @return array
     */
    protected function getSchedulesAndSections(\DateTime $dateTime, array $radios=null) {
        $dateTime->setTime('00', '00', '00');
        $dateTimeEnd = clone $dateTime;
        $dateTimeEnd->add(\DateInterval::createfromdatestring('+1 day'));

        $qb = $this->getEntityManager()->createQueryBuilder();
        $qb->select($this->getScheduleSelectString()        )
           ->from('AppBundle:ScheduleEntry', 'se')
           ->innerJoin('se.radio', 'r')
           ->leftJoin('se.sectionEntries', 'sc')
           ->where('AT_TIME_ZONE(se.dateTimeStart, \'UTC\') >= :datetime_start')
           ->andWhere('AT_TIME_ZONE(se.dateTimeStart, \'UTC\') < :datetime_end ')
           ->andWhere('r.active = :active')
           ->addOrderBy('se.dateTimeStart', 'ASC')
           ->addOrderBy('sc.dateTimeStart', 'ASC')
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
        return $qb->getQuery()->getResult();
    }

    /**
     * @param \DateTime $dateTime
     * @param array $radios
     *
     * @return array
     */
    protected function getTimeSpecificSchedulesAndSections(\DateTime $dateTime, array $radios=null) {
        $qb = $this->getEntityManager()->createQueryBuilder();
        $qb->select($this->getScheduleSelectString())
            ->addSelect('r.name as radio_name, r.share as radio_share')
           ->from('AppBundle:ScheduleEntry', 'se')
           ->innerJoin('se.radio', 'r')
           ->leftJoin('se.sectionEntries', 'sc')
           ->where('AT_TIME_ZONE(se.dateTimeStart, \'UTC\') <= :datetime')
           ->andWhere('AT_TIME_ZONE(se.dateTimeEnd, \'UTC\') >= :datetime')
           ->andWhere('r.active = :active')
           ->addOrderBy('r.share', 'DESC')
           ->addOrderBy('se.dateTimeStart', 'ASC')
           ->addOrderBy('sc.dateTimeStart', 'ASC')
        ;

        $qb->setParameters([
            'datetime' => $dateTime,
            'active' => true
        ]);

        if (!empty($radios)) {
            $qb->andWhere('r.codeName IN (:radios)');
            $qb->setParameter('radios', $radios);
        }

        return $qb->getQuery()->getResult();
    }
}
