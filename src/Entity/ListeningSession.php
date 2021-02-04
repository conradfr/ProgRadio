<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use App\Repository\ListeningSessionRepository;
use Darsyn\IP\Version\Multi as IP;

/**
 * @ORM\Entity(repositoryClass=ListeningSessionRepository::class)
 * @ORM\Table(indexes={@ORM\Index(name="ls_radio_stream_idx", columns={"radio_stream_id"}), @ORM\Index(name="stream_idx", columns={"stream_id"}), @ORM\Index(name="date_time_start_idx", columns={"date_time_start"})})
 */
class ListeningSession
{
    public const TYPE_RADIO = 'radio';
    public const TYPE_STREAM = 'stream';

    public const MINIMUM_SECONDS = 30;
    public const MAX_DIFFERENCE_WITH_CURRENT_SECONDS = 60;

    public const SOURCE_WEB = 'web';
    public const SOURCE_ANDROID = 'android';

    public const SOURCES = [
        self::SOURCE_WEB,
        self::SOURCE_ANDROID
    ];

    /**
     * @var string
     *
     * @ORM\Column(type="bigint")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    private ?string $type = null;

    /**
     * @ORM\ManyToOne(targetEntity=Radio::class, inversedBy="listeningSessions")
     * @ORM\JoinColumn(name="radio_id", referencedColumnName="id")
     */
    private $radio;

    /**
     * @ORM\ManyToOne(targetEntity=RadioStream::class, inversedBy="listeningSessions")
     * @ORM\JoinColumn(name="radio_stream_id", referencedColumnName="id")
     */
    private $radioStream;

    /**
     * @ORM\ManyToOne(targetEntity=Stream::class, inversedBy="listeningSessions")
     * @ORM\JoinColumn(name="stream_id", referencedColumnName="id")
     */
    private $stream;

    /**
     * @var \DateTime
     *
     * @ORM\Column(type="datetime")
     */
    private $dateTimeStart = null;

    /**
     * @var \DateTime
     *
     * @ORM\Column(type="datetime", nullable=true)
     */
    private $dateTimeEnd;

    /**
     * @var string
     *
     * @ORM\Column(type="string", length=30, nullable=true)
     */
    private $source;

    /**
     * @ORM\Column(type="ip", nullable=true)
     */
    protected $ipAddress;

    public function getId(): int
    {
        return $this->id;
    }

    public function getType(): ?string
    {
        if ($this->type === null) {
            if ($this->radio !== null) {
                return self::TYPE_RADIO;
            }

            if ($this->stream !== null) {
                return self::TYPE_STREAM;
            }
        }

        return $this->type;
    }

    public function setType(string $type): void
    {
        $this->type = $type;
    }

    public function getRadio(): ?Radio
    {
        return $this->radio;
    }

    public function setRadio(Radio $radio): void
    {
        $this->radio = $radio;
    }

    public function getRadioStream(): ?RadioStream
    {
        return $this->radioStream;
    }

    public function setRadioStream(RadioStream $radioStream): void
    {
        $this->radioStream = $radioStream;
    }

    public function getStream(): ?Stream
    {
        return $this->stream;
    }

    public function setStream(Stream $stream=null): void
    {
        $this->stream = $stream;
    }

    public function getDateTimeStart(): ?\DateTime
    {
        return $this->dateTimeStart;
    }

    public function setDateTimeStart(\DateTime $dateTimeStart=null): void
    {
        $this->dateTimeStart = $dateTimeStart;
    }

    public function getDateTimeEnd(): ?\DateTime
    {
        return $this->dateTimeEnd;
    }

    public function setDateTimeEnd(\DateTime $dateTimeEnd=null): void
    {
        $this->dateTimeEnd = $dateTimeEnd;
    }

    public function getSource(): ?string
    {
        return $this->source;
    }

    public function setSource(string $source=null): void
    {
        $this->source = $source;
    }

    public function getIpAddress()
    {
        return $this->ipAddress;
    }

    public function setIpAddress(IP $ip=null)
    {
        $this->ipAddress = $ip;
    }
}
