<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Stream;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Intl\Countries;

class RadioBrowser
{
    protected const SERVERS_DNS = 'all.api.radio-browser.info';

    /** @var EntityManagerInterface */
    protected $em;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->em = $entityManager;
    }

    public function getCountries(string $locale)
    {
        $countriesDb = $this->em->getRepository(Stream::class)->getCountryCodes();

        $countries = [];
        foreach ($countriesDb as $country) {
            if (Countries::exists($country['countryCode'])) {
                $countries[$country['countryCode']] = Countries::getName($country['countryCode'], $locale);
            }
        }

        $coll = collator_create($locale);
        collator_asort($coll, $countries);

        return $countries;
    }

    /* @todo check if working with /stats */
    public function getOneRandomServer(): ?string
    {
        $servers = $this->getServers();
        if (count($servers) === 0) { return null; }

        $picked = mt_rand(0, count($servers) - 1);
        return $servers[$picked];
    }

    protected function getServers(): array
    {
        $serversFromDns = dns_get_record(self::SERVERS_DNS, DNS_ANY);
        $serversAll = array_reduce($serversFromDns, function ($result, $record) {
            $ip = isset($record['ip']) ? $record['ip'] : $record['ipv6'];
            $host = gethostbyaddr($ip);

            if ($host !== false) {
                $result[] = $host;
            }

            return $result;
        }, []);

        return array_unique($serversAll);
    }
}
