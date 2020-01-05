<?php

namespace App\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * CollectionRepository
 */
class CollectionRepository extends EntityRepository
{
    protected const CACHE_COLLECTION_TTL = 604800; // week

    /**
     * @return array
     */
    public function getCollections(): array {
        $query = $this->getEntityManager()->createQuery(
            'SELECT c.codeName as code_name, c.name as name_FR, 
                c.priority, c.sort_field, c.sort_order
                FROM App:Collection c
                ORDER BY c.priority asc, c.id asc
            '
        );

        $query->enableResultCache( self::CACHE_COLLECTION_TTL, 'collections');
        return $query->getResult();
    }
}
