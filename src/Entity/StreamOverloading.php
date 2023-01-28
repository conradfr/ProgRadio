<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Repository\StreamOverloadingRepository")
 * @ORM\Table(name="`stream_overloading`")
 */
class StreamOverloading
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
     * @ORM\Column(type="string", length=500, nullable=true))
     */
    private ?string $name;

    /**
     * @ORM\Column(type="string", length=500, nullable=true)
     */
    private ?string $img;

    /**
     * @ORM\Column(type="string", length=500, nullable=true))
     */
    private ?string $streamUrl;

    /**
     * @ORM\Column(type="string", length=2, nullable=true))
     */
    private ?string $countryCode;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private ?string  $website;


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



}
