<?php
/**
 * Created by PhpStorm.
 * User: Lionel
 * Date: 08/07/2017
 * Time: 15:25
 */

namespace AppBundle\Service\Cache;


class Config
{
    const CACHE_SCHEDULE_PREFIX = 'cache:schedule:';
    const CACHE_SCHEDULE_TTL = 604800; /* in seconds = one week */
}
