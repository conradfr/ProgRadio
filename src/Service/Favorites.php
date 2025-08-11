<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Radio;
use Symfony\Component\HttpFoundation\Request;

class Favorites
{
    protected const string COOKIE_PREFIX = 'progradio_v4-';
    protected const string COOKIE_STREAM_SUFFIX = '_streams';
    protected const string COOKIE_DELIMITER = '|';

    public static function getFavoriteRadios(Request $request): array
    {
        $favoritesRaw = $request->cookies->get(self::COOKIE_PREFIX . Radio::FAVORITES, '');
        return empty($favoritesRaw) ? [] : array_filter(explode(self::COOKIE_DELIMITER, $favoritesRaw));
    }

    public static function getFavoriteStreams(Request $request): array
    {
        $favoritesRaw = $request->cookies->get(self::COOKIE_PREFIX . Radio::FAVORITES . self::COOKIE_STREAM_SUFFIX, '');
        return empty($favoritesRaw) ? [] : array_filter(explode(self::COOKIE_DELIMITER, $favoritesRaw));
    }
}
