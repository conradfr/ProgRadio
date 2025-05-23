<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\ScheduleEntry;
use App\ValueObject\ScheduleResource;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query\Parameter;
use Doctrine\ORM\Query\ResultSetMapping;

class ScheduleEntryRepository extends EntityRepository
{
    protected const string DAY_FORMAT = 'Y-m-d';

    public function getDaySchedule(ScheduleResource $scheduleResource): array
    {
        $result = $this->getSchedulesAndSections($scheduleResource);

        // array of radios, to be filled with schedules
        $export = array_fill_keys(array_column($result, 'codeName'), []);

        foreach ($result as $row) {
            $section = $this->hydrateSection($row);
            $codeName = $row['codeName'];
            unset($row['codeName']);

            // if schedule does not exist add it
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

    /*
     * @todo cleaner hydration
     */
    public function getTimeSpecificSchedule(\DateTime $dateTime, ?array $radios = null): array
    {
        $result = $this->getTimeSpecificSchedulesAndSections($dateTime, $radios);

        $export = [];

        foreach ($result as $row) {
            $section = $this->hydrateSection($row);
            $codeName = $row['codeName'];
            $collectionCodeName = $row['collectionCodeName'];
            unset($row['codeName']);

            if (!isset($export[$collectionCodeName])) {
                $export[$collectionCodeName] = [];
            }


            // add show if not already there
            if (!isset($export[$collectionCodeName][$codeName])) {
                $radioData = [
                    'codeName' => $codeName,
                    'name' => $row['radio_stream_name'],
                    'share' => $row['radio_share'],
                    'streamingUrl' => $row['streaming_url']
                ];

                unset($row['codeName'], $row['radio_name'], $row['radio_share']);

                $export[$collectionCodeName][$codeName] = [
                    'radio' => $radioData,
                    'show' => $row
                ];
            }

            // if section, add it to collection
            if (isset($section)) {
                $export[$collectionCodeName][$codeName]['show']['sections'][] = $section;
            }
        }

        return $export;
    }

    /**
     * Get stats for each day of the last 7 days with total shows per radio
     * and the difference with the same day the week before
     *
     * @todo update to support subradios
     *
     * @throws \Exception
     */
    public function getStatsByDayAndRadio(): array
    {
        $dateTime = new \DateTime();
        $dateTimeOneWeek = clone $dateTime;
        $dateTimeOneWeek->add(\DateInterval::createfromdatestring('-6 day'));
        $dateTimeTwoWeeks = clone $dateTime;
        $dateTimeTwoWeeks->add(\DateInterval::createfromdatestring('-13 day'));

        $queryStr = <<<EOT
        WITH day_agg AS (
            select r.id as radio_id, r.code_name as radio_code_name,
               date_trunc('day', se.date_time_start at time zone 'UTC') as se_day,
               date_trunc('day', se.date_time_start at time zone 'UTC') + INTERVAL '7 day' as se_day_next,
           count(distinct se.id) as total,
           count(e.id) as sub_total
        
            from schedule_entry se
                inner join radio r on r.id = se.radio_id
                inner join sub_radio sr on se.sub_radio_id = sr.id
                left join section_entry e on se.id = e.schedule_entry_id
                
            where se.date_time_start <= :todayTime AT TIME ZONE 'UTC'
                and se.date_time_start >= :twoWeeksTime AT TIME ZONE 'UTC'
                and sr.main = true
        
            GROUP BY r.id, 3
        )
    
        SELECT date_trunc('day', dayrange)::date as day,
               r.code_name,
               COALESCE(da.total, 0) as total,
               COALESCE(da.sub_total, 0) as sub_total,
               COALESCE(pda.total, 0) prev_total,
               COALESCE(pda.sub_total, 0) prev_sub_total,
               (COALESCE(da.total, 0) - COALESCE(pda.total, 0)) as diff,
               (COALESCE(da.sub_total, 0) - COALESCE(pda.sub_total, 0)) as sub_diff
           
        FROM generate_series (:week::timestamp, :today::timestamp, '1 day'::interval) dayrange
               CROSS JOIN radio as r
               LEFT JOIN day_agg as da on da.se_day = dayrange and da.radio_id = r.id
               LEFT join day_agg pda on pda.se_day_next = da.se_day and pda.radio_id = da.radio_id
    
        where dayrange <= :today
                and dayrange >= :week
                and r.active = true
    
        ORDER BY r.share desc, r.code_name asc, day desc;
EOT;

        $rsm = new ResultSetMapping();
        $rsm->addScalarResult('day', 'day', 'string')
            ->addScalarResult('code_name', 'radio_code_name', 'string')
            ->addScalarResult('total', 'total', 'integer')
            ->addScalarResult('prev_total', 'prev_total', 'integer')
            ->addScalarResult('diff', 'diff', 'integer')
            ->addScalarResult('sub_total', 'section_total', 'integer')
            ->addScalarResult('prev_sub_section', 'prev_section_total', 'integer')
            ->addScalarResult('sub_diff', 'section_diff', 'integer');

        $query = $this->getEntityManager()->createNativeQuery($queryStr, $rsm);
        $query->setParameters(new ArrayCollection([
            new Parameter(':today', $dateTime->format(self::DAY_FORMAT)),
            new Parameter(':week', $dateTimeOneWeek->format(self::DAY_FORMAT)),
            new Parameter(':todayTime', $dateTime->format(self::DAY_FORMAT) . ' 23:29:59'),
            new Parameter(':twoWeeksTime', $dateTimeTwoWeeks->format(self::DAY_FORMAT) . ' 00:00:00')
        ]));

        $query->disableResultCache();
        $result = $query->getResult();

        $return = [];

        foreach ($result as $item) {
            $return[$item['radio_code_name']][] = $item;
        }

        return $return;
    }

    protected function hydrateSection(&$row): ?array
    {
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

    protected function getScheduleSelectString(): string
    {
        return 'r.codeName, se.title, se.host,se.description, se.pictureUrl as picture_url,'
            . 'AT_TIME_ZONE(se.dateTimeStart,\'UTC\') as start_at,'
            . 'AT_TIME_ZONE(se.dateTimeEnd,\'UTC\') as end_at, EXTRACT(se.dateTimeEnd, se.dateTimeStart) / 60 AS duration,'
            . 'MD5(CONCAT(r.codeName, se.title, se.dateTimeStart, sr.id)) as hash,'
            . 'CASE WHEN(AT_TIME_ZONE(se.dateTimeStart, \'UTC\') < :datetime_start) THEN 1 ELSE 0 END as start_overflow,'
            . 'CASE WHEN(AT_TIME_ZONE(se.dateTimeEnd, \'UTC\') > :datetime_end AND (HOUR(AT_TIME_ZONE(se.dateTimeEnd, \'UTC\')) <> 23 OR MINUTE(AT_TIME_ZONE(se.dateTimeEnd, \'UTC\')) <> 0)) THEN 1 ELSE 0 END as end_overflow,'
            . 'sc.title as section_title, sc.pictureUrl as section_picture_url, sc.presenter as section_presenter, sc.description as section_description,'
            . 'AT_TIME_ZONE(sc.dateTimeStart,\'UTC\') as section_start_at,'
            . 'MD5(CONCAT(CONCAT(r.codeName, se.id, se.title, se.dateTimeStart), sc.title, sc.dateTimeStart)) as section_hash';
    }

    protected function getSchedulesAndSections(ScheduleResource $scheduleResource): array {
        $dateTime = $scheduleResource->getDateTime();
        $dateTime->setTime(0, 0, 0);
        $dateTimeEnd = clone $dateTime;
        $dateTimeEnd->add(\DateInterval::createfromdatestring('+1 day'));

        $qb = $this->getEntityManager()->createQueryBuilder();
        $qb->select($this->getScheduleSelectString()        )
            ->from(ScheduleEntry::class, 'se')
            ->innerJoin('se.radio', 'r')
            ->leftJoin('se.sectionEntries', 'sc')
            ->leftJoin('se.subRadio', 'sr')
            ->where(
                '(TIMEZONE(\'UTC\', se.dateTimeStart) >= :datetime_start AND TIMEZONE(\'UTC\', se.dateTimeStart) < :datetime_end)'
                . 'OR (TIMEZONE(\'UTC\', se.dateTimeEnd) > :datetime_start AND TIMEZONE(\'UTC\', se.dateTimeEnd) <= :datetime_end)')
            ->andWhere('r.active = :active')
            ->addOrderBy('se.dateTimeStart', 'ASC')
            ->addOrderBy('sc.dateTimeStart', 'ASC')
        ;

        $qb->setParameters(new ArrayCollection([
            new Parameter('datetime_start', $dateTime),
            new Parameter('datetime_end', $dateTimeEnd),
            new Parameter('active',true)
        ]));

        if ($scheduleResource->getType() === ScheduleResource::TYPE_RADIO) {
            $qb->andWhere('r.codeName = :radio')
                ->setParameter('radio', $scheduleResource->getValue());

            if ($scheduleResource->getSubValue() !== null) {
                $qb->andWhere('sr.id = :subRadioId')
                    ->setParameter('subRadioId', $scheduleResource->getSubValue()->getId());
            } else {
                $qb->andWhere('sr.main = true');
            }
        } elseif ($scheduleResource->getType() === ScheduleResource::TYPE_RADIOS) {
            $qb->andWhere('r.codeName IN (:radios)')
                ->andWhere('sr.main = true')
                ->setParameter('radios', $scheduleResource->getValue());
        } elseif ($scheduleResource->getType() === ScheduleResource::TYPE_COLLECTION) {
            $qb->innerJoin('r.collection', 'c')
                ->andWhere('c.codeName = :collection')
                ->andWhere('sr.main = true')
                ->setParameter('collection', $scheduleResource->getValue());
        }

        $query = $qb->getQuery();
        $query->disableResultCache();  // rely on app schedule cache and only get fresh data here
        return $query->getResult();
    }

    protected function getTimeSpecificSchedulesAndSections(\DateTime $dateTime, ?array $radios = null): array {
        $dateTimeStart = clone $dateTime;
        $dateTimeStart->setTime(0, 0, 0);
        $dateTimeEnd = clone $dateTime;
        $dateTimeEnd->add(\DateInterval::createfromdatestring('+1 day'));

        $qb = $this->getEntityManager()->createQueryBuilder();
        $qb->select($this->getScheduleSelectString())
            ->addSelect('r.name as radio_name, r.share as radio_share, rs.name as radio_stream_name, rs.url as streaming_url, c.codeName as collectionCodeName')
            ->from(ScheduleEntry::class, 'se')
            ->innerJoin('se.radio', 'r')
            ->innerJoin('se.subRadio', 'sr')
            ->leftJoin('r.streams', 'rs')
            ->innerJoin('r.collection', 'c')
            ->leftJoin('se.sectionEntries', 'sc')
            ->where('AT_TIME_ZONE(se.dateTimeStart, \'UTC\') <= :datetime')
            ->andWhere('AT_TIME_ZONE(se.dateTimeEnd, \'UTC\') >= :datetime')
            ->andWhere('r.active = :active')
            ->andWhere('rs.main = TRUE AND rs.enabled = TRUE')
            ->addOrderBy('r.share', 'DESC')
            ->addOrderBy('r.codeName', 'ASC')
            ->addOrderBy('se.dateTimeStart', 'ASC')
            ->addOrderBy('sc.dateTimeStart', 'ASC')
        ;

        $qb->setParameters(new ArrayCollection([
            new Parameter('datetime', $dateTime),
            new Parameter('datetime_start', $dateTimeStart),
            new Parameter('datetime_end', $dateTimeEnd),
            new Parameter('active', true)
        ]));

        if (!empty($radios)) {
            $qb->andWhere('r.codeName IN (:radios)');
            $qb->setParameter('radios', $radios);
        }

        return $qb->getQuery()->getResult();
    }
}
