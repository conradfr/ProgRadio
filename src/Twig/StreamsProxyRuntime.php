<?php

declare(strict_types=1);

namespace App\Twig;

use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Twig\Extension\RuntimeExtensionInterface;

/**
 * Read the rolling keys of the streams proxy saved in Redis by the api (see ApiKeyCronWorker in progradio_api)
 */
class StreamsProxyRuntime implements RuntimeExtensionInterface
{
    protected const string REDIS_KEY = 'stream_proxy_keys';

    public function __construct(
        #[Autowire(service: 'snc_redis.default')]
        protected readonly object $redis,
        protected readonly LoggerInterface $logger
    ) {
    }

    public function streamsProxyKey(): string
    {
        try {
            // the keys are pushed at the head of the list, so the first one is the most recent
            $key = $this->redis->lindex(self::REDIS_KEY, 0);
        } catch (\Throwable $e) {
            $this->logger->warning('Streams proxy key: redis error', ['exception' => $e]);
            return '';
        }

        // Predis returns null, phpredis false when the list is empty
        return is_string($key) ? $key : '';
    }
}
