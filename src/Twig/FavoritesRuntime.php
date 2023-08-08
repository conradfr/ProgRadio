<?php

declare(strict_types=1);

namespace App\Twig;

use App\Entity\Collection;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\ParameterBag;
use Twig\Extension\RuntimeExtensionInterface;

class FavoritesRuntime implements RuntimeExtensionInterface
{
    public function __construct(protected EntityManagerInterface $em) { }

    public function scheduleCollections($user, ParameterBag $requestAttributes)
    {
        $favorites = $requestAttributes->get('favorites', []);

        return $this->em->getRepository(Collection::class)->getCollections($favorites);
    }
}
