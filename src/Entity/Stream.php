<?php

declare(strict_types=1);

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Intl\Countries;
use App\Entity\StreamOverloading;
use App\Entity\RadioStream;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Serializer\Normalizer\NormalizableInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Table(name: '`stream`')]
#[ORM\Index(name: 'name_idx', columns: ['name'])]
#[ORM\Index(name: 'score_idx', columns: ['score'])]
#[ORM\Index(name: 'countrycode_idx', columns: ['country_code'])]
#[ORM\Index(name: 'stream_tags_idx', columns: ['tags'])]
#[ORM\Index(name: 'stream_playing_error_index', columns: ['playing_error'])]
#[ORM\Entity(repositoryClass: 'App\Repository\StreamRepository')]
class Stream implements NormalizableInterface
{
    final public const string FAVORITES = 'FAVORITES';
    final public const string HISTORY = 'HISTORY';
    final public const string USER_LISTENED = 'USER_LAST';

    final public const string SOURCE_RADIOBROWSER = 'radio-browser';
    final public const string SOURCE_PROGRADIO = 'progradio';

    final public const int ERROR_DISPLAY_THRESHOLD = 6;

    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'NONE')]
    private ?Uuid $id;

    #[ORM\Column(type: 'string', length: 500)]
    private ?string $name = null;

    #[ORM\Column(type: 'string', length: 500, nullable: true)]
    private ?string $img = null;

    #[ORM\Column(type: 'string', length: 500, nullable: true)]
    private ?string $originalImg = null;

    #[ORM\Column(type: 'string', length: 500)]
    private ?string $streamUrl = null;

    #[ORM\Column(type: 'string', length: 500)]
    private ?string $originalStreamUrl = null;

    #[Assert\Length(max: 255)]
    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $slogan = null;

    #[Assert\Length(max: 1000)]
    #[ORM\Column(type: 'string', nullable: true)]
    private ?string $description = null;

    #[ORM\Column(type: 'string', length: 500, nullable: true)]
    private ?string $tags = null;

    #[ORM\Column(type: 'string', length: 500, nullable: true)]
    private ?string $originalTags = null;

    #[ORM\Column(type: 'string', length: 2, nullable: true)]
    private ?string $countryCode = null;

    #[ORM\Column(type: 'string', length: 255)]
    private ?string $language = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $website = null;

    #[ORM\Column(type: 'integer', options: ['default' => 0])]
    private ?int $votes = null;

    #[ORM\Column(type: 'integer', name: 'clicks_last_24h', options: ['default' => 0])]
    private ?int $clicksLast24h = null;

    #[ORM\Column(type: 'integer', name: 'score', options: ['default' => 0])]
    private ?int $score = null;

    #[ORM\Column(type: 'datetime')]
    private ?\DateTime $lastListeningAt = null;

    #[ORM\Column(type: 'datetime')]
    private ?\DateTime $importUpdatedAt = null;

    #[ORM\Column(type: 'boolean')]
    private ?bool $forceHls = null;

    #[ORM\Column(type: 'boolean')]
    private ?bool $forceMpd = null;

    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    private ?bool $banned = null;

    /**
     * @var ListeningSession[]
     */
    #[ORM\OneToMany(targetEntity: ListeningSession::class, mappedBy: 'stream', fetch: 'EXTRA_LAZY')]
    private Collection $listeningSessions;

    #[ORM\ManyToOne(targetEntity: RadioStream::class, inversedBy: 'streams')]
    #[ORM\JoinColumn(name: 'radio_stream_id', referencedColumnName: 'id')]
    private ?RadioStream $radioStream;

    #[ORM\ManyToOne(targetEntity: StreamSong::class, inversedBy: 'streams')]
    #[ORM\JoinColumn(name: 'stream_song_id', referencedColumnName: 'id')]
    private ?StreamSong $streamSong;

    #[ORM\Column(type: 'string', length: 30)]
    private ?string $streamSongCodeName = null;

    #[ORM\Column(type: 'boolean', options: ['default' => true])]
    private bool $enabled = true;

    #[ORM\OneToOne(targetEntity: StreamOverloading::class, fetch: "EAGER")]
    #[ORM\JoinColumn(name: 'id', referencedColumnName: 'id')]
    private ?StreamOverloading $streamOverloading = null;

    #[ORM\OneToOne(targetEntity: StreamCheck::class, fetch: "EAGER")]
    #[ORM\JoinColumn(name: 'id', referencedColumnName: 'id')]
    private ?StreamCheck $streamCheck = null;

    #[ORM\OneToOne(targetEntity: Stream::class)]
    #[ORM\JoinColumn(name: 'redirect_to', referencedColumnName: 'id')]
    private ?Stream $redirectToStream = null;

    #[ORM\Column(type: 'integer', options: ['default' => 0])]
    private ?int $playingError = null;

    #[ORM\Column(type: 'string', options: ['default' => null])]
    private ?string $playingErrorReason = null;

    #[ORM\Column(type: 'string', length: 15, options: ['default' => self::SOURCE_RADIOBROWSER])]
    private ?string $source = null;

    #[Gedmo\Timestampable(on: 'create')]
    #[ORM\Column(name: 'created_at', type: Types::DATETIME_MUTABLE, nullable: true)]
    private \DateTime $createdAt;

    #[Gedmo\Timestampable(on: 'update')]
    #[ORM\Column(name: 'updated_at', type: Types::DATETIME_MUTABLE, nullable: true)]
    private ?\DateTime $updatedAt = null;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'streams', fetch: "EXTRA_LAZY")]
    #[ORM\JoinColumn(name: 'user_id', referencedColumnName: 'id', nullable: true)]
    private ?User $user = null;

    #[ORM\OneToMany(targetEntity: UserStream::class, mappedBy: "stream", fetch: "EXTRA_LAZY")]
    #[ORM\Cache(usage: 'READ_ONLY')]
    private Collection $streamsHistory;

    #[ORM\Column(nullable: true)]
    private ?bool $popup = null;

    public function __construct() {
        $this->listeningSessions = new ArrayCollection();
        $this->streamsHistory = new ArrayCollection();
    }

    public function isIndexable(): bool
    {
        return $this->isEnabled() && !$this->isBanned() && $this->getRedirectToStream() === null;
    }

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function setId(Uuid $id): void
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

    public function setImg(?string $img): void
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

    public function setTags(?string $tags = null): void
    {
        $tags = str_replace(', ', ',', $tags);
        $tags = mb_strtolower($tags);
        $this->tags = $tags;
    }

    public function getOriginalTags(): ?string
    {
        return $this->originalTags;
    }

    public function setOriginalTags(?string $originalTags): void
    {
        $this->originalTags = $originalTags;
    }

    public function getCountryCode(): ?string
    {
        return $this->countryCode;
    }

    public function setCountryCode(string $countryCode): void
    {
        $this->countryCode = $countryCode;
    }

    public function getLanguage(): ?string
    {
        return $this->language;
    }

    public function setLanguage(?string $language): void
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

    public function getClicksLast24h(): ?int
    {
        return $this->clicksLast24h;
    }

    public function setClicksLast24h(int $clicksLast24h): void
    {
        $this->clicksLast24h = $clicksLast24h;
    }

    public function getScore(): ?int
    {
        return $this->score;
    }

    public function setScore(int $score): void
    {
        $this->score = $score;
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

    public function getStreamSongCodeName(): ?string
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

    public function getStreamOverloading():? StreamOverloading
    {
        return $this->streamOverloading;
    }

    public function setStreamOverloading(StreamOverloading $streamOverloading): void
    {
        $this->streamOverloading = $streamOverloading;
    }

    public function getStreamCheck():? StreamCheck
    {
        return $this->streamCheck;
    }

    public function setStreamCheck(StreamCheck $streamCheck): void
    {
        $this->streamCheck = $streamCheck;
    }

    public function getRedirectToStream(): ?Stream
    {
        return $this->redirectToStream;
    }

    public function setRedirectToStream(?Stream $redirectToStream): void
    {
        $this->redirectToStream = $redirectToStream;
    }

    public function getPlayingError(): ?int
    {
        return $this->playingError;
    }

    public function setPlayingError(?int $playingError): void
    {
        $this->playingError = $playingError;
    }

    public function getPlayingErrorReason(): ?string
    {
        return $this->playingErrorReason;
    }

    public function setPlayingErrorReason(?string $playingErrorReason): void
    {
        $this->playingErrorReason = $playingErrorReason;
    }

    public function getOriginalImg(): ?string
    {
        return $this->originalImg;
    }

    public function setOriginalImg(?string $originalImg): void
    {
        $this->originalImg = $originalImg;
    }

    public function getOriginalStreamUrl(): ?string
    {
        return $this->originalStreamUrl;
    }

    public function setOriginalStreamUrl(?string $originalStreamUrl): void
    {
        $this->originalStreamUrl = $originalStreamUrl;
    }

    public function getSlogan(): ?string
    {
        return $this->slogan;
    }

    public function setSlogan(?string $slogan): void
    {
        $this->slogan = $slogan;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): void
    {
        $this->description = $description;
    }

    public function getLastListeningAt(): ?\DateTime
    {
        return $this->lastListeningAt;
    }

    public function setLastListeningAt(?\DateTime $lastListeningAt): void
    {
        $this->lastListeningAt = $lastListeningAt;
    }

    public function getImportUpdatedAt(): ?\DateTime
    {
        return $this->importUpdatedAt;
    }

    public function setImportUpdatedAt(?\DateTime $importUpdatedAt): void
    {
        $this->importUpdatedAt = $importUpdatedAt;
    }

    /**
     * @return bool|null
     */
    public function getForceHls(): ?bool
    {
        return $this->forceHls;
    }

    /**
     * @param bool|null $forceHls
     */
    public function setForceHls(?bool $forceHls): void
    {
        $this->forceHls = $forceHls;
    }

    public function getForceMpd(): ?bool
    {
        return $this->forceMpd;
    }

    public function setForceMpd(?bool $forceMpd): void
    {
        $this->forceMpd = $forceMpd;
    }

    public function getSource(): ?string
    {
        return $this->source;
    }

    public function setSource(?string $source): void
    {
        $this->source = $source;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user = null): void
    {
        $this->user = $user;
    }

    public function isBanned(): ?bool
    {
        return $this->banned;
    }

    public function isPopup(): ?bool
    {
        return $this->popup;
    }

    public function setPopup(?bool $popup): static
    {
        $this->popup = $popup;

        return $this;
    }

    public function setBanned(?bool $banned): void
    {
        $this->banned = $banned;
    }

    public function getCreatedAt(): \DateTime
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTime $createdAt): void
    {
        $this->createdAt = $createdAt;
    }

    public function getUpdatedAt(): ?\DateTime
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTime $updatedAt): void
    {
        $this->updatedAt = $updatedAt;
    }

    public function getStreamsHistory(): ArrayCollection|Collection
    {
        return $this->streamsHistory;
    }

    public function setStreamsHistory(ArrayCollection|Collection $streamsHistory): void
    {
        $this->streamsHistory = $streamsHistory;
    }

    public function normalize(NormalizerInterface $normalizer, ?string $format = null, array $context = []): array
    {
        if (\Meilisearch\Bundle\Searchable::NORMALIZATION_FORMAT === $format) {
            return [
                'id' => $this->getId()->toString(),
                'objectID' => $this->getId()->toString(),
                'name' => $this->getName(),
                'tags' => $this->getTags(),
                'score' => $this->getScore(),
                'country_code' => $this->getCountryCode(),
                'language' => $this->getLanguage(),
                'clicks_last_24h' => $this->getClicksLast24h(),
                'playing_error' => $this->getPlayingError(),
            ];
        }

        return [];
    }
}
