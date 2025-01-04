<?php

declare(strict_types=1);

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use App\Repository\SubRadioRepository;
use App\Entity\Radio;
use App\Entity\RadioStream;

#[ORM\Entity(repositoryClass: SubRadioRepository::class)]
class SubRadio
{
    #[ORM\Column(type: 'bigint')]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'AUTO')]
    private ?int $id;

    #[ORM\Column(type: 'string', length: 100)]
    private ?string $codeName = null;

    #[ORM\Column(type: 'string', length: 100, nullable: false)]
    private ?string $name = null;

    #[ORM\ManyToOne(targetEntity: Radio::class, inversedBy: 'subRadios')]
    #[ORM\JoinColumn(name: 'radio_id', referencedColumnName: 'id')]
    private ?Radio $radio = null;

    #[ORM\OneToOne(targetEntity: RadioStream::class, mappedBy: 'subRadio', fetch: 'EXTRA_LAZY')]
    private ?RadioStream $radioStream = null;

    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    private bool $main = false;

    #[ORM\Column(type: 'boolean', options: ['default' => true])]
    private bool $enabled = true;

    public function getId(): int
    {
        return $this->id;
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

    public function getRadio(): Radio
    {
        return $this->radio;
    }

    public function setRadio(Radio $radio): void
    {
        $this->radio = $radio;
    }

    public function isMain(): bool
    {
        return $this->main;
    }

    public function setMain(bool $main): void
    {
        $this->main = $main;
    }

    public function isEnabled(): bool
    {
        return $this->enabled;
    }

    public function setEnabled(bool $enabled): void
    {
        $this->enabled = $enabled;
    }

    public function getRadioStream(): RadioStream
    {
        return $this->radioStream;
    }

    public function setRadioStream(RadioStream $radioStream): void
    {
        $this->radioStream = $radioStream;
    }
}
