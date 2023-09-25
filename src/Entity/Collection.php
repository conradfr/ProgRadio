<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection as DoctrineCollection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use App\Entity\Radio;

#[ORM\Table]
#[ORM\Index(name: 'collection_code_name_idx', columns: ['code_name'])]
#[ORM\Entity(repositoryClass: 'App\Repository\CollectionRepository')]
class Collection
{
    #[ORM\Column(type: 'integer')]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'NONE')]
    private ?int $id = null;

    #[Groups(['export'])]
    #[ORM\Column(type: 'string', length: 100)]
    private ?string $codeName = null;

    #[Groups(['export'])]
    #[ORM\Column(type: 'string', length: 100)]
    private ?string $name = null;

    #[Groups(['export'])]
    #[ORM\Column(type: 'string', length: 100)]
    private string $name_fr;

    #[Groups(['export'])]
    #[ORM\Column(type: 'string', length: 100)]
    private string $name_en;

    #[Groups(['export'])]
    #[ORM\Column(type: 'string', length: 100)]
    private string $name_es;

    #[Groups(['export'])]
    #[ORM\Column(type: 'string', length: 100)]
    private string $name_de;

    #[Groups(['export'])]
    #[ORM\Column(type: 'string', length: 100)]
    private string $name_pt;

    #[Groups(['export'])]
    #[ORM\Column(type: 'string', length: 25)]
    private ?string $shortName = null;

    #[ORM\Column(type: 'integer')]
    private ?int $priority = null;

    #[Groups(['export'])]
    #[ORM\Column(type: 'string', length: 25)]
    private ?string $sortField = null;

    #[Groups(['export'])]
    #[ORM\Column(type: 'string', length: 5)]
    private ?string $sortOrder = null;

    #[ORM\OneToMany(targetEntity: 'Radio', mappedBy: 'collection')]
    private DoctrineCollection $radios;

    public function __construct() {
        $this->radios = new ArrayCollection();
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function setId(int $id): void
    {
        $this->id = $id;
    }

    public function getCodeName(): string
    {
        return $this->codeName;
    }

    public function setCodeName(string $codeName): void
    {
        $this->codeName = $codeName;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): void
    {
        $this->name = $name;
    }

    public function getShortName(): string
    {
        return $this->shortName;
    }

    public function setShortName(string $shortName): void
    {
        $this->shortName = $shortName;
    }

    public function getPriority(): int
    {
        return $this->priority;
    }

    public function setPriority(int $priority): void
    {
        $this->priority = $priority;
    }

    public function getSortField(): string
    {
        return $this->sortField;
    }

    public function setSortField(string $sortField): void
    {
        $this->sortField = $sortField;
    }

    public function getSortOrder(): string
    {
        return $this->sortOrder;
    }

    public function setSortOrder(string $sortOrder): void
    {
        $this->sortOrder = $sortOrder;
    }

    public function getRadios(): ArrayCollection
    {
        return $this->radios;
    }

    public function setRadio(ArrayCollection $radios): void
    {
        $this->radios = $radios;
    }
}
