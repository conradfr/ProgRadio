<?php

declare(strict_types=1);

namespace App\Twig;

use App\Twig\AppRuntime;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class FavoritesExtension extends AbstractExtension
{
    public function getFunctions(): array
    {
        return [
            new TwigFunction('scheduleCollections', [FavoritesRuntime::class, 'scheduleCollections'])
        ];
    }
}
