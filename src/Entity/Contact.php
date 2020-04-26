<?php

namespace App\Entity;

use Symfony\Component\Validator\Constraints as Assert;

class Contact
{
    /**
     * @var string
     *
     * @Assert\NotBlank()
     */
    private $name;

    /**
     * @var string
     *
     * @Assert\Email()
     */
    private $email;

    /**
     * @var string
     *
     * @Assert\NotBlank()
     */
    private $message;

    public function setName(string $name): Contact
    {
        $this->name = $name;

        return $this;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setEmail(string $email): Contact
    {
        $this->email = $email;

        return $this;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function setMessage(string $message): Contact
    {
        $this->message = $message;

        return $this;
    }

    public function getMessage(): string
    {
        return $this->message;
    }
}
