<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use App\Repository\SubRadioRepository;

/**
 * @ORM\Entity(repositoryClass=SubRadioRepository::class)
 */
class SubRadio
{
    /**
     * @var integer
     *
     * @ORM\Column(type="bigint")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(type="string", length=100)
     */
    private $codeName;

    /**
     * @var string
     *
     * @ORM\Column(type="string", length=100, nullable=false)
     */
    private $name;

    /**
     * @var Radio
     *
     * @ORM\ManyToOne(targetEntity=Radio::class, inversedBy="subRadios")
     * @ORM\JoinColumn(name="radio_id", referencedColumnName="id")
     */
    private $radio;

    /**
     * @var RadioStream
     *
     * @ORM\OneToOne(targetEntity=RadioStream::class, mappedBy="subRadio", fetch="EXTRA_LAZY")
     */
    private $radioStream;

    public function __construct() {
        $this->listeningSessions = new ArrayCollection();
    }

    /**
     * @var boolean
     *
     * @ORM\Column(type="boolean", options={"default"=false})
     */
    private $main = false;

    /**
     * @var boolean
     *
     * @ORM\Column(type="boolean", options={"default"=true})
     */
    private $enabled = true;

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
