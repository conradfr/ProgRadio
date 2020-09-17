<?php

declare(strict_types=1);

namespace App\Twig;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\ParameterBag;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class FavoritesExtension extends AbstractExtension
{
    public function getFunctions()
    {
        return [
            new TwigFunction('hasStreamFavorites', [$this, 'hasStreamFavorites']),
        ];
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
