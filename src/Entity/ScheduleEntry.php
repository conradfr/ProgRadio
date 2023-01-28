<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\ORM\Mapping\Index;
use Symfony\Component\Serializer\Annotation\Groups;
use App\Entity\Radio;
use App\Entity\SubRadio;

/**
 * @ORM\Entity(repositoryClass="App\Repository\ScheduleEntryRepository")
 * @ORM\Table(indexes={@ORM\Index(name="starttime_idx", columns={"date_time_start"}), @ORM\Index(name="endtime_idx", columns={"date_time_end"})})
 */
class ScheduleEntry
{
    /**
     *
     * @ORM\Column(type="bigint")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
     */
    private ?int $id = null;

    /**
     * @ORM\ManyToOne(targetEntity="Radio")
     * @ORM\JoinColumn(name="radio_id", referencedColumnName="id")
     */
    private ?Radio $radio = null;

    /**
     * @ORM\OneToMany(targetEntity="SectionEntry", mappedBy="scheduleEntry")
     */
    private ArrayCollection $sectionEntries;

    /**
     * @ORM\Column(type="datetime")
     */
    #[Groups(['export'])]
    private ?\DateTime $dateTimeStart = null;

    /**
     * @ORM\Column(type="datetime")
     */
    #[Groups(['export'])]
    private ?\DateTime $dateTimeEnd = null;

    #[Groups(['export'])]
    private ?int $duration = null;

    /**
     * @ORM\Column(type="text")
     */
    #[Groups(['export'])]
    private ?string $title = null;

    /**
     * @ORM\Column(type="text", nullable=true)
     */
    #[Groups(['export'])]
    private ?string $host = null;

    /**
     * @ORM\Column(type="text", nullable=true)
     */
    #[Groups(['export'])]
    private ?string $description = null;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    #[Groups(['export'])]
    private ?string $pictureUrl = null;

    /**
     *
     * @ORM\ManyToOne(targetEntity=SubRadio::class)
     * @ORM\JoinColumn(name="sub_radio_id", referencedColumnName="id")
     */
    private ?SubRadio $subRadio = null;

    public function __construct() {
        $this->sectionEntries = new ArrayCollection();
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function setId(int $id): ScheduleEntry
    {
        $this->id = $id;

        return $this;
    }

    public function getRadio(): Radio
    {
        return $this->radio;
    }

    public function setRadio(Radio $radio): ScheduleEntry
    {
        $this->radio = $radio;

        return $this;
    }

    public function getDateTimeStart(): \DateTime
    {
        return $this->dateTimeStart;
    }

    public function setDateTimeStart(\DateTime $dateTimeStart): ScheduleEntry
    {
        $this->dateTimeStart = $dateTimeStart;

        return $this;
    }

    public function getDateTimeEnd(): \DateTime
    {
        return $this->dateTimeEnd;
    }

    public function setDateTimeEnd(\DateTime $dateTimeEnd): ScheduleEntry
    {
        $this->dateTimeEnd = $dateTimeEnd;

        return $this;
    }

    public function getDuration(): int
    {
        return $this->duration;
    }

    public function setDuration(int $duration): ScheduleEntry
    {
        $this->duration = $duration;

        return $this;
    }

    public function getTitle(): string
    {
        return $this->title;
    }

    public function setTitle(string $title): ScheduleEntry
    {
        $this->title = $title;

        return $this;
    }

    public function getHost(): string
    {
        return $this->host;
    }

    public function setHost(string $host): ScheduleEntry
    {
        $this->host = $host;

        return $this;
    }

    public function getDescription(): string
    {
        return $this->description;
    }

    public function setDescription(string $description): ScheduleEntry
    {
        $this->description = $description;

        return $this;
    }

    public function getPictureUrl(): string
    {
        return $this->pictureUrl;
    }

    public function setPictureUrl(string $pictureUrl): ScheduleEntry
    {
        $this->pictureUrl = $pictureUrl;

        return $this;
    }

    public function getSectionEntries(): ArrayCollection
    {
        return $this->sectionEntries;
    }

    public function setSectionEntries(ArrayCollection $sectionEntries): ScheduleEntry
    {
        $this->sectionEntries = $sectionEntries;

        return $this;
    }

    public function getSubRadio(): SubRadio
    {
        return $this->subRadio;
    }

    public function setSubRadio(SubRadio $subRadio): void
    {
        $this->subRadio = $subRadio;
    }
}
