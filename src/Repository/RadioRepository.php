<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Radio;
use Doctrine\ORM\EntityRepository;

class RadioRepository extends EntityRepository
{
    protected const CACHE_RADIO_TTL = 604800; // week

    public function getActiveRadios(array $favorites = []): array {
        $query = $this->getEntityManager()->createQuery(
            'SELECT r.codeName as code_name, r.name, r.streamingUrl as streamUrl,
                    r.streamingUrl, r.share, r.streamingEnabled as streaming_enabled,
                    c.codeName as category, cl.codeName as collection
                FROM App:Radio r
                  INNER JOIN r.category c
                  INNER JOIN r.collection cl
                WHERE r.active = :active
            '
        );

        $query->setParameter('active', true);

        $query->enableResultCache(self::CACHE_RADIO_TTL, 'active_radios');

        $results = $query->getResult();

        /* @todo it works for now for favorites, but need real many-to-many if developed further */
        $withCollectionAsArray = array_map(function($radio) use ($favorites) {
            $radio['collection'] = [$radio['collection']];
            if (in_array($radio['code_name'], $favorites)) {
                $radio['collection'][] = Radio::FAVORITES;
            }
            return $radio;
        }, $results);

        return $withCollectionAsArray;
    }

    public function getAllCodename($filterbyActive = true): array {
        $queryString = 'SELECT r.codeName' . PHP_EOL
                        . 'FROM App:Radio r' . PHP_EOL;

        if ($filterbyActive) {
            $queryString .= ' WHERE r.active = TRUE'.PHP_EOL;
        }

        $query = $this->getEntityManager()->createQuery(
            $queryString
        );

        $query->setResultCacheLifetime(self::CACHE_RADIO_TTL);
        $result = $query->getResult();

       return array_column($result, 'codeName');
    }

    public function getNameAndShares(): array
    {
        $qb = $this->getEntityManager()->createQueryBuilder();

        $qb->select('r.id, r.codeName, r.name, r.share')
            ->from('App:Radio', 'r')
            ->addOrderBy('r.share', 'DESC')
            ->addOrderBy('r.codeName', 'ASC');

        return $qb->getQuery()->getResult();
    }
}
