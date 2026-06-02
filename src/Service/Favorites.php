<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Radio;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class Favorites
{
    protected const string COOKIE_PREFIX = 'progradio_v4-';
    protected const string COOKIE_SUBRADIOS = 'subradios';
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

    // not really favorites, more of choices

    public static function getFavoriteSubRadios(Request $request): array
    {
        $favoritesRaw = $request->cookies->get(self::COOKIE_PREFIX . self::COOKIE_SUBRADIOS, '{}');
        return json_decode($favoritesRaw, true);
    }

    public static function setFavoriteSubRadios(
        string $radioCodeName,
        string $subRadioCodeName,
        Request $request,
        Response $response
    ): Response
    {
        $favorites = self::getFavoriteSubRadios($request);
        $favorites[$radioCodeName] = $subRadioCodeName;

        $cookie = new Cookie(
            self::COOKIE_PREFIX . self::COOKIE_SUBRADIOS,
            json_encode($favorites),
            time() + 31536000,
            '/',
            null,
            true,
            false,
            true,
            Cookie::SAMESITE_LAX
        );
        $response->headers->setCookie($cookie);

        return $response;
    }
}
