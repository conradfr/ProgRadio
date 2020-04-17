<?php

declare(strict_types=1);

namespace App\EventListener;

use Doctrine\DBAL\Event\ConnectionEventArgs;

class DoctrinePostConnectListener
{
    protected $timezone;

    public function __construct(string $timezone)
    {
        $this->timezone=$timezone;
    }

    public function postConnect(ConnectionEventArgs $args)
    {
        $args->getConnection()
             ->exec("SET time zone '" . $this->timezone . "'");
    }
}
