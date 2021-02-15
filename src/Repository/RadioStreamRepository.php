<?php

declare(strict_types=1);

namespace App\Repository;

use Doctrine\ORM\EntityRepository;

class RadioStreamRepository extends EntityRepository
{
    protected const CACHE_TTL = 604800; // week
    protected const CACHE_ID = 'enabled_radios_streams';

    public function getStreamsOfRadios(array $ids): array {
        $query = $this->getEntityManager()->createQuery(
            "SELECT rs.id, r.codeName as radio_code_name, rs.codeName as code_name, rs.name, rs.url, rs.main
                FROM App:RadioStream rs
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
}