<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use App\Repository\RadioRepository;
use App\Entity\ListeningSession;
use App\Entity\RadioStream;

/**
 * @ORM\Entity(repositoryClass=RadioRepository::class)
 * @ORM\Table(indexes={@ORM\Index(name="radio_code_name_idx", columns={"code_name"})})
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
     */
    private $codeName;

    /**
     * @var string
     *
     * @ORM\Column(type="string", length=100)
     */
    private $name;

    /**
     * @var string
     *
     * @ORM\Column(type="string", length=50, options={"default"="Europe/Paris"})
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
     */
    private $share;

    /**
     * @var boolean
     *
     * @ORM\Column(type="boolean", options={"default"=true})
     */
    private $active = true;

    /**
     * @ORM\OneToMany(targetEntity=ListeningSession::class, mappedBy="radio", fetch="EXTRA_LAZY")
     */
    private $listeningSessions;

    /**
     * @ORM\OneToMany(targetEntity=RadioStream::class, mappedBy="radio", fetch="EXTRA_LAZY")
     */
    private $streams;

    public function __construct() {
        $this->listeningSessions = new ArrayCollection();
        $this->streams = new ArrayCollection();
    }

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

    public function getListeningSessions(): ArrayCollection
    {
        return $this->listeningSessions;
    }

    public function setListeningSessions(ArrayCollection $listeningSessions): void
    {
        $this->listeningSessions = $listeningSessions;
    }
}
