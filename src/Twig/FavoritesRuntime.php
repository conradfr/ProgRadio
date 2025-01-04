<?php

declare(strict_types=1);

namespace App\Twig;

use App\Entity\Collection;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Cache\CacheItemPoolInterface;
use Symfony\Component\HttpFoundation\ParameterBag;
use Symfony\Contracts\Cache\ItemInterface;
use Twig\Extension\RuntimeExtensionInterface;

class FavoritesRuntime implements RuntimeExtensionInterface
{
    protected const string CACHE_PREFIX = 'cache_collections_';
    protected const int CACHE_TTL = 300; // 5mn in seconds

    public function __construct(
        protected EntityManagerInterface $em,
        protected CacheItemPoolInterface $cache
    ) { }

    public function scheduleCollections(ParameterBag $requestAttributes): array
    {
        $favorites = $requestAttributes->get('favorites', []);

        return $this->cache->get(self::CACHE_PREFIX . implode('-', $favorites), function (ItemInterface $item) use ($favorites) {
            $item->expiresAfter(self::CACHE_TTL);
            return $this->em->getRepository(Collection::class)->getCollections($favorites);
        });
    }
}
