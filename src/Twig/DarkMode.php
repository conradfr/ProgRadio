<?php

declare(strict_types=1);

namespace App\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class DarkMode extends AbstractExtension
{
    public const DARK_MODE_START_HOUR = 22;
    public const DARK_MODE_END_HOUR = 6;

    protected const COOKIE_NAME = 'progradio-darkmode';

    public function getFunctions()
    {
        return [
            new TwigFunction('isDarkModeTime', [$this, 'isDarkModeTime']),
        ];
    }

    public function isDarkModeTime() : bool
    {
        $now = new \DateTime();
        $hour = (int) $now->format('H');

        if (isset($_COOKIE[self::COOKIE_NAME])) {
            return $_COOKIE[self::COOKIE_NAME] === '1';
        }

        return $hour >= self::DARK_MODE_START_HOUR || $hour < self::DARK_MODE_END_HOUR;
    }
}
