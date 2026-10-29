<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Category;
use Doctrine\ORM\EntityRepository;

class CategoryRepository extends EntityRepository
{
    protected const int CACHE_CATEGORY_TTL = 604800; // week

    public function getCategories(): array {
        $query = $this->getEntityManager()->createQuery(
            'SELECT c.codeName as code_name, c.name_fr as name_FR, c.name_en as name_EN, c.name_es as name_ES, c.name_de as name_DE, c.name_pt as name_PT, c.name_it as name_IT, c.name_pl as name_PL, c.name_el as name_EL, c.name_ar as name_AR, c.name_ro as name_RO, c.name_hu as name_HU, c.name_tr as name_TR, c.name_nl as name_NL, c.name_da as name_DA, c.name_sv as name_SV, c.name_ru as name_RU, c.name_he as name_HE, c.name_bg as name_BG
                FROM ' . Category::class . ' c
                ORDER BY c.id asc
            '
        );

        $query->enableResultCache(self::CACHE_CATEGORY_TTL, 'categories');
        return $query->getResult();
    }
}
