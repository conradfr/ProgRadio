<?php

declare(strict_types=1);

namespace App\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

/*
 * This extracts the Capistrano release version from the file path
 * This allows to invalid assets cache after a new release
 */
class ReleaseVersion extends AbstractExtension
{
    protected const DEFAULT_VERSION = 'progradio';

    public function getFunctions()
    {
        return [
            new TwigFunction('releaseVersion', [$this, 'releaseVersion']),
        ];
    }

    public function releaseVersion()
    {
        preg_match('/releases\/(\d{1,})\/public/', $_SERVER['SCRIPT_FILENAME'], $matches);

        return isset($matches[1]) ? $matches[1] : self::DEFAULT_VERSION . random_int(0, 2);
    }
}
