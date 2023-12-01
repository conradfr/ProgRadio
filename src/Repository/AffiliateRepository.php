<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Affiliate;
use Doctrine\ORM\EntityRepository;

class AffiliateRepository extends EntityRepository
{
   private const locales = ['fr', 'en', 'es', 'de'];

   public function getOneAffiliate(string $locale)
   {
       if (!in_array($locale,  self::locales)) {
           return null;
       }

       $qb = $this->getEntityManager()->createQueryBuilder();

       $qb->select('a.htmlLink, a.base64img, a.text_'. $locale . ' as locale_text')
            ->from( Affiliate::class, 'a')
            ->where('a.text_'. $locale . ' IS NOT NULL')
            ->orderBy('RANDOM()')
            ->setMaxResults(1);

       $query = $qb->getQuery();

       return $query->getOneOrNullResult();
    }
}
