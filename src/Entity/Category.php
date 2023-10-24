<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: 'App\Repository\CategoryRepository')]
class Category
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
    private string $name_el;

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
