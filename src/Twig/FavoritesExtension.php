<?php

declare(strict_types=1);

namespace App\Twig;

use App\Entity\Collection;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\ParameterBag;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class FavoritesExtension extends AbstractExtension
{
    /** @var EntityManagerInterface */
    protected $em;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->em = $entityManager;
    }

    public function getFunctions()
    {
        return [
            new TwigFunction('scheduleCollections', [$this, 'scheduleCollections']),
            new TwigFunction('hasStreamFavorites', [$this, 'hasStreamFavorites']),
        ];
    }

    public function scheduleCollections($user, ParameterBag $requestAttributes)
    {
        $favorites = $requestAttributes->get('favorites', []);
        return $this->em->getRepository(Collection::class)->getCollections($favorites);
    }

    public function hasStreamFavorites($user, ParameterBag $requestAttributes)
    {
        $favorites = null;
        if ($user === null) {
            $favorites = $requestAttributes->get('favoritesStream', []);
        }
        else {
            $favorites = $user->getFavoriteStreams()->map(
                function ($stream) {
                    return $stream->getId();
                }
            )->toArray();
        }

        return count($favorites) > 0;
    }
}
