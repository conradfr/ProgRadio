<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use App\Repository\StreamSongRepository;

#[ORM\Table]
#[ORM\Entity(repositoryClass: StreamSongRepository::class)]
class StreamSong
{
    #[ORM\Column(type: 'integer')]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'NONE')]
    private ?int $id;

    #[ORM\Column(type: 'string', length: 100)]
    private ?string $codeName = null;

    #[ORM\Column(type: 'boolean', options: ['default' => true])]
    private bool $enabled = true;

    #[ORM\Column(type: 'integer', options: ['default' => 0])]
    private int $retries = 0;


    /**
     * @var Stream[]
     */
    #[ORM\OneToMany(targetEntity: Stream::class, mappedBy: 'streamSong', fetch: 'EXTRA_LAZY')]
    private ArrayCollection $streams;

    public function __construct() {
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

    public function getStreams(): Collection
    {
        return $this->streams;
    }

    public function setStreams(Collection $streams): void
    {
        $this->streams = $streams;
    }

    public function isEnabled(): bool
    {
        return $this->enabled;
    }

    public function setEnabled(bool $enabled): void
    {
        $this->enabled = $enabled;
    }

    public function getRetries(): int
    {
        return $this->retries;
    }

    public function setRetries(int $retries): void
    {
        $this->retries = $retries;
    }
}
