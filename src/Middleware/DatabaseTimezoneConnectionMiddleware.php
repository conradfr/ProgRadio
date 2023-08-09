<?php

namespace App\Middleware;

use Doctrine\DBAL\Driver;
use Doctrine\DBAL\Driver\Middleware;

class DatabaseTimezoneConnectionMiddleware implements Middleware
{
    public function __construct(protected string $timezone) { }

    public function wrap(Driver $driver): Driver
    {
        $driver = new DatabaseTimezoneConnectionDriver($driver);
        $driver->setTimezone($this->timezone);

        return $driver;
    }
}
