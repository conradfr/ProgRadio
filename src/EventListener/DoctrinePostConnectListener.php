<?php

declare(strict_types=1);

namespace App\EventListener;

use Doctrine\DBAL\Event\ConnectionEventArgs;

class DoctrinePostConnectListener
{
    public function __construct(protected string $timezone) { }

    public function __invoke(ConnectionEventArgs $args): void
    {
        $args->getConnection()
             ->exec("SET time zone '" . $this->timezone . "'");
    }
}
