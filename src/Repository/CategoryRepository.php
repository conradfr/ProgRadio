<?php

declare(strict_types=1);

namespace App\Repository;

use Doctrine\ORM\EntityRepository;

class CategoryRepository extends EntityRepository
{
    protected const CACHE_CATEGORY_TTL = 604800; // week

    public function getCategories(): array {
        $query = $this->getEntityManager()->createQuery(
            'SELECT c.codeName as code_name, c.name as name_FR
                FROM App:Category c
                ORDER BY c.id asc
            '
        );

        $query->enableResultCache(self::CACHE_CATEGORY_TTL, 'categories');
        return $query->getResult();
    }
}
