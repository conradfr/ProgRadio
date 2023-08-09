<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\RadioStream;
use Doctrine\ORM\EntityRepository;

class RadioStreamRepository extends EntityRepository
{
    protected const CACHE_TTL = 604800; // week
    protected const CACHE_ID = 'enabled_radios_streams';

    public function getStreamsOfRadios(array $ids): array
    {
        $query = $this->getEntityManager()->createQuery(
            "SELECT rs.id, r.codeName as radio_code_name, rs.currentSong as current_song, rs.codeName as code_name, rs.name, rs.url, rs.main
                FROM " . RadioStream::class . " rs
                  INNER JOIN rs.radio r
                WHERE rs.enabled = :enabled
                  AND r.id IN (:radioIds)
                ORDER BY rs.name ASC
            "
        );

        $query->setParameters([
            'enabled' => true,
            'radioIds' => $ids
        ]);

        $query->enableResultCache(self::CACHE_TTL, self::CACHE_ID);
        return $query->getResult();
    }

    public function getStreamsStatus(): array
    {
        $qb = $this->createQueryBuilder('rs')
            ->select('rs.id, rs.codeName, rs.name, rs.enabled, rs.status, rs.retries, rs.url, r.codeName as radio_code_name')
            ->innerJoin('rs.radio', 'r')
            ->where('r.active = :active')
            ->orderBy('rs.retries', 'DESC');

        $qb->setParameter('active', true);

        $query = $qb->getQuery();
        $query->disableResultCache();
        return $query->getResult();
    }

    public function getCurrentSongStatus(): array
    {
        $qb = $this->createQueryBuilder('rs')
            ->select('rs.id, rs.codeName, rs.name, rs.enabled, rs.currentSongRetries, rs.url, r.codeName as radio_code_name')
            ->innerJoin('rs.radio', 'r')
            ->where('r.active = :active')
            ->andWhere('rs.currentSongRetries > 0')
            ->orderBy('rs.currentSongRetries', 'DESC');

        $qb->setParameter('active', true);

        $query = $qb->getQuery();
        $query->disableResultCache();
        return $query->getResult();
    }
}
