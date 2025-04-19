<?php

declare(strict_types=1);

namespace App\Service;

class DateUtils
{
    public static function getDatesFromRelativeFormat(string $format): ?array
    {
        if ($format === 'yesterday') {
            return [
                new \DateTime('yesterday'),
                null,
            ];
        }

        if ($format === 'today') {
            return [
                new \DateTime('today'),
                null,
            ];
        }

        if ($format === 'thisweek') {
            return [
                new \DateTime('monday this week'),
                new \DateTime('today'),
            ];
        }

        if ($format === 'thismonth') {
            return [
                new \DateTime('first day of this month'),
                new \DateTime('today'),
            ];
        }

        if ($format === 'lastweek') {
            return [
                new \DateTime('monday last week'),
                new \DateTime('sunday last week'),
            ];
        }

        if ($format === 'lastmonth') {
            return [
                new \DateTime('first day of last month'),
                new \DateTime('last day of last month'),
            ];
        }

        if ($format === 'ratings') {
            $monthYear = new \DateTime();
            $monthYear->sub(new \DateInterval('P3M'));

            return [
                new \DateTime('first day of ' . $monthYear->format('F Y')),
                new \DateTime('last day of last month'),
            ];
        }

        return null;
    }

    // Used to  get a consistent format from the elixir api
    public static function getMicroTime(): int
    {
        $microtime = microtime();
        $exploded = explode(' ', $microtime);

        return (int) ($exploded[1] . ((int) round(floatval($exploded[0]) * 1000000)));
    }
}
