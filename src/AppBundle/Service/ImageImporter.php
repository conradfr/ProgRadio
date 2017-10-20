<?php

namespace AppBundle\Service;

use GuzzleHttp\Client;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Promise\Promise;
use GuzzleHttp\Exception\RequestException;
use Psr\Http\Message\ResponseInterface;

class ImageImporter
{
    /** @var ImageCache */
    protected $cache;

    /** @var Client */
    protected $client;

    /**
     * @param Client $imgImporter
     * @param string $basePath
     */
    public function __construct(ImageCache $cache)
    {
        $this->cache = $cache;
    }

    /**
     * @return Client
     */
    protected function getClient(): Client
    {
        if (isset($this->client)) { return $this->client; }

        $stack = HandlerStack::create();
        $this->client = new Client(['handler' => $stack]);

        return $this->client;
    }

    /**
     * @param null|string $url
     * @param string $radio
     *
     * @return Promise|null
     */
    public function import (?string $url, string $radio): ?Promise
    {
        if ($url === null) { return null; }

        $imageName = $this->cache->getImageName($url, $radio);
        $promiseReturn = new Promise(function () use (&$promise) {
            if (isset($promise)) { $promise->wait(); }
        });

        if ($this->cache->hasCache($imageName) === true) {
            $promiseReturn->resolve($imageName);
        }
        else {
            $promise = $this->getClient()->getAsync($url, ['sink' => $this->cache->getCachePath($imageName)]);
            $promise->then(
                function (ResponseInterface $res) use (&$promiseReturn, $imageName) {
                    if ($res->getReasonPhrase() !== 'OK') {
                        $promiseReturn->reject($res->getStatusCode() . ' / ' . $res->getReasonPhrase());
                    }
                    elseif ($res->getHeader('Content-Length') === 0) {
                        @unlink($this->cache->getCachePath($imageName)); // delete useless files
                        $promiseReturn->reject('no data');
                    }

                   $promiseReturn->resolve($imageName);
                },
                function (RequestException $e) use (&$promiseReturn) {
                    $promiseReturn->reject($e->getMessage());
                }
            );
        }

        return $promiseReturn;
    }
}
