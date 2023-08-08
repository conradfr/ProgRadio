<?php

declare(strict_types=1);

namespace App\Twig;

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
