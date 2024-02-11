<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use App\Repository\AffiliateRepository;

#[ORM\Table]
#[ORM\Entity(repositoryClass: AffiliateRepository::class)]
class Affiliate
{
    #[ORM\Column(type: 'integer')]
    #[ORM\Id]
    #[ORM\GeneratedValue]
    private ?int $id;

    #[ORM\Column(type: 'string')]
    private ?string $htmlLink = null;

    #[ORM\Column(type: 'string')]
    private ?string $text_fr = null;

    #[ORM\Column(type: 'string')]
    private ?string $text_en = null;

    #[ORM\Column(type: 'string')]
    private ?string $text_es = null;

    #[ORM\Column(type: 'string')]
    private ?string $text_de = null;

    #[ORM\Column(type: 'string')]
    private ?string $base64img = null;

    public function getId(): int
    {
        return $this->id;
    }

    public function getHtmlLink(): string
    {
        return $this->htmlLink;
    }

    public function setHtmlLink(string $htmlLink): void
    {
        $this->htmlLink = $htmlLink;
    }

    public function getNameFr(): ?string
    {
        return $this->name_fr;
    }

    public function setNameFr(?string $text_fr): void
    {
        $this->name_fr = $text_fr;
    }

    public function getNameEn(): ?string
    {
        return $this->name_en;
    }

    public function setNameEn(?string $text_en): void
    {
        $this->name_en = $text_en;
    }

    public function getNameEs(): ?string
    {
        return $this->name_es;
    }

    public function setNameEs(?string $text_es): void
    {
        $this->name_es = $text_es;
    }

    public function getNameDe(): ?string
    {
        return $this->name_de;
    }

    public function setNameDe(?string $text_de): void
    {
        $this->name_de = $text_de;
    }

    public function getBase64img(): ?string
    {
        return $this->base64img;
    }

    public function setBase64img(?string $base64img): void
    {
        $this->base64img = $base64img;
    }


}
