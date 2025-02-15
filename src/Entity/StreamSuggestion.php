<?php

declare(strict_types=1);

namespace App\Entity;

use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

#[ORM\Table(name: '`stream_suggestion`')]
#[ORM\Entity(repositoryClass: 'App\Repository\StreamSuggestionRepository')]
class StreamSuggestion
{
    #[ORM\Column(type: 'integer')]
    #[ORM\Id]
    #[ORM\GeneratedValue]
    private ?int $id;

    #[ORM\ManyToOne(targetEntity: Stream::class)]
    #[ORM\JoinColumn(name: 'stream_id', referencedColumnName: 'id')]
    private Stream $stream;

    #[ORM\Column(type: 'string', length: 500, nullable: true)]
    private ?string $name = null;

    #[ORM\Column(type: 'string', length: 500, nullable: true)]
    private ?string $img = null;

    #[ORM\Column(type: 'string', length: 500, nullable: true)]
    private ?string $streamUrl = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $website = null;

    #[ORM\Column(type: 'string', length: 500, nullable: true)]
    private ?string $tags = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $message = null;

    #[Gedmo\Timestampable(on: 'create')]
    #[ORM\Column(name: 'created_at', type: Types::DATETIME_MUTABLE, nullable: true)]
    private \DateTime $createdAt;

    public function getId(): int
    {
        return $this->id;
    }

    public function setId(int $id): void
    {
        $this->id = $id;
    }

    public function getStream(): Stream
    {
        return $this->stream;
    }
    public function setStream(Stream $stream): void
    {
        $this->stream = $stream;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(?string $name): void
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

    public function getStreamUrl(): ?string
    {
        return $this->streamUrl;
    }

    public function setStreamUrl(?string $streamUrl): void
    {
        $this->streamUrl = $streamUrl;
    }

    public function getWebsite(): ?string
    {
        return $this->website;
    }

    public function getTags(): ?string
    {
        return $this->tags;
    }

    public function setTags(?string $tags): void
    {
        $this->tags = $tags;
    }

    public function setWebsite(?string $website): void
    {
        $this->website = $website;
    }

    public function getMessage(): ?string
    {
        return $this->message;
    }

    public function setMessage(?string $message = null): void
    {
        $this->message = $message;
    }

    public function getCreatedAt(): \DateTime
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTime $createdAt): void
    {
        $this->createdAt = $createdAt;
    }
}
