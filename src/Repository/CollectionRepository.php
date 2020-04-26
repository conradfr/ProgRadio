<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Radio;
use Doctrine\ORM\EntityRepository;

class CollectionRepository extends EntityRepository
{
    protected const CACHE_COLLECTION_TTL = 604800; // week
    protected const CACHE_COLLECTION_ID = 'collections';

    public function getCollections(array $favorites = []): array {
        $query = $this->getEntityManager()->createQuery(
            'SELECT c.codeName as code_name, c.name as name_FR, c.shortName as short_name, 
                c.priority, c.sortField as sort_field, c.sortOrder as sort_order,
                COUNT(DISTINCT r.id) as radio_count
                FROM App:Collection c
                LEFT JOIN c.radios r
                GROUP BY c.id, c.priority
                ORDER BY c.priority asc, c.id asc
            '
        );

        $query->enableResultCache( self::CACHE_COLLECTION_TTL, self::CACHE_COLLECTION_ID);

        $results = $query->getResult();

        /* @todo it works for now for favorites, but need real many-to-many if developed further */
        foreach ($results as &$collection) {
            if ($collection['code_name'] === Radio::FAVORITES) {
                $collection['radio_count'] = count($favorites);
                break;
            }
        }

        return $results;
    }
}
