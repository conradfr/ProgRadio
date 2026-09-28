<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Stream;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

/**
 * Read the song history saved in Redis by the api (see SongServer in progradio_api)
 */
class SongHistory
{
    protected const string KEY_PREFIX = 'history_';

    // JSON keys saved by the api
    protected const array SONG_KEYS = ['artist', 'title', 'cover_url', 'detected_at'];

    public function __construct(
        #[Autowire(service: 'snc_redis.default')]
        protected readonly object $redis,
        protected readonly LoggerInterface $logger
    ) {
    }

    public function getHistory(Stream $stream): array
    {
        try {
            $history = $this->redis->get(self::KEY_PREFIX . self::getSongTopic($stream));
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

    // same topic name as the api channels (see SongNextChannel in progradio_api)
    protected static function getSongTopic(Stream $stream): string
    {
        $streamSong = $stream->getStreamSong();

        if ($streamSong !== null && $streamSong->isEnabled() && $stream->getStreamSongCodeName() !== null) {
            return 'song:' . $streamSong->getCodeName() . '_' . $stream->getStreamSongCodeName();
        }

        return 'url:' . $stream->getStreamUrl();
    }
}
