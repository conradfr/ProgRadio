<?php

namespace AppBundle\Service;

use GuzzleHttp\Client;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Promise\Promise;
use GuzzleHttp\Exception\RequestException;
use Liip\ImagineBundle\Imagine\Cache\CacheManager;
use Psr\Http\Message\ResponseInterface;
use Kevinrob\GuzzleCache\CacheMiddleware;
use Kevinrob\GuzzleCache\Strategy\PrivateCacheStrategy;
use Kevinrob\GuzzleCache\Storage\DoctrineCacheStorage;
use Predis\Client as Redis;
use Doctrine\Common\Cache\PredisCache;

class ImageImporter
{
    CONST IMAGE_PATH = 'web/media/program/';

    /** @var Redis */
    protected $redis;

    /** @var Client */
    protected $client;

    /** @var CacheManager */
    protected $imagineCacheManager;

    /** @var string */
    protected $basePath;

    /**
     * @param Client $imgImporter
     * @param string $basePath
     */
    public function __construct(Redis $redis, CacheManager $imagineCacheManager, $basePath)
    {
        $this->redis = $redis;
        $this->imagineCacheManager = $imagineCacheManager;
        $this->basePath = $basePath . '/';
    }

    /**
     * @return Client
     */
    protected function getClient()
    {
        if (isset($this->client)) { return $this->client; }

        $stack = HandlerStack::create();
        $stack->push(
            new CacheMiddleware(
                new PrivateCacheStrategy(
                    new DoctrineCacheStorage(
                        new PredisCache($this->redis)
                    )
                )
            ),
            'cache'
        );
        $this->client = new Client(['handler' => $stack]);

        return $this->client;
    }

    /**
     * Generate unique filename for an image
     * (avoid collision in case of same filename but different radio)
     *
     * @param string $url
     * @param string $radio
     *
     * @return string
     */
    protected function getImageName($url, $radio)
    {
        $urlParts = parse_url($url);
        return $radio . '_' . basename(urldecode($urlParts['path']));
    }

    /**
     * @param $imageName
     *
     * @return string
     */
    protected function getSavePath($imageName)
    {
        return $this->basePath . self::IMAGE_PATH . $imageName;
    }

    /**
     * @param string $url
     * @param string $radio
     *
     * @return Promise|false
     */
    public function import ($url, $radio)
    {
        if ($url === null) { return false; }

        $imageName = $this->getImageName($url, $radio);

        $promise = $this->getClient()->getAsync($url, ['save_to' => $this->getSavePath($imageName)]);
        $promiseReturn = new Promise();

        $promise->then(
            function (ResponseInterface $res) use (&$promiseReturn, $imageName) {
                echo "hooo";
                $promiseReturn->resolve($imageName);
            },
            function (RequestException $e) use (&$promiseReturn) {
                $promiseReturn->reject($e->getMessage());
            }
        );

        $promise->wait();
        return $promiseReturn;
    }
}
