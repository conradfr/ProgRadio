<?php

namespace App;

use Symfony\Bundle\FrameworkBundle\Kernel\MicroKernelTrait;
use Symfony\Component\HttpKernel\Kernel as BaseKernel;

class Kernel extends BaseKernel
{
    use MicroKernelTrait;

    public function getCacheDir(): string
    {
        if (in_array($this->environment, array('dev', 'test'))) {
            return '/dev/shm/progradio/cache/' .  $this->environment;
        }

        return $this->getProjectDir().'/var/cache/'.$this->environment;
    }

    public function getLogDir(): string
    {
        if (in_array($this->environment, array('dev', 'test'))) {
            return '/dev/shm/progradio/logs';
        }

        return $this->getProjectDir().'/var/log';
    }
}
