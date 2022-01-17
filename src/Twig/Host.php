<?php

declare(strict_types=1);

namespace App\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;
use Symfony\Component\HttpFoundation\Request;

class Host extends AbstractExtension
{
    public function __construct(protected \App\Service\Host $host) { }

    public function getFunctions(): array
    {
        return [
            new TwigFunction('getField', [$this, 'getField']),
            new TwigFunction('getDomainName', [$this, 'getName']),
            new TwigFunction('getDomainRootDomain', [$this, 'getRootDomain']),
            new TwigFunction('isProgRadio', [$this, 'isProgRadio']),
        ];
    }

    public function getField(string $field, Request $request): string
    {
        return $this->host->getField($field, $request);
    }

    public function getName(Request $request): string
    {
        return $this->host->getName($request);
    }

    public function getRootDomain(Request $request): string
    {
        return $this->host->getRootDomain($request);
    }

    public function isProgRadio(Request $request): bool
    {
        return $this->host->isProgRadio($request);
    }

}
