<?php

namespace App\Entity;

use App\Entity\Radio;
use App\Entity\Stream;
use App\Entity\UserSong;
use Doctrine\DBAL\Types\Types;
use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Gedmo\Mapping\Annotation as Gedmo;
use App\Validator\Constraints as AppAssert;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Table(name: '`user`')]
#[ORM\Index(name: 'user_token_idx', columns: ['password_reset_token'])]
#[ORM\Index(name: 'user_email_idx', columns: ['email'])]
#[ORM\Entity(repositoryClass: UserRepository::class)]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    protected const TOKEN_LENGTH = 25;
    protected const TOKEN_EXPIRATION = 24; // hours
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id;

    #[AppAssert\EmailAvailable(groups: ['registration'])]
    #[Assert\NotBlank]
    #[Assert\Email]
    #[ORM\Column(type: 'string', length: 180)]
    private ?string $email = null;

    #[ORM\Column(type: 'json')]
    private array $roles = [];

    #[ORM\Column(type: 'string')]
    private ?string $password = null;

    #[ORM\Column(type: 'boolean')]
    private ?bool $storeHistory = true;

    #[ORM\JoinTable(name: 'users_radios')]
    #[ORM\JoinColumn(name: 'user_id', referencedColumnName: 'id')]
    #[ORM\InverseJoinColumn(name: 'radio_id', referencedColumnName: 'id')]
    #[ORM\Cache(usage: 'READ_ONLY')]
    #[ORM\ManyToMany(targetEntity: Radio::class)]
    private Collection $favoriteRadios;

    #[ORM\JoinTable(name: 'users_streams')]
    #[ORM\JoinColumn(name: 'user_id', referencedColumnName: 'id')]
    #[ORM\InverseJoinColumn(name: 'stream_id', referencedColumnName: 'id')]
    #[ORM\Cache(usage: 'READ_ONLY')]
    #[ORM\ManyToMany(targetEntity: Stream::class)]
    private Collection $favoriteStreams;

    #[ORM\OneToMany(targetEntity: UserStream::class, mappedBy: 'user', fetch: "EXTRA_LAZY")]
    #[ORM\Cache(usage: 'READ_ONLY')]
    private Collection $streamsHistory;

    #[ORM\OneToMany(targetEntity: UserEmailChange::class, mappedBy: 'user')]
    private Collection $emailChanges;

    #[ORM\OneToMany(targetEntity: Stream::class, mappedBy: 'user', fetch: "EXTRA_LAZY")]
    private Collection $streams;

    #[ORM\OneToMany(targetEntity: UserSong::class, mappedBy: 'user')]
    private Collection $userSongs;

    #[Gedmo\Timestampable(on: 'create')]
    #[ORM\Column(name: 'created_at', type: Types::DATETIME_MUTABLE, nullable: true)]
    private \DateTime $createdAt;

    #[Gedmo\Timestampable(on: 'update')]
    #[ORM\Column(name: 'updated_at', type: Types::DATETIME_MUTABLE, nullable: true)]
    private \DateTime $updatedAt;

    #[ORM\Column(type: 'string', length: 100)]
    private ?string $passwordResetToken = null;

    #[ORM\Column(type: 'datetime')]
    private ?\DateTime $passwordResetExpiration = null;

    public function __construct() {
        $this->favoriteRadios = new ArrayCollection();
        $this->favoriteStreams = new ArrayCollection();
        $this->streamsHistory = new ArrayCollection();
        $this->emailChanges = new ArrayCollection();
        $this->userSongs = new ArrayCollection();
        $this->streams = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): self
    {
        $this->email = strtolower($email);

        return $this;
    }

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    public function getUsername(): string
    {
        return $this->getUserIdentifier();
    }

    /**
     * @see UserInterface
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // guarantee every user at least has ROLE_USER
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    public function setRoles(array $roles): self
    {
        $this->roles = $roles;

        return $this;
    }

    /**
     * @see UserInterface
     */
    public function getPassword(): string
    {
        return (string) $this->password;
    }

    public function setPassword(string $password): self
    {
        $this->password = $password;

        return $this;
    }

    public function getStoreHistory(): ?bool
    {
        return $this->storeHistory;
    }

    public function setStoreHistory(?bool $storeHistory): void
    {
        $this->storeHistory = $storeHistory;
    }

    public function setStreamsHistory(Collection $streamsHistory): void
    {
        $this->streamsHistory = $streamsHistory;
    }

    /**
     * @see UserInterface
     */
    public function getSalt(): ?string
    {
        // not needed when using the "bcrypt" algorithm in security.yaml
        return null;
    }

    /**
     * @see UserInterface
     */
    public function eraseCredentials(): void
    {
        // If you store any temporary, sensitive data on the user, clear it here
        // $this->plainPassword = null;
    }

    public function getFavoriteRadios(): Collection
    {
        return $this->favoriteRadios;
    }

    public function setFavoriteRadios(Collection $favoriteRadios): void
    {
        $this->favoriteRadios = $favoriteRadios;
    }

    public function addFavoriteRadio(Radio $favoriteRadio): void
    {
        if ($this->favoriteRadios->contains($favoriteRadio) === false) {
            $this->favoriteRadios->add($favoriteRadio);
        }
    }

    public function removeFavoriteRadio(Radio $favoriteRadio): void
    {
        if ($this->favoriteRadios->contains($favoriteRadio) === true) {
            $this->favoriteRadios->removeElement($favoriteRadio);
        }
    }

    public function getStreams(): Collection
    {
        return $this->streams;
    }

    public function setStreams(Collection $streams): void
    {
        $this->streams = $streams;
    }

    public function addStream(Stream $stream): void
    {
        if ($this->streams->contains($stream) === false) {
            $this->streams->add($stream);
        }
    }

    public function removeStream(Stream $stream): void
    {
        if ($this->streams->contains($stream) === true) {
            $this->streams->removeElement($stream);
        }
    }

    public function getFavoriteStreams(): Collection
    {
        return $this->favoriteStreams;
    }

    public function setFavoriteStreams(Collection $favoriteStreams): void
    {
        $this->favoriteStreams = $favoriteStreams;
    }

    public function addFavoriteStream(Stream $favoriteStream): void
    {
        if ($this->favoriteStreams->contains($favoriteStream) === false) {
            $this->favoriteStreams->add($favoriteStream);
        }
    }

    public function removeFavoriteStream(Stream $favoriteStream): void
    {
        if ($this->favoriteStreams->contains($favoriteStream) === true) {
            $this->favoriteStreams->removeElement($favoriteStream);
        }
    }

    public function getUserSongs(): Collection
    {
        return $this->userSongs;
    }

    public function getUserSongsAsArray(): array
    {
        $songs = [];
        /** @var UserSong $usersong */
        foreach ($this->userSongs->toArray() as $usersong) {
            $songs['s' . ((string) $usersong->getId())] = $usersong->getSong();
        }

        return $songs;
    }

    public function setUserSongs(Collection $userSongs): void
    {
        $this->userSongs = $userSongs;
    }

    public function addUserSong(UserSong $userSong): void
    {
        $this->userSongs->add($userSong);
    }

    public function getCreatedAt(): ?\Datetime
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?\Datetime
    {
        return $this->updatedAt;
    }

    public function getPasswordResetToken(): ?string
    {
        return $this->passwordResetToken;
    }

    public function setPasswordResetToken(?string $passwordResetToken): void
    {
        $this->passwordResetToken = $passwordResetToken;
    }

    public function generatePasswordResetToken(): void
    {
        $bytes = random_bytes(self::TOKEN_LENGTH);
        $this->passwordResetToken = bin2hex($bytes);
    }

    public function getPasswordResetExpiration(): \DateTime
    {
        return $this->passwordResetExpiration;
    }

    public function setPasswordResetExpiration(): void
    {
        $now = new \DateTime();
        $now->add(new \DateInterval('PT' . self::TOKEN_EXPIRATION . 'H'));

        $this->passwordResetExpiration = $now;
    }
}
