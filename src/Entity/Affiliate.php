<?php

declare(strict_types=1);

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

    public function getTextFr(): ?string
    {
        return $this->text_fr;
    }

    public function setTextFr(?string $text_fr): void
    {
        $this->text_fr = $text_fr;
    }

    public function getTextEn(): ?string
    {
        return $this->text_en;
    }

    public function setTextEn(?string $text_en): void
    {
        $this->text_en = $text_en;
    }

    public function getTextEs(): ?string
    {
        return $this->text_es;
    }

    public function setTextEs(?string $text_es): void
    {
        $this->text_es = $text_es;
    }

    public function getTextDe(): ?string
    {
        return $this->text_de;
    }

    public function setTextDe(?string $text_de): void
    {
        $this->text_de = $text_de;
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
