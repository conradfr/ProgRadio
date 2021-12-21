<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Affiliate;
use Doctrine\ORM\EntityRepository;

class AffiliateRepository extends EntityRepository
{
   public function getOneAffiliate(string $locale)
   {
        $qb = $this->getEntityManager()->createQueryBuilder();

        $qb->select("a.htmlLink")
            ->from( Affiliate::class, 'a')
            ->where("a.locale = :locale")
            ->orderBy('RANDOM()')
            ->setMaxResults(1);

        $qb->setParameter('locale', $locale);

        $query = $qb->getQuery();
        return $query->getOneOrNullResult();
    }
}
