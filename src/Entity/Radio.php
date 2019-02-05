<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

/**
 * Radio
 *
 * @ORM\Entity(repositoryClass="App\Repository\RadioRepository")
 */
class Radio
{
    /**
     * @var integer
     *
     * @ORM\Column(type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="NONE")
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(type="string", length=100)
     * @Groups({"export"})
     */
    private $codeName;

    /**
     * @var string
     *
     * @ORM\Column(type="string", length=100)
     * @Groups({"export"})
     */
    private $name;

    /**
     * @var string
     *
     * @ORM\Column(type="string", length=50, options={"default"="Europe/Paris"})
     * @Groups({"export"})
     */
    private $timezone = 'Europe/Paris';

    /**
     * @ORM\ManyToOne(targetEntity="Category")
     * @ORM\JoinColumn(name="category_id", referencedColumnName="id")
     */
    private $category;

    /**
     * @ORM\ManyToOne(targetEntity="Collection")
     * @ORM\JoinColumn(name="collection_id", referencedColumnName="id")
     */
    private $collection;

    /**
     * @var double
     *
     * @ORM\Column(type="decimal", scale=2, options={"default"=0})
     * @Groups({"export"})
     */
    private $share;

    /**
     * @var string
     *
     * @ORM\Column(type="string", length=255, nullable=true)
     * @Groups({"export"})
     */
    private $streamUrl;

    /**
     * @var boolean
     *
     * @ORM\Column(type="boolean", options={"default"=true})
     */
    private $active = true;

    /**
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @param int $id
     */
    public function setId($id)
    {
        $this->id = $id;
    }

    /**
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * @param string $name
     */
    public function setName($name)
    {
        $this->name = $name;
    }

    /**
     * @return Category
     */
    public function getCategory()
    {
        return $this->category;
    }

    /**
     * @param Category $category
     */
    public function setCategory(Category $category)
    {
        $this->category = $category;
    }

    /**
     * @return Collection
     */
    public function getCollection()
    {
        return $this->collection;
    }

    /**
     * @param Collection $collection
     */
    public function setCollection(Collection $collection)
    {
        $this->collection = $collection;
    }

    /**
     * @return double
     */
    public function getShare()
    {
        return $this->share;
    }

    /**
     * @param double $share
     */
    public function setShare($share)
    {
        $this->share = $share;
    }

    /**
     * @return string
     */
    public function getStreamUrl(): string
    {
        return $this->streamUrl;
    }

    /**
     * @param string $streamUrl
     */
    public function setStreamUrl(string $streamUrl): void
    {
        $this->streamUrl = $streamUrl;
    }

    /**
     * @return string
     */
    public function getCodeName()
    {
        return $this->codeName;
    }

    /**
     * @param string $codeName
     */
    public function setCodeName($codeName)
    {
        $this->codeName = $codeName;
    }

    /**
     * @return mixed
     */
    public function getTimezone()
    {
        return $this->timezone;
    }

    /**
     * @param mixed $timezone
     */
    public function setTimezone($timezone)
    {
        $this->timezone = $timezone;
    }

    /**
     * @return boolean
     */
    public function isActive()
    {
        return $this->active;
    }

    /**
     * @param boolean $active
     */
    public function setActive($active)
    {
        $this->active = $active;
    }
}
