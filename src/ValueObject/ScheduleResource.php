<?php

declare(strict_types=1);

namespace App\ValueObject;

use App\Entity\SubRadio;

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
        protected string|array|null $value=null,
        protected SubRadio|null $subValue=null
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

        if ($type !== null && $type !== self::TYPE_RADIO && $subValue !== null) {
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

    public function getValue(): array|string|null
    {
        return $this->value;
    }
    public function getSubValue(): SubRadio|null
    {
        return $this->subValue;
    }

}
