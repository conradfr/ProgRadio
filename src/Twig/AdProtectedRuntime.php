<?php

declare(strict_types=1);

namespace App\Twig;

use App\Service\Ip2Country;
use Symfony\Component\HttpFoundation\Request;
use Twig\Extension\RuntimeExtensionInterface;

class AdProtectedRuntime implements RuntimeExtensionInterface
{
    public function __construct(protected Ip2Country $ip2Country) { }

    public function isAdProtected(Request $request): bool
    {
        return true;
        //return $this->ip2Country->isProtected($request);
    }
}
