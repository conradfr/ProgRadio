<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Stream;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

/**
 * Read the song & song history saved in Redis by the api (see SongServer in progradio_api)
 *
 * TODO move to api call instead of Redis for IPC?
 * Would probably be slower and this is transient data, so maybe if/when services are not longer in the same machine
 */
class LiveData
{
    protected const string SONG_KEY_PREFIX = 'song_';
    protected const string HISTORY_KEY_PREFIX = 'history_';

    // JSON keys saved by the api
    protected const array SONG_KEYS = ['artist', 'title', 'cover_url', 'detected_at'];

    public function __construct(
        #[Autowire(service: 'snc_redis.default')]
        protected readonly object $redis,
        protected readonly LoggerInterface $logger
    ) {
    }

    public function getCurrentSong(Stream $stream): ?array
    {
        try {
            $songData = $this->redis->get(self::SONG_KEY_PREFIX . $stream->getId());
        } catch (\Throwable $e) {
            $this->logger->warning('Song: redis error', ['exception' => $e]);
            return null;
        }

        // Predis returns null, phpredis false when key is missing
        if (!is_string($songData)) {
            return null;
        }

        $song = json_decode($songData, true);
        if (!is_array($song)) {
            return null;
        }

        return array_intersect_key($song, array_flip(self::SONG_KEYS));
    }

    public function getHistory(Stream $stream): array
    {
        try {
            $history = $this->redis->get(self::HISTORY_KEY_PREFIX . $stream->getId());
        } catch (\Throwable $e) {
            $this->logger->warning('Song history: redis error', ['exception' => $e]);
            return [];
        }

        // Predis returns null, phpredis false when key is missing
        if (!is_string($history)) {
            return [];
        }

        $songs = json_decode($history, true);
        if (!is_array($songs)) {
            return [];
        }

        return array_values(array_map(
            fn(array $song): array => array_intersect_key($song, array_flip(self::SONG_KEYS)),
            array_filter($songs, 'is_array')
        ));
    }
}
