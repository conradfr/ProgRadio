<?php

namespace App\Entity;

use App\Entity\User;
use App\Repository\UserEmailChangeRepository;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * @ORM\Entity(repositoryClass=UserEmailChangeRepository::class)
 * @ORM\Table(name="user_email_change")
 */
class UserEmailChange
{
    protected const TOKEN_LENGTH = 25;
    protected const TOKEN_EXPIRATION = 24; // hours

    /**
     * @ORM\Id()
     * @ORM\GeneratedValue()
     * @ORM\Column(type="integer")
     */
    private ?int $id;

    /**
     * @ORM\Column(type="string", length=180)
     */
    private ?string $email = null;

    /**
     * @var User
     *
     * @ORM\ManyToOne(targetEntity=User::class, inversedBy="emailChanges")
     * @ORM\JoinColumn(name="user_id", referencedColumnName="id")
     */
    private $user;

     /**
     *
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     */
    private ?\DateTime $createdAt = null;

    /**
     *
     * @ORM\Column(name="updated_at", type="datetime")
     * @Gedmo\Timestampable(on="update")
     */
    private ?\DateTime $updatedAt = null;

    /**
     * @ORM\Column(type="string", length=100)
     */
    private ?string $token = null;

    /**
     * @ORM\Column(type="datetime")
     */
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
