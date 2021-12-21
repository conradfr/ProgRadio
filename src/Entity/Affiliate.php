<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use App\Repository\AffiliateRepository;

/**
 * @ORM\Entity(repositoryClass=AffiliateRepository::class)
 * @ORM\Table(indexes={@ORM\Index(name="affiliate_id_seq", columns={"locale"})})
 */
class Affiliate
{
    /**
     * @var integer
     *
     * @ORM\Column(type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue()
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(type="string")
     */
    private $locale;

    /**
     * @var string
     *
     * @ORM\Column(type="string")
     */
    private $htmlLink;

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
