<?php

namespace App\Entity;

use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

#[ORM\Table(name: '`stream_overloading`')]
#[ORM\Entity(repositoryClass: 'App\Repository\StreamOverloadingRepository')]
class StreamOverloading
{
    #[ORM\Column(type: 'uuid', unique: true)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'NONE')]
    private ?string $id = null;

    #[ORM\Column(type: 'string', length: 500, nullable: true)]
    private ?string $name = null;

    #[ORM\Column(type: 'string', length: 500, nullable: true)]
    private ?string $img = null;

    #[ORM\Column(type: 'string', length: 500, nullable: true)]
    private ?string $streamUrl = null;

    #[ORM\Column(type: 'string', length: 2, nullable: true)]
    private ?string $countryCode = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string  $website = null;

    #[ORM\Column(type: 'string', length: 2, nullable: true)]
    private ?string $tags = null;

    #[ORM\Column(type: 'boolean')]
    private ?bool $enabled = null;

    #[ORM\Column(type: 'boolean')]
    private ?bool $forceHls = null;

    #[ORM\Column(type: 'boolean')]
    private ?bool $forceMpd = null;

    #[Gedmo\Timestampable(on: 'create')]
    #[ORM\Column(name: 'created_at', type: Types::DATETIME_MUTABLE, nullable: true)]
    private \DateTime $createdAt;

    #[Gedmo\Timestampable(on: 'update')]
    #[ORM\Column(name: 'updated_at', type: Types::DATETIME_MUTABLE, nullable: true)]
    private \DateTime $updatedAt;

    public function getId(): string
    {
        return $this->id;
    }

    public function setId(string $id): void
    {
        $this->id = $id;
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

    public function getCountryCode(): ?string
    {
        return $this->countryCode;
    }

    public function setCountryCode(?string $countryCode): void
    {
        $this->countryCode = $countryCode;
    }

    public function getWebsite(): ?string
    {
        return $this->website;
    }

    public function setWebsite(?string $website): void
    {
        $this->website = $website;
    }

    public function getEnabled(): ?bool
    {
        return $this->enabled;
    }

    public function getTags(): ?string
    {
        return $this->tags;
    }

    public function setTags(?string $tags): void
    {
        $this->tags = $tags;
    }

    public function setEnabled(?bool $enabled): void
    {
        $this->enabled = $enabled;
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

    public function getCreatedAt(): \DateTime
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTime $createdAt): void
    {
        $this->createdAt = $createdAt;
    }

    public function getUpdatedAt(): \DateTime
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTime $updatedAt): void
    {
        $this->updatedAt = $updatedAt;
    }

}
