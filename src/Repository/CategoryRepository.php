<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Category;
use Doctrine\ORM\EntityRepository;

class CategoryRepository extends EntityRepository
{
    protected const CACHE_CATEGORY_TTL = 604800; // week

    public function getCategories(): array {
        $query = $this->getEntityManager()->createQuery(
            'SELECT c.codeName as code_name, c.name_fr as name_FR, c.name_en as name_EN, c.name_es as name_ES, c.name_de as name_DE, c.name_pt as name_PT, c.name_it as name_IT, c.name_pl as name_PL, c.name_el as name_EL
                FROM ' . Category::class . ' c
                ORDER BY c.id asc
            '
        );

        $query->enableResultCache(self::CACHE_CATEGORY_TTL, 'categories');
        return $query->getResult();
    }
}
