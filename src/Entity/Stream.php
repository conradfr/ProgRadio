<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Repository\StreamRepository")
 * @ORM\Table(name="`stream`", indexes={@ORM\Index(name="name_idx", columns={"name"}), @ORM\Index(name="click24_idx", columns={"clicks_last_24h"}), @ORM\Index(name="country_code_idx", columns={"country_code"}), @ORM\Index(name="stream_tags_idx", columns={"tags"})})
 */
class Stream
{
    public const FAVORITES = 'FAVORITES';

    /**
     * @var string
     *
     * @ORM\Column(type="uuid", unique=true)
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="NONE")
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(type="string", length=500)
     */
    private $name;

    /**
     * @var string
     *
     * @ORM\Column(type="string", length=500, nullable=true)
     */
    private $img;

    /**
     * @var string
     *
     * @ORM\Column(type="string", length=500)
     */
    private $streamUrl;

    /**
     * @var string
     *
     * @ORM\Column(type="string", length=500, nullable=true)
     */
    private $tags;

    /**
     * @var string
     *
     * @ORM\Column(type="string", length=2)
     */
    private $countryCode;

    /**
     * @var string
     *
     * @ORM\Column(type="string", length=255)
     */
    private $language;

    /**
     * @var int
     *
     * @ORM\Column(type="integer", options={"default"=0})
     */
    private $votes;

    /**
     * @var int
     *
     * @ORM\Column(type="integer", name="clicks_last_24h", options={"default"=0})
     */
    private $clicksLast24h;

    /**
     * @var ListeningSession[]
     *
     * @ORM\OneToMany(targetEntity=ListeningSession::class, mappedBy="stream", fetch="EXTRA_LAZY")
     */
    private $listeningSessions;

    /**
     * @var RadioStream
     *
     * @ORM\ManyToOne(targetEntity=RadioStream::class, inversedBy="streams")
     * @ORM\JoinColumn(name="radio_stream_id", referencedColumnName="id")
     */
    private $radioStream;

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

    public function getImg(): string
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

    public function getRadioStream()
    {
        return $this->radioStream;
    }

    public function setRadioStream($radioStream): void
    {
        $this->radioStream = $radioStream;
    }
}
