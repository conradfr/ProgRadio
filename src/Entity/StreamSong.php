<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass=StreamSongRepository::class)
 * @ORM\Table()
 */
class StreamSong
{
    /**
     * @var integer
     *
     * @ORM\Column(type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="NONE")
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(type="string", length=100)
     */
    private $codeName;

    /**
     * @var boolean
     *
     * @ORM\Column(type="boolean", options={"default"=true})
     */
    private $enabled = true;

    /**
     * @var Stream[]
     *
     * @ORM\OneToMany(targetEntity=Stream::class, mappedBy="streamSong", fetch="EXTRA_LAZY")
     */
    private $streams;

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
}
