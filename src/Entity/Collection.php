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
    #[ORM\Column(type: 'string', length: 100)]
    private string $name_it;

    #[Groups(['export'])]
    #[ORM\Column(type: 'string', length: 100)]
    private string $name_pl;


    #[Groups(['export'])]
    #[ORM\Column(type: 'string', length: 100)]
    private string $name_el;

    #[Groups(['export'])]
    #[ORM\Column(type: 'string', length: 100)]
    private string $name_ar;

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

    public function getNameFr(): string
    {
        return $this->name_fr;
    }

    public function setNameFr(string $name_fr): void
    {
        $this->name_fr = $name_fr;
    }

    public function getNameEn(): string
    {
        return $this->name_en;
    }

    public function setNameEn(string $name_en): void
    {
        $this->name_en = $name_en;
    }

    public function getNameEs(): string
    {
        return $this->name_es;
    }

    public function setNameEs(string $name_es): void
    {
        $this->name_es = $name_es;
    }

    public function getNameDe(): string
    {
        return $this->name_de;
    }

    public function setNameDe(string $name_de): void
    {
        $this->name_de = $name_de;
    }

    public function getNamePt(): string
    {
        return $this->name_pt;
    }

    public function setNamePt(string $name_pt): void
    {
        $this->name_pt = $name_pt;
    }

    public function getNameIt(): string
    {
        return $this->name_it;
    }

    public function setNameIt(string $name_it): void
    {
        $this->name_it = $name_it;
    }

    public function getNamePl(): string
    {
        return $this->name_pl;
    }

    public function setNamePl(string $name_pl): void
    {
        $this->name_pl = $name_pl;
    }

    public function getNameEl(): string
    {
        return $this->name_el;
    }

    public function setNameEl(string $name_el): void
    {
        $this->name_el = $name_el;
    }

    public function getNameAr(): string
    {
        return $this->name_ar;
    }

    public function setNameAr(string $name_ar): void
    {
        $this->name_ar = $name_ar;
    }

}
