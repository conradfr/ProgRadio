<?php

declare(strict_types=1);

namespace App\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;

class ShortIdExtension extends AbstractExtension
{
    public function getFilters()
    {
        return [
            new TwigFilter('shortid', [ShortIdRuntime::class, 'shortId']),
        ];
    }
}
