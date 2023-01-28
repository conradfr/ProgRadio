<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

/**
 * @ORM\Entity(repositoryClass="App\Repository\CategoryRepository")
 */
class Category
{
    /**
     *
     * @ORM\Column(type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="NONE")
     */
    private ?int $id = null;

    /**
     * @ORM\Column(type="string", length=100)
     */
    #[Groups(['export'])]
    private ?string $codeName = null;

    /**
     * @ORM\Column(type="string", length=100)
     */
    #[Groups(['export'])]
    private ?string $name = null;

    public function getId(): int
    {
        return $this->id;
    }

    public function setId(int $id)
    {
        $this->id = $id;
    }

    public function getCodeName()
    {
        return $this->codeName;
    }

    public function setCodeName(string $codeName)
    {
        $this->codeName = $codeName;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name)
    {
        $this->name = $name;
    }
}
