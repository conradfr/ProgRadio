<?php

namespace App\Entity;

use App\Repository\RadioStreamUpdateRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: RadioStreamUpdateRepository::class)]
class RadioStreamUpdate
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\OneToOne(inversedBy: 'RadioStreamUpdate', cascade: ['persist', 'remove'])]
    #[ORM\JoinColumn(nullable: false)]
    private ?RadioStream $RadioStream = null;

    #[ORM\Column(type: Types::TEXT)]
    private ?string $type = null;

    #[ORM\Column(type: Types::TEXT)]
    private ?string $url = null;

    #[ORM\Column(type: Types::TEXT)]
    private ?string $path = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $lastSuccessfulRun = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $lastFailedRun = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getRadioStream(): ?RadioStream
    {
        return $this->RadioStream;
    }

    public function setRadioStream(RadioStream $RadioStream): static
    {
        $this->RadioStream = $RadioStream;

        return $this;
    }

    public function getType(): ?string
    {
        return $this->type;
    }

    public function setType(string $type): static
    {
        $this->type = $type;

        return $this;
    }

    public function getUrl(): ?string
    {
        return $this->url;
    }

    public function setUrl(string $url): static
    {
        $this->url = $url;

        return $this;
    }

    public function getPath(): ?string
    {
        return $this->path;
    }

    public function setPath(string $path): static
    {
        $this->path = $path;

        return $this;
    }

    public function getLastSuccessfulRun(): ?\DateTimeInterface
    {
        return $this->lastSuccessfulRun;
    }

    public function setLastSuccessfulRun(?\DateTimeInterface $lastSuccessfulRun): static
    {
        $this->lastSuccessfulRun = $lastSuccessfulRun;

        return $this;
    }

    public function getLastFailedRun(): ?\DateTimeInterface
    {
        return $this->lastFailedRun;
    }

    public function setLastFailedRun(?\DateTimeInterface $lastFailedRun): static
    {
        $this->lastFailedRun = $lastFailedRun;

        return $this;
    }
}
