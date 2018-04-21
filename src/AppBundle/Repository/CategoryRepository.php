<?php

namespace AppBundle\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * CategoryRepository
 */
class CategoryRepository extends EntityRepository
{
    protected const CACHE_CATEGORY_TTL = 86400; // day

    /**
     * @return array
     */
    public function getCategories() {
        $query = $this->getEntityManager()->createQuery(
            'SELECT c.codeName as code_name, c.name as name_FR
                FROM AppBundle:Category c
                ORDER BY c.id asc
            '
        );

        $query->useResultCache(true, self::CACHE_CATEGORY_TTL, 'categories');
        $result = $query->getResult();

        return $result;
    }
}
