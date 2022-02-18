<?php

declare(strict_types=1);

namespace App\Twig;

use App\Service\RadioBrowser;
use Twig\Extension\RuntimeExtensionInterface;

class CountriesRuntime implements RuntimeExtensionInterface
{
    public function __construct(protected RadioBrowser $radioBrowser) { }

    public function list(string $locale): array
    {
        return $this->radioBrowser->getCountries($locale);
    }
}
