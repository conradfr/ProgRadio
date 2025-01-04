<?php

declare(strict_types=1);

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use App\Repository\ListeningSessionRepository;
use App\Entity\RadioStream;
use App\Entity\Stream;
use Darsyn\IP\Version\Multi as IP;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Uid\Uuid;

#[ORM\Table]
#[ORM\Index(name: 'ls_radio_stream_idx', columns: ['radio_stream_id'])]
#[ORM\Index(name: 'stream_idx', columns: ['stream_id'])]
#[ORM\Index(name: 'date_time_start_idx', columns: ['date_time_start'])]
#[ORM\Entity(repositoryClass: ListeningSessionRepository::class)]
class ListeningSession
{
    public const TYPE_RADIO = 'radio';
    public const TYPE_STREAM = 'stream';

/*
    public const SOURCE_WEB = 'web';
    public const SOURCE_ANDROID = 'android';
    public const SOURCE_SEO = 'seo';

    public const SOURCES = [
        self::SOURCE_WEB,
        self::SOURCE_ANDROID,
        self::SOURCE_SEO,
    ];
*/

    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'NONE')]
    private ?Uuid $id;

    private ?string $type = null;

    #[ORM\ManyToOne(targetEntity: RadioStream::class, inversedBy: 'listeningSessions')]
    #[ORM\JoinColumn(name: 'radio_stream_id', referencedColumnName: 'id')]
    private ?RadioStream $radioStream = null;

    #[ORM\ManyToOne(targetEntity: Stream::class, inversedBy: 'listeningSessions')]
    #[ORM\JoinColumn(name: 'stream_id', referencedColumnName: 'id')]
    private ?Stream $stream = null;

    #[ORM\Column(type: 'datetime')]
    private ?\DateTime $dateTimeStart = null;

    #[ORM\Column(type: 'datetime', nullable: true)]
    private ?\DateTime $dateTimeEnd = null;

    #[ORM\Column(type: 'string', length: 30, nullable: true)]
    private ?string $source = null;

    #[ORM\Column(type: 'ip', nullable: true)]
    protected $ipAddress;

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function setId(Uuid $id): void
    {
        $this->id = $id;
    }

    public function getType(): ?string
    {
        if ($this->type === null) {
            if ($this->radioStream !== null) {
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
