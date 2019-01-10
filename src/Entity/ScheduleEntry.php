<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\ORM\Mapping\Index;
use Symfony\Component\Serializer\Annotation\Groups;

/**
 * Schedule entry
 *
 * @ORM\Entity(repositoryClass="App\Repository\ScheduleEntryRepository")
 * @ORM\Table(indexes={@ORM\Index(name="starttime_idx", columns={"date_time_start"})})
 */
class ScheduleEntry
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
     * @ORM\ManyToOne(targetEntity="Radio")
     * @ORM\JoinColumn(name="radio_id", referencedColumnName="id")
     */
    private $radio;

    /**
     * @ORM\OneToMany(targetEntity="SectionEntry", mappedBy="scheduleEntry")
     */
    private $sectionEntries;

    /**
     * @var \DateTime
     *
     * @ORM\Column(type="datetime")
     * @Groups({"export"})
     */
    private $dateTimeStart;

    /**
     * @var \DateTime
     *
     * @ORM\Column(type="datetime")
     * @Groups({"export"})
     */
    private $dateTimeEnd;

    /**
     * @var integer
     *
     * @Groups({"export"})
     */
    private $duration;

    /**
     * @var string
     *
     * @ORM\Column(type="string", length=150)
     * @Groups({"export"})
     */
    private $title;

    /**
     * @var string
     *
     * @ORM\Column(type="string", length=100, nullable=true)
     * @Groups({"export"})
     */
    private $host;

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

    public function __construct() {
        $this->sectionEntries = new ArrayCollection();
    }

    /**
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @param int $id
     * @return ScheduleEntry
     */
    public function setId($id)
    {
        $this->id = $id;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getRadio()
    {
        return $this->radio;
    }

    /**
     * @param mixed $radio
     * @return ScheduleEntry
     */
    public function setRadio($radio)
    {
        $this->radio = $radio;

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
     * @param \DateTime $ateTimeStart
     * @return ScheduleEntry
     */
    public function setDateTimeStart($dateTimeStart)
    {
        $this->dateTimeStart = $dateTimeStart;

        return $this;
    }

    /**
     * @return \DateTime
     */
    public function getDateTimeEnd()
    {
        return $this->dateTimeEnd;
    }

    /**
     * @param \DateTime $dateTimeEnd
     * @return ScheduleEntry
     */
    public function setDateTimeEnd($dateTimeEnd)
    {
        $this->dateTimeEnd = $dateTimeEnd;

        return $this;
    }

    /**
     * @return int
     */
    public function getDuration()
    {
        return $this->duration;
    }

    /**
     * @param int $duration
     * @return ScheduleEntry
     */
    public function setDuration($duration)
    {
        $this->duration = $duration;

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
     * @return ScheduleEntry
     */
    public function setTitle($title)
    {
        $this->title = $title;

        return $this;
    }

    /**
     * @return string
     */
    public function getHost()
    {
        return $this->host;
    }

    /**
     * @param string $host
     * @return ScheduleEntry
     */
    public function setHost($host)
    {
        $this->host = $host;

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
     * @return ScheduleEntry
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
     * @return ScheduleEntry
     */
    public function setPictureUrl($pictureUrl)
    {
        $this->pictureUrl = $pictureUrl;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getSectionEntries()
    {
        return $this->sectionEntries;
    }

    /**
     * @param mixed $sectionEntries
     * @return ScheduleEntry
     */
    public function setSectionEntries($sectionEntries)
    {
        $this->sectionEntries = $sectionEntries;

        return $this;
    }
}
