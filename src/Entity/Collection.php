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
}
