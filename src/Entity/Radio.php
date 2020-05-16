<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

/**
 * @ORM\Entity(repositoryClass="App\Repository\RadioRepository")
 */
class Radio
{
    public const FAVORITES = 'favorites';

    /**
     * @var integer
     *
     * @ORM\Column(type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="NONE")
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(type="string", length=100)
     * @Groups({"export"})
     */
    private $codeName;

    /**
     * @var string
     *
     * @ORM\Column(type="string", length=100)
     * @Groups({"export"})
     */
    private $name;

    /**
     * @var string
     *
     * @ORM\Column(type="string", length=50, options={"default"="Europe/Paris"})
     * @Groups({"export"})
     */
    private $timezone = 'Europe/Paris';

    /**
     * @ORM\ManyToOne(targetEntity="Category")
     */
    private $category;

    /**
     * @ORM\ManyToOne(targetEntity="Collection", inversedBy="radios", fetch="EAGER")
     */
    private $collection;

    /**
     * @var double
     *
     * @ORM\Column(type="decimal", scale=2, options={"default"=0})
     * @Groups({"export"})
     */
    private $share;

    /**
     * @var string
     *
     * @ORM\Column(type="string", length=255, nullable=true)
     * @Groups({"export"})
     */
    private $streamingUrl;

    /**
     * @var boolean
     *
     * @ORM\Column(type="boolean", options={"default"=true})
     */
    private $streamingEnabled = true;

    /**
     * @var boolean
     *
     * @ORM\Column(type="boolean", options={"default"=true})
     */
    private $streamingStatus = true;

    /**
     * @var int
     *
     * @ORM\Column(type="integer", options={"default"=true})
     */
    private $streamingRetries = true;

    /**
     * @var boolean
     *
     * @ORM\Column(type="boolean", options={"default"=true})
     */
    private $active = true;

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

    public function getCategory(): Category
    {
        return $this->category;
    }

    public function setCategory(Category $category): void
    {
        $this->category = $category;
    }

    public function getCollection(): Collection
    {
        return $this->collection;
    }

    public function setCollection(Collection $collection): void
    {
        $this->collection = $collection;
    }

    /**
     * @return double
     */
    public function getShare(): float
    {
        return $this->share;
    }

    /**
     * @param double $share
     */
    public function setShare(float $share): void
    {
        $this->share = $share;
    }

    public function getstreamingUrl(): string
    {
        return $this->streamingUrl;
    }

    public function setstreamingUrl(string $streamingUrl): void
    {
        $this->streamingUrl = $streamingUrl;
    }

    public function getCodeName(): string
    {
        return $this->codeName;
    }

    public function setCodeName(string $codeName): void
    {
        $this->codeName = $codeName;
    }

    public function getTimezone(): string
    {
        return $this->timezone;
    }

    public function setTimezone(string $timezone): void
    {
        $this->timezone = $timezone;
    }

    public function isActive(): bool
    {
        return $this->active;
    }

    public function setActive(bool $active): void
    {
        $this->active = $active;
    }

    public function isStreamingEnabled(): bool
    {
        return $this->streamingEnabled;
    }

    public function setStreamingEnabled(bool $enabled): void
    {
        $this->active = $enabled;
    }

    public function isStreamingStatus(): bool
    {
        return $this->streamingStatus;
    }

    public function setStreamingStatus(bool $streamingStatus): void
    {
        $this->streamingStatus = $streamingStatus;
    }

    public function getStreamingRetries(): int
    {
        return $this->streamingRetries;
    }

    public function setStreamingRetries(int $streamingRetries): void
    {
        $this->streamingRetries = $streamingRetries;
    }
}
