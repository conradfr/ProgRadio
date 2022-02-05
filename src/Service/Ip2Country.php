<?php

declare(strict_types=1);

namespace App\Service;

use Symfony\Component\HttpFoundation\Request;
use Psr\Cache\CacheItemPoolInterface;
use Symfony\Contracts\Cache\ItemInterface;

class Ip2Country
{
    protected const CACHE_IP_PREFIX = 'cache_ip_data_';
    protected const CACHE_IP_TTL = 86400; // seconds

    protected const API_URL = 'http://www.geoplugin.net/json.gp?ip=%s';

    protected const GDPR_COUNTRIES = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'];

    protected const CCPA_REGIONS = ['CA'];

    public function __construct(protected CacheItemPoolInterface $cache) { }

    public function isProtected(Request $request): bool
    {
        $ip = $request->getClientIp();

        $ipData = $this->cache->get(self::CACHE_IP_PREFIX . $ip, function (ItemInterface $item) use ($ip) {
            $item->expiresAfter(self::CACHE_IP_TTL);
            return $this->getData($ip);
        });

        if (in_array($ipData['country_code'], self::GDPR_COUNTRIES)) {
            return true;
        }

        if (in_array($ipData['region_code'], self::CCPA_REGIONS)) {
            return true;
        }

        return false;
    }

    protected function getData($ip): array
    {
        $url = sprintf(self::API_URL, $ip);

        try {
            $fp = fopen($url, 'r');

            $content = '';
            while(!feof($fp)){
                $content .= fgets($fp);
            }

            fclose($fp);

            $result = json_decode($content, true);
        }
        catch (\Exception $e) {
            $result = null;
        }

        return [
            'country_code' => $result !== null && isset($result['geoplugin_countryCode']) ? $result['geoplugin_countryCode'] : null,
            'region_code' => $result !== null && isset($result['geoplugin_regionCode']) ? $result['geoplugin_regionCode'] : null
        ];
    }

}
