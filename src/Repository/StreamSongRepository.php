<?php

declare(strict_types=1);

namespace App\Repository;

use Doctrine\ORM\EntityRepository;

class StreamSongRepository extends EntityRepository
{
    public function getCurrentSongStatus(): array
    {
        $qb = $this->createQueryBuilder('ss')
            ->select('s.id, s.name, s.img, ss.retries')
            ->innerJoin('ss.streams', 's')
            ->where('ss.enabled = :active')
            ->andWhere('ss.retries > 0')
            ->orderBy('ss.retries', 'DESC')
            ->addOrderBy('s.votes', 'DESC');

        $qb->setParameter('active', true);

        $query = $qb->getQuery();
        $query->disableResultCache();
        return $query->getResult();
    }
}
