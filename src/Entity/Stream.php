<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Intl\Countries;
use App\Entity\StreamOverloading;
use App\Entity\RadioStream;

#[ORM\Table(name: '`stream`')]
#[ORM\Index(name: 'name_idx', columns: ['name'])]
#[ORM\Index(name: 'click24_idx', columns: ['clicks_last_24h'])]
#[ORM\Index(name: 'countrycode_idx', columns: ['country_code'])]
#[ORM\Index(name: 'stream_tags_idx', columns: ['tags'])]
#[ORM\Entity(repositoryClass: 'App\Repository\StreamRepository')]
class Stream
{
    final public const FAVORITES = 'FAVORITES';

    #[ORM\Column(type: 'uuid', unique: true)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'NONE')]
    private ?string $id = null;

    #[ORM\Column(type: 'string', length: 500)]
    private ?string $name = null;

    #[ORM\Column(type: 'string', length: 500, nullable: true)]
    private ?string $img = null;

    #[ORM\Column(type: 'string', length: 500)]
    private ?string $streamUrl = null;

    #[ORM\Column(type: 'string', length: 500, nullable: true)]
    private ?string $tags = null;

    #[ORM\Column(type: 'string', length: 2)]
    private ?string $countryCode = null;

    #[ORM\Column(type: 'string', length: 255)]
    private ?string $language = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $website = null;

    #[ORM\Column(type: 'integer', options: ['default' => 0])]
    private ?int $votes = null;

    #[ORM\Column(type: 'integer', name: 'clicks_last_24h', options: ['default' => 0])]
    private ?int $clicksLast24h = null;

    /**
     * @var ListeningSession[]
     */
    #[ORM\OneToMany(targetEntity: ListeningSession::class, mappedBy: 'stream', fetch: 'EXTRA_LAZY')]
    private Collection $listeningSessions;

    #[ORM\ManyToOne(targetEntity: RadioStream::class, inversedBy: 'streams')]
    #[ORM\JoinColumn(name: 'radio_stream_id', referencedColumnName: 'id')]
    private RadioStream $radioStream;

    /**
     * @var StreamSong
     */
    #[ORM\ManyToOne(targetEntity: StreamSong::class, inversedBy: 'streams')]
    #[ORM\JoinColumn(name: 'stream_song_id', referencedColumnName: 'id')]
    private $streamSong;

    #[ORM\Column(type: 'string', length: 30)]
    private ?string $streamSongCodeName = null;

    #[ORM\Column(type: 'boolean', options: ['default' => true])]
    private bool $enabled = true;

    #[ORM\OneToOne(targetEntity: StreamOverloading::class)]
    #[ORM\JoinColumn(name: 'id', referencedColumnName: 'id')]
    private ?StreamOverloading $streamOverloading = null;

    public function __construct() {
        $this->listeningSessions = new ArrayCollection();
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function setId(string $id): void
    {
        $this->id = $id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): void
    {
        $this->name = $name;
    }

    public function getImg(): ?string
    {
        return $this->img;
    }

    public function setImg(string $img): void
    {
        $this->img = $img;
    }

    public function getStreamUrl(): string
    {
        return $this->streamUrl;
    }

    public function setStreamUrl(string $streamUrl): void
    {
        $this->streamUrl = $streamUrl;
    }

    public function getTags(): ?string
    {
        return $this->tags;
    }

    public function setTags(string $tags=null): void
    {
        $this->tags = $tags;
    }

    public function getCountryCode(): string
    {
        return $this->countryCode;
    }

    public function setCountryCode(string $countryCode): void
    {
        $this->countryCode = $countryCode;
    }

    public function getLanguage(): string
    {
        return $this->language;
    }

    public function setLanguage(string $language): void
    {
        $this->language = $language;
    }

    public function getVotes(): int
    {
        return $this->votes;
    }

    public function setVotes(int $votes): void
    {
        $this->votes = $votes;
    }

    public function getClicksLast24h(): int
    {
        return $this->clicksLast24h;
    }

    public function setClicksLast24h(int $clicksLast24h): void
    {
        $this->clicksLast24h = $clicksLast24h;
    }

    public function getListeningSessions(): Collection
    {
        return $this->listeningSessions;
    }

    public function setListeningSessions(Collection $listeningSessions): void
    {
        $this->listeningSessions = $listeningSessions;
    }

    public function hasMainRadioStream()
    {
        if ($this->radioStream !== null && $this->radioStream->isMain() === true) {
            return true;
        }

        return false;
    }

    public function getRadioStream(): ?RadioStream
    {
        return $this->radioStream;
    }

    public function setRadioStream($radioStream): void
    {
        $this->radioStream = $radioStream;
    }

    public function getStreamSong(): ?StreamSong
    {
        return $this->streamSong;
    }

    public function setStreamSong($streamSong): void
    {
        $this->streamSong = $streamSong;
    }

    public function getStreamSongCodeName(): string
    {
        return $this->streamSongCodeName;
    }

    public function setStreamSongCodeName(string $streamSongCodeName): void
    {
        $this->streamSongCodeName = $streamSongCodeName;
    }

    public function getCountry(string $locale): ?string
    {
        try {
            if ($this->getCountryCode() === null || $this->getCountryCode() === '') {
                return null;
            }

            return Countries::getName($this->getCountryCode(), $locale);
        } catch (\Exception) {
            return '';
        }
    }

    public function getWebsite(): ?string
    {
        return $this->website;
    }

    public function setWebsite(?string $website): void
    {
        $this->website = $website;
    }

    public function isEnabled(): bool
    {
        return $this->enabled;
    }

    public function setEnabled(bool $enabled): void
    {
        $this->enabled = $enabled;
    }

    public function getStreamOverloading(): StreamOverloading
    {
        return $this->streamOverloading;
    }

    public function setStreamOverloading(StreamOverloading $streamOverloading): void
    {
        $this->streamOverloading = $streamOverloading;
    }
}
