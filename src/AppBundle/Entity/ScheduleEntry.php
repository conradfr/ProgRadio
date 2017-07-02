<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Schedule entry
 *
 * @ORM\Entity
 */
class ScheduleEntry
{
    /**
     * @var integer
     *
     * @ORM\Column(type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @ORM\ManyToOne(targetEntity="Radio")
     * @ORM\JoinColumn(name="radio_id", referencedColumnName="id")
     */
    private $radio;

    /**
     * @var \DateTime
     *
     * @ORM\Column(type="datetime")
     */
    private $dateTimeStart;

    /**
     * @var string
     *
     * @ORM\Column(type="string", length=150)
     */
    private $title;

    /**
     * @var string
     *
     * @ORM\Column(type="string", length=100, nullable=true)
     */
    private $host;

    /**
     * @var string
     *
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $description;

    /**
     * @var string
     *
     * @ORM\Column(type="string", length=255, nullable=true)
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
}
