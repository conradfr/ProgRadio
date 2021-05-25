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
use Symfony\Component\Security\Core\Security;

class ListeningSessionRepository extends ServiceEntityRepository
{
    private $security;

    public function __construct(Security $security, ManagerRegistry $registry)
    {
        parent::__construct($registry, Radio::class);

        // Avoid calling getUser() in the constructor: auth may not
        // be complete yet. Instead, store the entire Security object.
        $this->security = $security;
    }

    public function getRadiosData($startDate, $endDate=null): array
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

        return $qb->getQuery()->getResult();
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

        $result = $qb->getQuery()->getResult();

        return array_column($result, null, 'source');
    }

    public function getStreamsData($startDate, $endDate=null): array
    {
        $qb = $this->getEntityManager()->createQueryBuilder();

        $qb->select('s.id, s.name, s.img, r.codeName as radio_code_name,'
            . 'COALESCE(SUM(EXTRACT(ls.dateTimeEnd, ls.dateTimeStart)), 0) as total_seconds, COALESCE(COUNT(DISTINCT ls.id), 0) as total_sessions')
            ->from(Stream::class, 's')
            ->leftJoin('s.radioStream', 'rs')
            ->leftJoin('rs.radio', 'r')
            ->leftJoin('s.listeningSessions', 'ls')
            ->groupBy('s.id, r.codeName')
            ->addOrderBy('total_seconds', 'DESC');

        $this->addDates($qb, $startDate, $endDate);

        return $qb->getQuery()->getResult();
    }

    protected function addDates(QueryBuilder $qb, \DateTime $startDate, \DateTime $endDate=null): void
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
}
