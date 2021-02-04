<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use App\Repository\RadioStreamRepository;

/**
 * @ORM\Entity(repositoryClass=RadioStreamRepository::class)
 * @ORM\Table(indexes={@ORM\Index(name="radio_stream_code_name_idx", columns={"code_name"})})
 */
class RadioStream
{
    /**
     * @var string
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
     * @ORM\ManyToOne(targetEntity=Radio::class, inversedBy="streams")
     * @ORM\JoinColumn(name="radio_id", referencedColumnName="id")
     */
    private $radio;

    /**
     * @var string
     *
     * @ORM\Column(type="string", length=255, nullable=false)
     * @Groups({"export"})
     */
    private $url;

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

    /**
     * @var boolean
     *
     * @ORM\Column(type="boolean", options={"default"=true})
     */
    private $status = true;

    /**
     * @var int
     *
     * @ORM\Column(type="integer", options={"default"=0})
     */
    private $retries = 0;

    /**
     * @ORM\OneToMany(targetEntity=ListeningSession::class, mappedBy="radioStream", fetch="EXTRA_LAZY")
     */
    private $listeningSessions;

    public function __construct() {
        $this->listeningSessions = new ArrayCollection();
    }

    public function getId(): string
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

    public function getUrl(): string
    {
        return $this->url;
    }

    public function setUrl(string $url): void
    {
        $this->url = $url;
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

    public function isStatus(): bool
    {
        return $this->status;
    }

    public function setStatus(bool $status): void
    {
        $this->status = $status;
    }

    public function getRetries(): int
    {
        return $this->retries;
    }

    public function setRetries(int $retries): void
    {
        $this->retries = $retries;
    }

    public function getListeningSessions(): ArrayCollection
    {
        return $this->listeningSessions;
    }

    public function setListeningSessions(ArrayCollection $listeningSessions): void
    {
        $this->listeningSessions = $listeningSessions;
    }
}
