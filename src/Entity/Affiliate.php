<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use App\Repository\AffiliateRepository;

#[ORM\Table]
#[ORM\Index(name: 'affiliate_id_seq', columns: ['locale'])]
#[ORM\Entity(repositoryClass: AffiliateRepository::class)]
class Affiliate
{
    #[ORM\Column(type: 'integer')]
    #[ORM\Id]
    #[ORM\GeneratedValue]
    private ?int $id;

    #[ORM\Column(type: 'string')]
    private ?string $locale = null;

    #[ORM\Column(type: 'string')]
    private ?string $htmlLink = null;

    public function getId(): int
    {
        return $this->id;
    }

    public function getLocale(): string
    {
        return $this->locale;
    }

    public function setLocale(string $locale): void
    {
        $this->locale = $locale;
    }

    public function getHtmlLink(): string
    {
        return $this->htmlLink;
    }

    public function setHtmlLink(string $htmlLink): void
    {
        $this->htmlLink = $htmlLink;
    }
}
