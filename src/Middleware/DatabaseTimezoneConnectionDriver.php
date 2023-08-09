<?php

namespace App\Middleware;

use Doctrine\DBAL\Driver\Connection;
use Doctrine\DBAL\Driver\Middleware\AbstractDriverMiddleware;
use SensitiveParameter;

final class DatabaseTimezoneConnectionDriver extends AbstractDriverMiddleware
{
    protected ?string $timezone = null;

    public function setTimezone(string $timezone): void
    {
        $this->timezone = $timezone;
    }

    public function connect(array $params): Connection
    {
        $connection = parent::connect($params);

        $connection->exec("SET time zone '" . $this->timezone . "'");

        return $connection;
    }
}
