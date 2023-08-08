<?php

declare(strict_types=1);

namespace App\Twig;

use Twig\Extension\RuntimeExtensionInterface;
use Keiko\Uuid\Shortener\Dictionary;
use Keiko\Uuid\Shortener\Shortener;
use Ramsey\Uuid\Uuid;
use Ramsey\Uuid\Lazy\LazyUuidFromString;

class ShortIdRuntime implements RuntimeExtensionInterface
{
    public function shortId($id): string
    {
        /** @var LazyUuidFromString|Uuid $id */
        if (is_object($id)) {
            $id = $id->toString();
        }

        $shortener = Shortener::make(
            Dictionary::createUnmistakable() // or pass your own characters set
        );

        return $shortener->reduce($id);
    }
}
