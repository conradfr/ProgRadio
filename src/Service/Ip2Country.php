<?php

declare(strict_types=1);

namespace App\Service;

use Symfony\Component\HttpFoundation\Request;
use Psr\Cache\CacheItemPoolInterface;
use Symfony\Contracts\Cache\ItemInterface;

class Ip2Country
{
    protected const string CACHE_IP_PREFIX = 'cache_ip_data_';
    protected const int CACHE_IP_TTL = 604800; // one week in seconds

    protected const string API_URL = 'http://www.geoplugin.net/json.gp?ip=%s';

    public function __construct(protected CacheItemPoolInterface $cache) { }

    public function getTimeZone(Request $request): ?string
    {
        $ipData = $this->getIpData($request);

        return $ipData['timezone'] ?? null;
    }

    protected function getIpData(Request $request): array
    {
        $ip = $request->getClientIp();

        return $this->cache->get(self::CACHE_IP_PREFIX . $ip, function (ItemInterface $item) use ($ip) {
            $item->expiresAfter(self::CACHE_IP_TTL);
            return $this->getData($ip);
        });
    }

    protected function getData(?string $ip): array
    {
        $url = sprintf(self::API_URL, $ip);
        $result = null;
        $defaultResult = [
            'country_code' => null,
            'region_code' => null,
            'timezone' => null
        ];

        try {
            $fp = fopen($url, 'r');

            if ($fp === false) {
                return $defaultResult;
            }

            $content = '';
            while(!feof($fp)){
                $content .= fgets($fp);
            }

            fclose($fp);

            $result = json_decode($content, true);
        }
        catch (\Exception $e) {
            return $defaultResult;
        }

        return [
            'country_code' => $result !== null && isset($result['geoplugin_countryCode']) ? $result['geoplugin_countryCode'] : null,
            'region_code' => $result !== null && isset($result['geoplugin_regionCode']) ? $result['geoplugin_regionCode'] : null,
            'timezone' => $result !== null && isset($result['geoplugin_timezone']) ? $result['geoplugin_timezone'] : null,
        ];
    }

}
