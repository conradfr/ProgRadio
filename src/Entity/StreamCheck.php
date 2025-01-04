<?php

declare(strict_types=1);

namespace App\Entity;

use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Uid\Uuid;

#[ORM\Table(name: '`stream_check`')]
#[ORM\Entity(repositoryClass: 'App\Repository\StreamCheckRepository')]
class StreamCheck
{
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'NONE')]
    private ?Uuid $id;

    #[ORM\Column(type: 'boolean', nullable: true)]
    private ?bool $img = null;

    #[ORM\Column(type: 'boolean', nullable: true)]
    private ?bool $streamUrl = null;

    #[ORM\Column(type: 'boolean', nullable: true)]
    private ?bool $website = null;

    #[ORM\Column(type: 'boolean', nullable: true)]
    private ?bool $websiteSsl = null;

    #[ORM\Column(name: 'checked_at', type: Types::DATETIME_MUTABLE, nullable: true)]
    private \DateTime $checkedAt;

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function setId(Uuid $id): void
    {
        $this->id = $id;
    }

    public function getImg(): ?bool
    {
        return $this->img;
    }

    public function setImg(?bool $img): void
    {
        $this->img = $img;
    }

    public function getStreamUrl(): ?bool
    {
        return $this->streamUrl;
    }

    public function setStreamUrl(?bool $streamUrl): void
    {
        $this->streamUrl = $streamUrl;
    }

    public function getWebsite(): ?bool
    {
        return $this->website;
    }

    public function setWebsite(?bool $website): void
    {
        $this->website = $website;
    }

    public function getWebsiteSsl(): ?bool
    {
        return $this->websiteSsl;
    }

    public function setWebsiteSsl(?bool $websiteSsl): void
    {
        $this->websiteSsl = $websiteSsl;
    }

    public function getCheckedAt(): \DateTime
    {
        return $this->checkedAt;
    }

    public function setCheckedAt(\DateTime $checkedAt): void
    {
        $this->checkedAt = $checkedAt;
    }
}
