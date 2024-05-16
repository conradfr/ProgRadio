<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use App\Entity\Radio;
use App\Entity\Stream;

#[ORM\Table(name: '`users_streams_history`')]
#[ORM\Index(name: 'idx_ur_last_listened_at', columns: ['last_listened_at'])]
#[ORM\Entity(repositoryClass: 'App\Repository\UserStreamRepository')]
class UserStream
{
    #[ORM\Id]
    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'streamsHistory', fetch: "EXTRA_LAZY")]
    #[ORM\JoinColumn(name: 'user_id', referencedColumnName: 'id')]
    private User $user;

    #[ORM\Id]
    #[ORM\ManyToOne(targetEntity: Stream::class, inversedBy: 'streamsHistory', fetch: "EXTRA_LAZY")]
    #[ORM\JoinColumn(name: 'stream_id', referencedColumnName: 'id')]
    private Stream $stream;

    #[ORM\Column(type: 'datetime')]
    private ?\DateTime $lastListenedAt = null;

    public function __construct() {

    }

    public function getUser(): User
    {
        return $this->user;
    }

    public function setUser(User $user): void
    {
        $this->user = $user;
    }


    public function getStream(): \App\Entity\Stream
    {
        return $this->stream;
    }

    public function setStream(\App\Entity\Stream $stream): void
    {
        $this->stream = $stream;
    }

    public function getLastListenedAt(): ?\DateTime
    {
        return $this->lastListenedAt;
    }

    public function setLastListenedAt(?\DateTime $lastListenedAt): void
    {
        $this->lastListenedAt = $lastListenedAt;
    }
}
