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
                    'id' => $row['radio_id'],
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
     * @throws \Exception
     */
    public function getSubRadiosWithNoSchedule(): array
    {
        $datetime = new \DateTime();
        $dayStart = (clone $datetime)->setTime(0, 0, 0)->format('Y-m-d H:i:s');
        $dayEnd   = (clone $datetime)->setTime(0, 0, 0)->modify('+1 day')->format('Y-m-d H:i:s');

        $queryStr = <<<EOT
        SELECT s.id, s.name, s.radio_stream_code_name, r.code_name

        FROM stream s
            INNER JOIN radio AS r ON r.id = s.radio_id

        WHERE s.is_sub_radio = TRUE
            AND r.active = TRUE
            AND s.enabled = TRUE
            AND NOT EXISTS (
                SELECT 1 FROM schedule_entry se
                WHERE se.stream_id = s.id
                    AND se.date_time_start >= :day_start
                    AND se.date_time_start < :day_end
            )

        ORDER BY s.name ASC;
EOT;

        $rsm = new ResultSetMapping();
        $rsm->addScalarResult('id', 'id', 'string')
            ->addScalarResult('name', 'name', 'string')
            ->addScalarResult('radio_stream_code_name', 'radio_stream_code_name', 'string')
            ->addScalarResult('code_name', 'code_name', 'string');

        $query = $this->getEntityManager()->createNativeQuery($queryStr, $rsm);
        $query->setParameters(new ArrayCollection([
            new Parameter(':day_start', $dayStart),
            new Parameter(':day_end',   $dayEnd),
        ]));

        $query->disableResultCache();

        return $query->getResult();
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
            . 'MD5(CONCAT(r.codeName, se.title, se.dateTimeStart, r.codeName)) as hash,'
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
            ->leftJoin('se.stream', 's')
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

            if ($scheduleResource->getStreamValue() !== null) {
                $qb->andWhere('s.id = :streamId')
                    ->setParameter('streamId', $scheduleResource->getStreamValue()->getId());
            } else {
                $qb->andWhere('s.isMainRadio = true');
            }
        } elseif ($scheduleResource->getType() === ScheduleResource::TYPE_RADIOS) {
            $qb->andWhere('r.codeName IN (:radios)')
                ->andWhere('s.isMainRadio = true')
                ->setParameter('radios', $scheduleResource->getValue());
        } elseif ($scheduleResource->getType() === ScheduleResource::TYPE_COLLECTION) {
            $qb->innerJoin('r.collection', 'c')
                ->andWhere('c.codeName = :collection')
                ->andWhere('s.isMainRadio = true')
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
            ->addSelect('r.name as radio_name, r.share as radio_share, s.name as radio_stream_name, s.id as radio_id, s.streamUrl as streaming_url, c.codeName as collectionCodeName')
            ->from(ScheduleEntry::class, 'se')
            ->innerJoin('se.radio', 'r')
            ->innerJoin('se.stream', 's')
            ->innerJoin('r.collection', 'c')
            ->leftJoin('se.sectionEntries', 'sc')
            ->where('AT_TIME_ZONE(se.dateTimeStart, \'UTC\') <= :datetime')
            ->andWhere('AT_TIME_ZONE(se.dateTimeEnd, \'UTC\') >= :datetime')
            ->andWhere('r.active = :active')
            ->andWhere('s.isMainRadio = TRUE AND s.enabled = TRUE')
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
