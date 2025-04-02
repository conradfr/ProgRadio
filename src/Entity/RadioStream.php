<?php

declare(strict_types=1);

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use App\Repository\RadioStreamRepository;
use App\Entity\Radio;
use App\Entity\SubRadio;

#[ORM\Table]
#[ORM\Index(name: 'radio_stream_code_name_idx', columns: ['code_name'])]
#[ORM\Entity(repositoryClass: RadioStreamRepository::class)]
class RadioStream
{
    #[ORM\Column(type: 'bigint')]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'AUTO')]
    private ?int $id;

    #[ORM\Column(type: 'string', length: 100)]
    private ?string $codeName = null;

    #[ORM\Column(type: 'string', length: 100, nullable: false)]
    private ?string $name = null;

    #[ORM\ManyToOne(targetEntity: Radio::class, inversedBy: 'streams')]
    #[ORM\JoinColumn(name: 'radio_id', referencedColumnName: 'id')]
    private ?Radio $radio = null;

    #[Groups(['export'])]
    #[ORM\Column(type: 'string', length: 255, nullable: false)]
    private ?string $url = null;

    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    private bool $main = false;

    #[ORM\Column(type: 'boolean', options: ['default' => true])]
    private bool $enabled = true;

    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    private bool $currentSong = true;

    #[ORM\Column(type: 'boolean', options: ['default' => true])]
    private bool $status = true;

    #[ORM\Column(type: 'integer', options: ['default' => 0])]
    private int $retries = 0;

    #[ORM\Column(type: 'integer', options: ['default' => 0])]
    private int $currentSongRetries = 0;

    /**
     * @var ListeningSession[]
     */
    #[ORM\OneToMany(targetEntity: ListeningSession::class, mappedBy: 'radioStream', fetch: 'EXTRA_LAZY')]
    private Collection $listeningSessions;

    /**
     * @var RadioStream[]
     */
    #[ORM\OneToMany(targetEntity: Stream::class, mappedBy: 'radioStream', fetch: 'EXTRA_LAZY')]
    private Collection $streams;

    #[ORM\OneToOne(targetEntity: SubRadio::class, inversedBy: 'radioStream')]
    #[ORM\JoinColumn(name: 'sub_radio_id', referencedColumnName: 'id')]
    private ?SubRadio $subRadio = null;

    #[ORM\Column(nullable: true)]
    private ?bool $ownLogo = null;

    public function __construct() {
        $this->listeningSessions = new ArrayCollection();
        $this->streams = new ArrayCollection();
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function getCodeName(): string
    {
        return $this->codeName;
    }

    public function setCodeName(string $codeName): void
    {
        $this->codeName = $codeName;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): void
    {
        $this->name = $name;
    }

    public function getRadio(): Radio
    {
        return $this->radio;
    }

    public function setRadio(Radio $radio): void
    {
        $this->radio = $radio;
    }

    public function getSubRadio(): SubRadio
    {
        return $this->subRadio;
    }

    public function setSubRadio(SubRadio $subRadio): void
    {
        $this->subRadio = $subRadio;
    }

    public function getUrl(): string
    {
        return $this->url;
    }

    public function setUrl(string $url): void
    {
        $this->url = $url;
    }

    public function isMain(): bool
    {
        return $this->main;
    }

    public function setMain(bool $main): void
    {
        $this->main = $main;
    }

    public function isEnabled(): bool
    {
        return $this->enabled;
    }

    public function setEnabled(bool $enabled): void
    {
        $this->enabled = $enabled;
    }

    public function isCurrentSong(): bool
    {
        return $this->currentSong;
    }

    public function setCurrentSong(bool $currentSong): void
    {
        $this->currentSong = $currentSong;
    }

    public function isStatus(): bool
    {
        return $this->status;
    }

    public function setStatus(bool $status): void
    {
        $this->status = $status;
    }

    public function getRetries(): int
    {
        return $this->retries;
    }

    public function setRetries(int $retries): void
    {
        $this->retries = $retries;
    }

    public function getListeningSessions(): Collection
    {
        return $this->listeningSessions;
    }

    public function setListeningSessions(Collection $listeningSessions): void
    {
        $this->listeningSessions = $listeningSessions;
    }

    public function getStreams(): Collection
    {
        return $this->streams;
    }

    public function setStreams(Collection $streams): void
    {
        $this->streams = $streams;
    }

    public function getCurrentSongRetries(): int
    {
        return $this->currentSongRetries;
    }

    public function setCurrentSongRetries(int $currentSongRetries): void
    {
        $this->currentSongRetries = $currentSongRetries;
    }

    public function isOwnLogo(): ?bool
    {
        return $this->ownLogo;
    }

    public function setOwnLogo(?bool $ownLogo): static
    {
        $this->ownLogo = $ownLogo;

        return $this;
    }

}
