<?php

declare(strict_types=1);

namespace App\Entity;

use App\Entity\User;
use Doctrine\DBAL\Types\Types;
use App\Repository\UserEmailChangeRepository;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

#[ORM\Table(name: 'user_email_change')]
#[ORM\Entity(repositoryClass: UserEmailChangeRepository::class)]
class UserEmailChange
{
    protected const int TOKEN_LENGTH = 25;
    protected const int TOKEN_EXPIRATION = 24; // hours

    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "SEQUENCE")]
    #[ORM\Column(type: 'integer')]
    private ?int $id;

    #[ORM\Column(type: 'string', length: 180)]
    private ?string $email = null;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'emailChanges')]
    #[ORM\JoinColumn(name: 'user_id', referencedColumnName: 'id')]
    private User $user;

    #[Gedmo\Timestampable(on: 'create')]
    #[ORM\Column(name: 'created_at', type: Types::DATETIME_MUTABLE, nullable: true)]
    private ?\DateTime $createdAt = null;

    #[Gedmo\Timestampable(on: 'update')]
    #[ORM\Column(name: 'updated_at', type: Types::DATETIME_MUTABLE, nullable: true)]
    private ?\DateTime $updatedAt = null;

    #[ORM\Column(type: 'string', length: 100)]
    private ?string $token = null;

    #[ORM\Column(type: 'datetime')]
    private ?\DateTime $tokenExpiration = null;

    public function getId()
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): void
    {
        $this->email = $email;
    }

    public function getUser()
    {
        return $this->user;
    }

    public function setUser($user): void
    {
        $this->user = $user;
    }

    public function getCreatedAt(): \DateTime
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTime $createdAt): void
    {
        $this->createdAt = $createdAt;
    }

    public function getUpdatedAt(): \DateTime
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTime $updatedAt): void
    {
        $this->updatedAt = $updatedAt;
    }

    public function getToken(): string
    {
        return $this->token;
    }

    public function setToken(string $token): void
    {
        $this->token = $token;
    }

    public function getTokenExpiration(): \DateTime
    {
        return $this->tokenExpiration;
    }

    public function generateToken(): void
    {
        $bytes = random_bytes(self::TOKEN_LENGTH);
        $this->token = bin2hex($bytes);
    }

    public function setTokenExpiration(): void
    {
        $now = new \DateTime();
        $now->add(new \DateInterval('PT' . self::TOKEN_EXPIRATION . 'H'));

        $this->tokenExpiration = $now;
    }
}
