<?php

declare(strict_types=1);

namespace App\EventListener;

use App\Entity\Radio;
use Symfony\Component\HttpKernel\Event\RequestEvent;

class KernelRequestListener
{
    const COOKIE_PREFIX = 'progradio-';
    const COOKIE_DELIMITER = '|';

    public function __invoke(RequestEvent $event): void
    {
        $request = $event->getRequest();
        $favoritesRaw = $request->cookies->get(self::COOKIE_PREFIX . Radio::FAVORITES, '');
        $favorites = empty($favoritesRaw) ? [] : explode(self::COOKIE_DELIMITER, $favoritesRaw);

        $request->attributes->set('favorites', $favorites);
    }
}
