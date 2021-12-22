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
    }
}
