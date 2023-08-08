<?php

declare(strict_types=1);

namespace App\Twig;

use Twig\Extension\RuntimeExtensionInterface;
use Keiko\Uuid\Shortener\Dictionary;
use Keiko\Uuid\Shortener\Shortener;

class ShortIdRuntime implements RuntimeExtensionInterface
{
    public function shortId($id): string
    {
        if (is_object($id) && get_class($id) === 'Ramsey\Uuid\Uuid') {
            $id = $id->toString();
        }

        $shortener = Shortener::make(
            Dictionary::createUnmistakable() // or pass your own characters set
        );

        return $shortener->reduce($id);
    }
}
