<?php

declare(strict_types=1);

namespace App\ValueObject;

class ScheduleResource
{
    public const TYPE_RADIO = 'radio';
    public const TYPE_COLLECTION = 'collection';

    protected const TYPES = [
        self::TYPE_RADIO,
        self::TYPE_COLLECTION
    ];

    protected \DateTime $dateTime;
    protected ?string $type;
    protected ?string $value;

    public function __construct(\DateTime $dateTime, ?string $type=null, ?string $value=null)
    {
        if ($type !== null && !in_array($type, self::TYPES)) {
            throw new \BadMethodCallException('Not allowed type');
        }

        $this->dateTime = $dateTime;
        $this->type = $type;
        $this->value = $value;
    }

    public function getDateTime(): \DateTime
    {
        return $this->dateTime;
    }

    public function getType(): ?string
    {
        return $this->type;
    }

    public function getValue(): ?string
    {
        return $this->value;
    }
}
