<?php

declare(strict_types=1);

namespace App\EventListener;

use App\Entity\Radio;
use Symfony\Component\HttpKernel\Event\RequestEvent;

class KernelRequestListener
{
    protected const COOKIE_PREFIX = 'progradio_v4-';
    protected const COOKIE_STREAM_SUFFIX = '_streams';
    protected const COOKIE_DELIMITER = '|';
    protected const COOKIE_LANG = 'locale';

    protected const AUTHORIZED_LOCALES = ['fr', 'en'];
    protected const DEFAULT_LOCALE = ['fr', 'en'];

    public function __invoke(RequestEvent $event): void
    {
        $request = $event->getRequest();

        // radio favorites
        $favoritesRaw = $request->cookies->get(self::COOKIE_PREFIX . Radio::FAVORITES, '');
        $favorites = empty($favoritesRaw) ? [] : explode(self::COOKIE_DELIMITER, $favoritesRaw);

        $request->attributes->set('favorites', $favorites);

        // stream favorites
        $favoritesRaw = $request->cookies->get(self::COOKIE_PREFIX . Radio::FAVORITES . self::COOKIE_STREAM_SUFFIX, '');
        $favoritesStream = empty($favoritesRaw) ? [] : explode(self::COOKIE_DELIMITER, $favoritesRaw);

        $request->attributes->set('favoritesStream', $favoritesStream);

        // locale

/*        if (!$request->hasPreviousSession()) {
            return;
        }*/

/*        if ($locale = $request->query->get('lang')) {
            $request->getSession()->set('_locale', $locale);
            $request->setLocale($locale);
        } else {
            $defaultLang = isset($_SERVER['HTTP_ACCEPT_LANGUAGE']) ? locale_accept_from_http($_SERVER['HTTP_ACCEPT_LANGUAGE']) : null;
            $localeFull = $request->cookies->get(self::COOKIE_PREFIX . self::COOKIE_LANG, $defaultLang);

            // reduce to short locale name
            $fmt = new \IntlDateFormatter($localeFull, \IntlDateFormatter::FULL, \IntlDateFormatter::FULL);
            $locale = $fmt->getLocale();

            if (in_array($locale, self::AUTHORIZED_LOCALES)) {
                $request->setLocale($locale);
            }
        }*/
    }
}
