<?php

declare(strict_types=1);

namespace App\Twig;

use App\Entity\Affiliate;
use Doctrine\ORM\EntityManagerInterface;
use Twig\Extension\RuntimeExtensionInterface;

class AffiliateRuntime implements RuntimeExtensionInterface
{
    /** @var EntityManagerInterface */
    protected $em;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->em = $entityManager;
    }

    public function oneAffiliateLink($locale)
    {
        $result = $this->em->getRepository(Affiliate::class)->getOneAffiliate($locale);

        if ($result !== null && is_array($result)) {
            return $result['htmlLink'];
        }

        return null;
    }
}
