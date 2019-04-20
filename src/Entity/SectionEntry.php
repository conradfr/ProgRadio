<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

/**
 * Section entry
 *
 * @ORM\Entity(repositoryClass="App\Repository\ScheduleEntryRepository")
 */
class SectionEntry
{
    /**
     * @var integer
     *
     * @ORM\Column(type="bigint")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
     */
    private $id;

    /**
     * @var ScheduleEntry
     *
     * @ORM\ManyToOne(targetEntity="ScheduleEntry", inversedBy="sectionEntries")
     * @ORM\JoinColumn(name="schedule_entry_id", referencedColumnName="id")
     */
    private $scheduleEntry;

    /**
     * @var \DateTime
     *
     * @ORM\Column(type="datetime")
     * @Groups({"export"})
     */
    private $dateTimeStart;

    /**
     * @var string
     *
     * @ORM\Column(type="text")
     * @Groups({"export"})
     */
    private $title;

    /**
     * @var string
     *
     * @ORM\Column(type="string", length=100, nullable=true)
     * @Groups({"export"})
     */
    private $presenter;

    /**
     * @var string
     *
     * @ORM\Column(type="text", nullable=true)
     * @Groups({"export"})
     */
    private $description;

    /**
     * @var string
     *
     * @ORM\Column(type="string", length=255, nullable=true)
     * @Groups({"export"})
     */
    private $pictureUrl;

    /**
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @param int $id
     * @return SectionEntry
     */
    public function setId($id)
    {
        $this->id = $id;

        return $this;
    }

    /**
     * @return ScheduleEntry
     */
    public function getScheduleEntry()
    {
        return $this->scheduleEntry;
    }

    /**
     * @param ScheduleEntry $scheduleEntry
     * @return SectionEntry
     */
    public function setScheduleEntry($scheduleEntry)
    {
        $this->scheduleEntry = $scheduleEntry;

        return $this;
    }

    /**
     * @return \DateTime
     */
    public function getDateTimeStart()
    {
        return $this->dateTimeStart;
    }

    /**
     * @param \DateTime $dateTimeStart
     * @return SectionEntry
     */
    public function setDateTimeStart($dateTimeStart)
    {
        $this->dateTimeStart = $dateTimeStart;

        return $this;
    }

    /**
     * @return string
     */
    public function getTitle()
    {
        return $this->title;
    }

    /**
     * @param string $title
     * @return SectionEntry
     */
    public function setTitle($title)
    {
        $this->title = $title;

        return $this;
    }

    /**
     * @return string
     */
    public function getPresenter(): string
    {
        return $this->presenter;
    }

    /**
     * @param string $presenter
     * @return SectionEntry
     */
    public function setPresenter(string $presenter): SectionEntry
    {
        $this->presenter = $presenter;

        return $this;
    }

    /**
     * @return string
     */
    public function getDescription()
    {
        return $this->description;
    }

    /**
     * @param string $description
     * @return SectionEntry
     */
    public function setDescription($description)
    {
        $this->description = $description;

        return $this;
    }

    /**
     * @return string
     */
    public function getPictureUrl()
    {
        return $this->pictureUrl;
    }

    /**
     * @param string $pictureUrl
     * @return SectionEntry
     */
    public function setPictureUrl($pictureUrl)
    {
        $this->pictureUrl = $pictureUrl;

        return $this;
    }
}
