<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection as DoctrineCollection;
use Doctrine\ORM\Mapping as ORM;
use App\Repository\RadioRepository;
use App\Entity\Collection;
use App\Entity\Category;

#[ORM\Table]
#[ORM\Index(name: 'radio_code_name_idx', columns: ['code_name'])]
#[ORM\Entity(repositoryClass: RadioRepository::class)]
class Radio
{
    public const FAVORITES = 'favorites';

    #[ORM\Column(type: 'integer')]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'NONE')]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 100)]
    private ?string $codeName = null;

    #[ORM\Column(type: 'string', length: 100)]
    private ?string $name = null;

    #[ORM\Column(type: 'string', nullable: true)]
    private ?string $description_fr = null;

    #[ORM\Column(type: 'string', nullable: true)]
    private ?string $description_en = null;

    #[ORM\Column(type: 'string', length: 100, nullable: true)]
    private ?string $website = null;

    #[ORM\Column(type: 'string', length: 100, nullable: true)]
    private ?string $wikipedia_fr = null;

    #[ORM\Column(type: 'string', length: 100, nullable: true)]
    private ?string $wikipedia_en = null;

    #[ORM\Column(type: 'string', length: 50, options: ['default' => 'Europe/Paris'])]
    private string $timezone = 'Europe/Paris';

    #[ORM\ManyToOne(targetEntity: 'Category')]
    private ?Category $category = null;

    #[ORM\ManyToOne(targetEntity: 'Collection', inversedBy: 'radios', fetch: 'EAGER')]
    private ?Collection $collection = null;

    #[ORM\Column(type: 'decimal', scale: 2, options: ['default' => 0])]
    private ?float $share = null;

    #[ORM\Column(type: 'boolean', options: ['default' => true])]
    private bool $active = true;

    /**
     * @var RadioStream[]|null
     */
    #[ORM\OneToMany(targetEntity: RadioStream::class, mappedBy: 'radio', fetch: 'EXTRA_LAZY')]
    private ?DoctrineCollection $streams;

    /**
     * @var SubRadio[]
     */
    #[ORM\OneToMany(targetEntity: SubRadio::class, mappedBy: 'radio')]
    private DoctrineCollection $subRadios;

    public function __construct() {
        $this->streams = new ArrayCollection();
        $this->subRadios = new ArrayCollection();
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

    public function getShare(): float
    {
        return $this->share;
    }

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

    public function getStreams(): Doctrinecollection
    {
        return $this->streams;
    }

    public function setStreams(Doctrinecollection $streams): void
    {
        $this->streams = $streams;
    }

    public function getMainStream(): ?RadioStream
    {
        foreach ($this->streams as $stream) {
            if ($stream->isMain() === true) {
                return $stream;
            }
        }

        return null;
    }

    public function getSubRadios(): DoctrineCollection
    {
        return $this->subRadios;
    }

    public function setSubRadios(DoctrineCollection $subRadios): void
    {
        $this->subRadios = $subRadios;
    }

    public function getDescriptionFr(): ?string
    {
        return $this->description_fr;
    }

    public function setDescriptionFr(?string $description_fr): void
    {
        $this->description_fr = $description_fr;
    }

    public function getDescriptionEn(): ?string
    {
        return $this->description_en;
    }

    public function setDescriptionEn(?string $description_en): void
    {
        $this->description_en = $description_en;
    }

    public function getWebsite(): ?string
    {
        return $this->website;
    }

    public function setWebsite(?string $website): void
    {
        $this->website = $website;
    }

    public function getWikipediaFr(): ?string
    {
        return $this->wikipedia_fr;
    }

    public function setWikipediaFr(?string $wikipedia_fr): void
    {
        $this->wikipedia_fr = $wikipedia_fr;
    }

    public function getWikipediaEn(): ?string
    {
        return $this->wikipedia_en;
    }

    public function setWikipediaEn(?string $wikipedia_en): void
    {
        $this->wikipedia_en = $wikipedia_en;
    }
}
