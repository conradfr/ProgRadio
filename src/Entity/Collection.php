<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

/**
 * Collection
 *
 * @ORM\Entity
 *
 * @ORM\Entity(repositoryClass="App\Repository\CollectionRepository")
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
    private $sort_field;

    /**
     * @var string
     *
     * @ORM\Column(type="string", length=5)
     * @Groups({"export"})
     */
    private $sort_order;

    /**
     * @return int
     */
    public function getId(): int
    {
        return $this->id;
    }

    /**
     * @param int $id
     */
    public function setId($id): void
    {
        $this->id = $id;
    }

    /**
     * @return string
     */
    public function getCodeName(): string
    {
        return $this->codeName;
    }

    /**
     * @param string $codeName
     */
    public function setCodeName($codeName): void
    {
        $this->codeName = $codeName;
    }

    /**
     * @return string
     */
    public function getName(): string
    {
        return $this->name;
    }

    /**
     * @param string $name
     */
    public function setName($name): void
    {
        $this->name = $name;
    }

    /**
     * @return int
     */
    public function getPriority(): int
    {
        return $this->priority;
    }

    /**
     * @param int $priority
     */
    public function setPriority(int $priority): void
    {
        $this->priority = $priority;
    }

    /**
     * @return string
     */
    public function getSortField(): string
    {
        return $this->sort_field;
    }

    /**
     * @param string $sort_field
     */
    public function setSortField(string $sort_field): void
    {
        $this->sort_field = $sort_field;
    }

    /**
     * @return string
     */
    public function getSortOrder(): string
    {
        return $this->sort_order;
    }

    /**
     * @param string $sort_order
     */
    public function setSortOrder(string $sort_order): void
    {
        $this->sort_order = $sort_order;
    }
}
