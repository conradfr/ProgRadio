<?php

namespace App\Repository;

use App\Entity\UserEmailChange;
use Doctrine\ORM\EntityRepository;

class UserEmailChangeRepository extends EntityRepository
{
    public function findFromToken($token): ?UserEmailChange
    {
        return $this->getEntityManager()->createQuery(
            'SELECT uec
                FROM App\Entity\UserEmailChange uec
                INNER JOIN uec.user u 
                WHERE uec.token = :token
                    AND uec.tokenExpiration >= :now'
        )
            ->setParameter('token', $token)
            ->setParameter('now', new \DateTime())
            ->getOneOrNullResult();
    }
}
