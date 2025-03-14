<?php

declare(strict_types=1);

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
    private string $name_pl;

    #[Groups(['export'])]
    #[ORM\Column(type: 'string', length: 100)]
    private string $name_el;

    #[Groups(['export'])]
    #[ORM\Column(type: 'string', length: 100)]
    private string $name_ar;

    #[Groups(['export'])]
    #[ORM\Column(type: 'string', length: 100)]
    private string $name_hu;

    #[Groups(['export'])]
    #[ORM\Column(type: 'string', length: 100)]
    private string $name_tr;

    #[Groups(['export'])]
    #[ORM\Column(type: 'string', length: 100)]
    private string $name_se;

    #[Groups(['export'])]
    #[ORM\Column(type: 'string', length: 100)]
    private string $name_dk;

    #[Groups(['export'])]
    #[ORM\Column(type: 'string', length: 100)]
    private string $name_ro;

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

    public function getNameHu(): string
    {
        return $this->name_hu;
    }

    public function setNameHu(string $name_hu): void
    {
        $this->name_hu = $name_hu;
    }

    public function getNameTr(): string
    {
        return $this->name_tr;
    }

    public function setNameTr(string $name_tr): void
    {
        $this->name_tr = $name_tr;
    }

    public function getNameSe(): string
    {
        return $this->name_se;
    }

    public function setNameSe(string $name_se): void
    {
        $this->name_se = $name_se;
    }

    public function getNameDk(): string
    {
        return $this->name_dk;
    }

    public function setNameDk(string $name_dk): void
    {
        $this->name_dk = $name_dk;
    }

    public function getNameRo(): string
    {
        return $this->name_ro;
    }

    public function setNameRo(string $name_ro): void
    {
        $this->name_ro = $name_ro;
    }
}
