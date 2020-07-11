<?php

declare(strict_types=1);

namespace App\EventListener;

use App\Entity\Radio;
use Symfony\Component\HttpKernel\Event\RequestEvent;

class KernelRequestListener
{
    const COOKIE_PREFIX = 'progradio-';
    const COOKIE_DELIMITER = '|';

    private string $defaultLocale;

    public function __construct($defaultLocale = 'fr')
    {
        $this->defaultLocale = $defaultLocale;
    }

    public function __invoke(RequestEvent $event): void
    {
        $request = $event->getRequest();

        // favorites
        $favoritesRaw = $request->cookies->get(self::COOKIE_PREFIX . Radio::FAVORITES, '');
        $favorites = empty($favoritesRaw) ? [] : explode(self::COOKIE_DELIMITER, $favoritesRaw);

        $request->attributes->set('favorites', $favorites);

        // locale

        if (!$request->hasPreviousSession()) {
            return;
        }

        // try to see if the locale has been set as a _locale routing parameter
        if ($locale = $request->attributes->get('_locale')) {
            $request->getSession()->set('_locale', $locale);
        } else {
            // if no explicit locale has been set on this request, use one from the session
            $request->setLocale($request->getSession()->get('_locale', $this->defaultLocale));
        }
    }
}
