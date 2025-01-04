<?php

declare(strict_types=1);

namespace App\Twig;

use PhpParser\Node\Expr\Cast\Object_;
use Twig\Extension\RuntimeExtensionInterface;
use Keiko\Uuid\Shortener\Dictionary;
use Keiko\Uuid\Shortener\Shortener;
use Symfony\Component\Uid\Uuid;

class ShortIdRuntime implements RuntimeExtensionInterface
{
    protected Shortener $shortener;

    public function __construct()
    {
        $this->shortener = Shortener::make(
            Dictionary::createUnmistakable() // or pass your own characters set
        );
    }

    public function shortId(string|Object $id): string
    {
        /** @var Uuid $id */
        if (is_object($id)) {
            $id = (string) $id;
        }

        return $this->shortener->reduce($id);
    }
}
