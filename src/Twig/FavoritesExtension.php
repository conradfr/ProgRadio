<?php

declare(strict_types=1);

namespace App\Twig;

use App\Twig\AppRuntime;
use App\Entity\Collection;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\ParameterBag;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class FavoritesExtension extends AbstractExtension
{
    public function getFunctions()
    {
        return [
            new TwigFunction('scheduleCollections', [FavoritesRuntime::class, 'scheduleCollections']),
            new TwigFunction('hasStreamFavorites', [FavoritesRuntime::class, 'hasStreamFavorites']),
        ];
    }
}
