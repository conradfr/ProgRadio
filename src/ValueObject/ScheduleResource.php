<?php

declare(strict_types=1);

namespace App\ValueObject;

class ScheduleResource
{
    public const TYPE_RADIO = 'radio';
    public const TYPE_RADIOS = 'radios';
    public const TYPE_COLLECTION = 'collection';

    protected const TYPES = [
        self::TYPE_RADIO,
        self::TYPE_RADIOS,
        self::TYPE_COLLECTION
    ];

    public function __construct(
        protected \DateTime $dateTime,
        protected ?string $type=null,
        protected string|array|null $value=null
    ) {
        if ($type !== null && !in_array($type, self::TYPES)) {
            throw new \BadMethodCallException('Not allowed type');
        }

        if ($type === self::TYPE_RADIOS && !is_array($value)) {
            throw new \BadMethodCallException('Wrong value type');
        }

        if ($type !== null && $type !== self::TYPE_RADIOS && !is_string($value)) {
            throw new \BadMethodCallException('Wrong value type');
        }
    }

    public function getDateTime(): \DateTime
    {
        return $this->dateTime;
    }

    public function getType(): ?string
    {
        return $this->type;
    }

    /**
     * @return array|string|null
     */
    public function getValue()
    {
        return $this->value;
    }
}
