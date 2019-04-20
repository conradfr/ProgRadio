<?php

namespace App\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * CategoryRepository
 */
class CategoryRepository extends EntityRepository
{
    protected const CACHE_CATEGORY_TTL = 604800; // week

    /**
     * @return array
     */
    public function getCategories(): array {
        $query = $this->getEntityManager()->createQuery(
            'SELECT c.codeName as code_name, c.name as name_FR
                FROM App:Category c
                ORDER BY c.id asc
            '
        );

        $query->useResultCache(true, self::CACHE_CATEGORY_TTL, 'categories');
        return $query->getResult();
    }
}
