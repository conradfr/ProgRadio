<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\ListeningSession;
use App\Entity\Radio;
use App\Entity\Stream;
use App\Entity\User;
use App\Service\DateUtils;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\QueryBuilder;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\ORM\Query\ResultSetMapping;

class ListeningSessionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Radio::class);
    }

    public function getRadiosData($startDate, $endDate=null, ?string $countryCode=null): array
    {
        $qb = $this->getEntityManager()->createQueryBuilder();

        $qb->select('r.id, r.codeName, r.name, c.id as c_id, c.codeName as c_codeName,'
                . 'COALESCE(SUM(EXTRACT(ls.dateTimeEnd, ls.dateTimeStart)), 0) as total_seconds, COALESCE(COUNT(DISTINCT ls.id), 0) as total_sessions')
            ->from(Radio::class, 'r')
            ->innerJoin('r.collection', 'c')
            ->leftJoin('r.streams', 'rs')
            ->leftJoin('rs.listeningSessions', 'ls')
            ->groupBy('r.id, c.id')
            ->addOrderBy('total_seconds', 'DESC');

        $this->addDates($qb, $startDate, $endDate);
        $this->addCountryCode($qb, 'r', $countryCode);

        $query = $qb->getQuery();
        $query->disableResultCache();

        return $query->getResult();
    }

    public function getPerDeviceData($startDate, $endDate=null, $type='radio'): array
    {
        $qb = $this->getEntityManager()->createQueryBuilder();

        $qb->select('ls.source,'
            . 'COALESCE(SUM(EXTRACT(ls.dateTimeEnd, ls.dateTimeStart)), 0) as total_seconds, COALESCE(COUNT(DISTINCT ls.id), 0) as total_sessions')
            ->from(ListeningSession::class, 'ls')
            ->groupBy('ls.source')
            ->addOrderBy('total_seconds', 'DESC');

        $this->addDates($qb, $startDate, $endDate);

        $qb->andWhere('ls.source IS NOT NULL');

        if ($type === 'radio') {
            $qb->andWhere('ls.stream IS NULL');
        } else {
            $qb->andWhere('ls.radioStream IS NULL');
        }

        $query = $qb->getQuery();
        $query->disableResultCache();

        $result = $query->getResult();

        return array_column($result, null, 'source');
    }

    public function getStreamsData($startDate, $endDate=null, ?string $countryCode=null): array
    {
        $qb = $this->getEntityManager()->createQueryBuilder();

        $qb->select('s.id, s.name, s.img, s.countryCode as country_code, r.codeName as radio_code_name, s.enabled, CASE WHEN(rd.id is not null) THEN 1 ELSE 0 END as redirect_to,'
            . 'COALESCE(SUM(EXTRACT(ls.dateTimeEnd, ls.dateTimeStart)), 0) as total_seconds, COALESCE(COUNT(DISTINCT ls.id), 0) as total_sessions')
            ->from(Stream::class, 's')
            ->leftJoin('s.radioStream', 'rs')
            ->leftJoin('s.redirectToStream', 'rd')
            ->leftJoin('rs.radio', 'r')
            ->leftJoin('s.listeningSessions', 'ls')
            ->groupBy('s.id, r.codeName, rd.id')
            ->addOrderBy('total_seconds', 'DESC');

        $this->addDates($qb, $startDate, $endDate);
        $this->addCountryCode($qb, 's', $countryCode);

        $query = $qb->getQuery();
        $query->disableResultCache();

        return $query->getResult();
    }

    protected function addDates(QueryBuilder $qb, \DateTime $startDate, ?\DateTime $endDate = null): void
    {
        if ($endDate === null) {
            $qb->where('DATE(AT_TIME_ZONE(AT_TIME_ZONE(ls.dateTimeStart, \'UTC\'), \'Europe/Paris\')) = DATE(:startDate)');
            $qb->setParameter('startDate', $startDate);
        } else {
            $qb->where('(DATE(AT_TIME_ZONE(AT_TIME_ZONE(ls.dateTimeStart, \'UTC\'), \'Europe/Paris\')) >= DATE(:startDate)'
                . ' AND DATE(AT_TIME_ZONE(AT_TIME_ZONE(ls.dateTimeStart, \'UTC\'), \'Europe/Paris\')) <= DATE(:endDate))');

            $qb->setParameters([
                'startDate' => $startDate,
                'endDate'=> $endDate
            ]);
        }
    }

    protected function addCountryCode(QueryBuilder $qb, string $entityShorts, ?string $countyCode=null): void
    {
        if ($countyCode === null) {
            return;
        }

        $qb->andWhere($entityShorts . '.countryCode = :countryCode')
           ->setParameter('countryCode', strtoupper($countyCode));
    }

    public function getCurrent()
    {
        $baseResults = [
            'seo' => [
                'total_radios' => 0,
                'total_streams' => 0,
                'list_radios' => [],
                'list_streams' => []
            ],
            'web' => [
                'total_radios' => 0,
                'total_streams' => 0,
                'list_radios' => [],
                'list_streams' => []
            ],
            'android' => [
                'total_radios' => 0,
                'total_streams' => 0,
                'list_radios' => [],
                'list_streams' => []
            ]
        ];

        $sql = "
            select ls.source,
                    COALESCE(SUM(ls.total_radios), 0) as total_radios,
                    COALESCE(SUM(ls.total_streams), 0) as total_streams,
                    COALESCE(json_agg(json_build_object('radio', ls.code_name, 'total', ls.total_radios))
                        FILTER (WHERE ls.code_name IS NOT NULL), '[]') as list_radios,
                    COALESCE(json_agg(json_build_object('stream', ls.stream_id, 'total', ls.total_streams))
                        FILTER (WHERE ls.stream_id IS NOT NULL), '[]') as list_streams
            FROM (
                    select ls.source, r.code_name, count(r.id) as total_radios, s.id as stream_id, count(s.id) as total_streams
                    from listening_session ls
                    left join radio_stream rs on ls.radio_stream_id = rs.id
                    left join radio r on rs.radio_id = r.id
                    left join stream s on ls.stream_id = s.id
                     WHERE ls.date_time_end > (now() at time zone 'utc' - interval '32 second')
                       AND ls.date_time_end < (now() at time zone 'utc' + interval '32 second')
                     GROUP BY ls.source, r.code_name, s.id
            ) ls
            GROUP BY ls.source
        ";

        $rsm = new ResultSetMapping();
        $rsm->addScalarResult('total_radios', 'total_radios', 'integer')
            ->addScalarResult('total_streams', 'total_streams', 'integer')
            ->addScalarResult('list_radios', 'list_radios', 'string')
            ->addScalarResult('list_streams', 'list_streams', 'string')
            ->addScalarResult('source', 'source', 'string');

        $query = $this->getEntityManager()->createNativeQuery($sql, $rsm);
        $query->disableResultCache();

        $result = $query->getResult();
        $resultIndexed = array_merge($baseResults, array_column($result, null, 'source'));

        foreach ($resultIndexed as &$row) {
            $jsonRadios = is_array($row['list_radios']) ? $row['list_radios'] : json_decode((string) $row['list_radios'], null, 512, JSON_THROW_ON_ERROR);
            $jsonStreams = is_array($row['list_streams']) ? $row['list_streams'] : json_decode((string) $row['list_streams'], null, 512, JSON_THROW_ON_ERROR);
            $row['list_radios'] =  array_column($jsonRadios, 'total', 'radio');
            $row['list_streams'] = array_column($jsonStreams, 'total', 'stream');
        }

        return $resultIndexed;
    }
}
