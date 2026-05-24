<?php

namespace App\Repository;

use App\Entity\StreamAutoUpdate;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<StreamAutoUpdate>
 */
class StreamAutoUpdateRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, StreamAutoUpdate::class);
    }
}
