<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use App\Entity\ScheduleEntry;

/**
 * @ORM\Entity(repositoryClass="App\Repository\ScheduleEntryRepository")
 */
class SectionEntry
{
    /**
     *
     * @ORM\Column(type="bigint")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
     */
    private ?int $id = null;

    /**
     *
     * @ORM\ManyToOne(targetEntity="ScheduleEntry", inversedBy="sectionEntries")
     * @ORM\JoinColumn(name="schedule_entry_id", referencedColumnName="id")
     */
    private ?ScheduleEntry $scheduleEntry = null;

    /**
     * @ORM\Column(type="datetime")
     */
    #[Groups(['export'])]
    private ?\DateTime $dateTimeStart = null;

    /**
     * @ORM\Column(type="text")
     */
    #[Groups(['export'])]
    private ?string $title = null;

    /**
     * @ORM\Column(type="string", length=100, nullable=true)
     */
    #[Groups(['export'])]
    private ?string $presenter = null;

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

    public function getId(): int
    {
        return $this->id;
    }

    public function setId(int $id): SectionEntry
    {
        $this->id = $id;

        return $this;
    }

    public function getScheduleEntry(): ScheduleEntry
    {
        return $this->scheduleEntry;
    }

    public function setScheduleEntry(ScheduleEntry $scheduleEntry): SectionEntry
    {
        $this->scheduleEntry = $scheduleEntry;

        return $this;
    }

    public function getDateTimeStart(): \DateTime
    {
        return $this->dateTimeStart;
    }

    public function setDateTimeStart(\DateTime $dateTimeStart): SectionEntry
    {
        $this->dateTimeStart = $dateTimeStart;

        return $this;
    }

    public function getTitle(): string
    {
        return $this->title;
    }

    public function setTitle(string $title): SectionEntry
    {
        $this->title = $title;

        return $this;
    }

    public function getPresenter(): string
    {
        return $this->presenter;
    }

    public function setPresenter(string $presenter): SectionEntry
    {
        $this->presenter = $presenter;

        return $this;
    }

    public function getDescription(): string
    {
        return $this->description;
    }

    public function setDescription(string $description): SectionEntry
    {
        $this->description = $description;

        return $this;
    }

    public function getPictureUrl(): string
    {
        return $this->pictureUrl;
    }

    public function setPictureUrl(string $pictureUrl): SectionEntry
    {
        $this->pictureUrl = $pictureUrl;

        return $this;
    }
}
