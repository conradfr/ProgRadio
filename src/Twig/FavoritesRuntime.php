<?php

declare(strict_types=1);

namespace App\Twig;

use App\Entity\Collection;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\ParameterBag;
use Twig\Extension\RuntimeExtensionInterface;

class FavoritesRuntime implements RuntimeExtensionInterface
{
    /** @var EntityManagerInterface */
    protected $em;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->em = $entityManager;
    }

    public function scheduleCollections($user, ParameterBag $requestAttributes)
    {
        $favorites = $requestAttributes->get('favorites', []);

        return $this->em->getRepository(Collection::class)->getCollections($favorites);
    }
}
