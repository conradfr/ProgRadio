<?php

declare(strict_types=1);

namespace App\Service;

use Symfony\Component\HttpFoundation\Request;

class Host
{
    protected const DEFAULT_DOMAIN = 'progradio';

    public const DATA = [
        'progradio' => [
            'domain' =>  ['programmes-radio.com', 'programmes-radio.fr'],
            'name' => 'Programmes Radio',
            'name_host' => 'Programmes-Radio.com',
            'url' => 'https://www.programmes-radio.com',
            'locale' => 'fr',
            'default_country' => 'FR',
            'title_key' => 'general.main_title_progradio',
            'bangs' => [
                'app' => ['schedule','streaming']
            ],
            'play_store' => 'https://play.google.com/store/apps/details?id=io.programmes_radio.www.progradio'
        ],
        'radioaddict' => [
            'domain' =>  ['radio-addict.com'],
            'name' => 'Radio Addict',
            'name_host' => 'Radio-Addict.com',
            'url' => 'https://www.radio-addict.com',
            'default_country' => 'LAST',
            'title_key' => 'general.main_title_radioaddict',
            'locale' => 'en',
            'bangs' => [
                'app' => ['streaming']
            ],
            'play_store' => 'https://play.google.com/store/apps/details?id=io.programmes_radio.www.radioaddict'
        ]
    ];

    public function getName(Request $request): string
    {
        return $this->getField('name', $request);
    }

    public function getDefaultLocale(Request $request): string
    {
        return $this->getField('locale', $request);
    }

    public function getRootDomain(Request $request): string
    {
        return $this->getField('domain', $request)[0];
    }

    public function isProgRadio(Request $request): bool
    {
        $data = $this->getData($request);
        return $data['key'] === self::DEFAULT_DOMAIN;
    }

    public function getField(string $field, Request $request): string|array
    {
        $data = $this->getData($request);
        return $data['data'][$field];
    }

    protected function getData(Request $request): array
    {
        $host = $request->getHost();

        foreach (self::DATA as $k => $subData) {
            foreach ($subData['domain'] as $domain) {
                if (str_ends_with($host, $domain) === true) {
                    return ['key' => $k, 'data' => self::DATA[$k]];
                }
            }
        }

        return ['key' => self::DEFAULT_DOMAIN, 'data' => self::DATA[self::DEFAULT_DOMAIN]];
    }
}
