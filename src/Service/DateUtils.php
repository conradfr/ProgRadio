<?php

declare(strict_types=1);

namespace App\Service;

class DateUtils
{
    public function getDatesFromRelativeFormat(string $format): ?array
    {
        if ($format === 'yesterday') {
            return [
                new \DateTime('yesterday'),
                null
            ];
        }

        if ($format === 'today') {
            return [
                new \DateTime('today'),
                null
            ];
        }

        if ($format === 'thisweek') {
            return [
                new \DateTime('monday this week'),
                new \DateTime('today')
            ];
        }

        if ($format === 'thismonth') {
            return [
                new \DateTime('first day of this month'),
                new \DateTime('today')
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
                new \DateTime('last day of last month')
            ];
        }

        if ($format === 'ratings') {
            return [
                new \DateTime('2 months 15 days ago'),
                new \DateTime()
            ];
        }

        return null;
    }
}
