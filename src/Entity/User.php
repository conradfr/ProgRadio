<?php

namespace App\Entity;

use App\Entity\Radio;
use App\Entity\Stream;
use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\UserInterface;
use Gedmo\Mapping\Annotation as Gedmo;
use App\Validator\Constraints as AppAssert;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Entity(repositoryClass=UserRepository::class)
 * @ORM\Table(name="`user`", indexes={@ORM\Index(name="user_token_idx", columns={"password_reset_token"}), @ORM\Index(name="user_email_idx", columns={"email"})})
 */
class User implements UserInterface
{
    protected const TOKEN_LENGTH = 25;
    protected const TOKEN_EXPIRATION = 24; // hours

    /**
     * @ORM\Id()
     * @ORM\GeneratedValue()
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @Assert\NotBlank
     * @AppAssert\EmailAvailable(groups={"registration"})
     *
     * @ORM\Column(type="string", length=180)
     */
    private $email;

    /**
     * @ORM\Column(type="json")
     */
    private $roles = [];

    /**
     * @var string The hashed password
     *
     * @ORM\Column(type="string")
     */
    private $password;

    /**
     * @var Collection
     *
     * @ORM\Cache(usage="READ_ONLY")
     * @ORM\ManyToMany(targetEntity=Radio::class)
     * @ORM\JoinTable(name="users_radios",
     *      joinColumns={@ORM\JoinColumn(name="user_id", referencedColumnName="id")},
     *      inverseJoinColumns={@ORM\JoinColumn(name="radio_id", referencedColumnName="id")}
     *      )
     */
    private $favoriteRadios;

    /**
     * @var Collection
     *
     * @ORM\Cache(usage="READ_ONLY")
     * @ORM\ManyToMany(targetEntity=Stream::class)
     * @ORM\JoinTable(name="users_streams",
     *      joinColumns={@ORM\JoinColumn(name="user_id", referencedColumnName="id")},
     *      inverseJoinColumns={@ORM\JoinColumn(name="stream_id", referencedColumnName="id")}
     *      )
     */
    private $favoriteStreams;

    /**
     * @var Collection
     *
     * @ORM\OneToMany(targetEntity=UserEmailChange::class, mappedBy="user")
     */
    private $emailChanges;

    /**
     * @var \DateTime
     *
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     */
    private $createdAt;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="updated_at", type="datetime")
     * @Gedmo\Timestampable(on="update")
     */
    private $updatedAt;

    /**
     * @var string
     *
     * @ORM\Column(type="string", length=100)
     */
    private $passwordResetToken;

    /**
     * @var \DateTime
     *
     * @ORM\Column(type="datetime")
     */
    private $passwordResetExpiration;

    public function __construct() {
        $this->favoriteRadios = new ArrayCollection();
        $this->favoriteStreams = new ArrayCollection();
        $this->emailChanges = new ArrayCollection();
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
    public function getUsername(): string
    {
        return (string) $this->email;
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
    public function eraseCredentials()
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
        $this->favoriteRadios->add($favoriteRadio);
    }

    public function removeFavoriteRadio(Radio $favoriteRadio): void
    {
        $this->favoriteRadios->removeElement($favoriteRadio);
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
        $this->favoriteStreams->add($favoriteStream);
    }

    public function removeFavoriteStream(Stream $favoriteStream): void
    {
        $this->favoriteStreams->removeElement($favoriteStream);
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
