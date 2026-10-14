<?php

declare(strict_types=1);

namespace App\Twig;

use App\Repository\StreamRepository;
use Twig\Extension\RuntimeExtensionInterface;

class GenresRuntime implements RuntimeExtensionInterface
{
    public function __construct(protected StreamRepository $repository) { }

    public function list(): array
    {
        return $this->repository->getGenres();
    }
}
