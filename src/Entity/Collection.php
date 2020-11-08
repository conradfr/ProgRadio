<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use App\Entity\Radio;

/**
 * @ORM\Entity(repositoryClass="App\Repository\CollectionRepository")
 * @ORM\Table(indexes={@ORM\Index(name="collection_code_name_idx", columns={"code_name"})})
 */
class Collection
{
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
     * @ORM\Column(type="string", length=25)
     * @Groups({"export"})
     */
    private $shortName;

    /**
     * @var integer
     *
     * @ORM\Column(type="integer")
     */
    private $priority;

    /**
     * @var string
     *
     * @ORM\Column(type="string", length=25)
     * @Groups({"export"})
     */
    private $sortField;

    /**
     * @var string
     *
     * @ORM\Column(type="string", length=5)
     * @Groups({"export"})
     */
    private $sortOrder;

    /**
     * @ORM\OneToMany(targetEntity="Radio", mappedBy="collection")
     */
    private $radios;

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
        $this->radioss = $radios;
    }
}
