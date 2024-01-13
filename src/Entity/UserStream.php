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
    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'user_id', referencedColumnName: 'id')]
    private User $user;

    #[ORM\Id]
    #[ORM\ManyToOne(targetEntity: Stream::class)]
    #[ORM\JoinColumn(name: 'stream_id', referencedColumnName: 'id')]
    private Stream $stream;

    #[ORM\Column(type: 'datetime', nullable: false)]
    private ?\DateTime $lastListenedAt;

    public function __construct() {

    }

}
