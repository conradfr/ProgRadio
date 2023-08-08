<?php

declare(strict_types=1);

namespace App\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class AffiliateExtension extends AbstractExtension
{
    public function getFunctions(): array
    {
        return [
            new TwigFunction('oneAffiliateLink', [AffiliateRuntime::class, 'oneAffiliateLink'])
        ];
    }
}
