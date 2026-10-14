<?php

declare(strict_types=1);

namespace App\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class GenresExtension extends AbstractExtension
{
    public function getFunctions(): array
    {
        return [
            new TwigFunction('genre_list', [GenresRuntime::class, 'list'])
        ];
    }
}
