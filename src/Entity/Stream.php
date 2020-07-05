<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Repository\StreamRepository")
 * @ORM\Table()
 */
class Stream
{
    /**
     * @var string
     *
     * @ORM\Column(type="uuid", unique=true)
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="NONE")
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(type="string", length=500)
     */
    private $name;

    /**
     * @var string
     *
     * @ORM\Column(type="string", length=500)
     */
    private $img;

    /**
     * @var string
     *
     * @ORM\Column(type="string", length=500)
     */
    private $streamUrl;

    /**
     * @var string
     *
     * @ORM\Column(type="string", length=2)
     */
    private $countryCode;

    /**
     * @var string
     *
     * @ORM\Column(type="string", length=255)
     */
    private $language;

    /**
     * @var int
     *
     * @ORM\Column(type="integer", options={"default"=0})
     */
    private $votes;

    /**
     * @var int
     *
     * @ORM\Column(type="integer", name="clicks_last_24h", options={"default"=0})
     */
    private $clicksLast24h;

    public function getId(): int
    {
        return $this->id;
    }

    public function setId(int $id): void
    {
        $this->id = $id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): void
    {
        $this->name = $name;
    }

    public function getImg(): string
    {
        return $this->img;
    }

    public function setImg(string $img): void
    {
        $this->img = $img;
    }

    public function getStreamUrl(): string
    {
        return $this->streamUrl;
    }

    public function setStreamUrl(string $streamUrl): void
    {
        $this->streamUrl = $streamUrl;
    }

    public function getCountryCode(): string
    {
        return $this->countryCode;
    }

    public function setCountryCode(string $countryCode): void
    {
        $this->countryCode = $countryCode;
    }

    public function getLanguage(): string
    {
        return $this->language;
    }

    public function setLanguage(string $language): void
    {
        $this->language = $language;
    }

    public function getVotes(): int
    {
        return $this->votes;
    }

    public function setVotes(int $votes): void
    {
        $this->votes = $votes;
    }

    public function getClicksLast24h(): int
    {
        return $this->clicksLast24h;
    }

    public function setClicksLast24h(int $clicksLast24h): void
    {
        $this->clicksLast24h = $clicksLast24h;
    }
}
