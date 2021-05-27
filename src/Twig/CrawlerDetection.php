<?php

declare(strict_types=1);

namespace App\Twig;

use Symfony\Component\HttpFoundation\Request;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;
use Jaybizzle\CrawlerDetect\CrawlerDetect;

class CrawlerDetection extends AbstractExtension
{
    public function getFunctions()
    {
        return [
            new TwigFunction('isCrawler', [$this, 'isCrawler']),
        ];
    }

    public function isCrawler($userAgent) : bool
    {
        $CrawlerDetect = new CrawlerDetect();
        return $CrawlerDetect->isCrawler($userAgent);
    }
}
