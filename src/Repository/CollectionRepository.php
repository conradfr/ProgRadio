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
    public function getCollections() {
        $query = $this->getEntityManager()->createQuery(
            'SELECT c.codeName as code_name, c.name as name_FR, c.priority
                FROM App:Collection c
                ORDER BY c.priority asc, c.id asc
            '
        );

        $query->useResultCache(true, self::CACHE_COLLECTION_TTL, 'collections');
        $result = $query->getResult();

        return $result;
    }
}
