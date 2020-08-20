<?php

namespace App\Repository;

use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;
use Symfony\Component\Security\Core\User\PasswordUpgraderInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Bridge\Doctrine\Security\User\UserLoaderInterface;
use Symfony\Component\Security\Core\Security;

class UserRepository extends ServiceEntityRepository implements PasswordUpgraderInterface, UserLoaderInterface
{
    private $security;

    public function __construct(ManagerRegistry $registry, Security $security)
    {
        parent::__construct($registry, User::class);

        $this->security = $security;
    }

    public function loadUserByUsername($email)
    {
        return $this->getEntityManager()->createQuery(
            'SELECT u
                FROM App\Entity\User u
                WHERE u.email = :email'
        )
        ->setParameter('email', $email)
        ->getOneOrNullResult();
    }

    public function findFromToken($token)
    {
        return $this->getEntityManager()->createQuery(
            'SELECT u
                FROM App\Entity\User u
                WHERE u.passwordResetToken = :token
                    AND u.passwordResetExpiration >= :now'
        )
            ->setParameter('token', $token)
            ->setParameter('now', new \DateTime())
            ->getOneOrNullResult();
    }

    public function isEmailAvailable(string $email): bool
    {
        $user = $this->security->getUser();

        $qb = $this->createQueryBuilder('u')
        ->select('u.id')
        ->leftJoin('u.emailChanges', 'uec')
        ->where('uec.email = :email')
        ->setParameters([
            'email' => $email,
            'now' => new \DateTime()
        ]);

        if ($user !== null) {
             $qb->where('(u.email = :email AND u != :user)')
               ->orWhere('(uec.email = :email AND uec.user != :user AND uec.tokenExpiration > :now)')
               ->setParameter('user', $user);
        } else {
            $qb->where('u.email = :email')
               ->orWhere('(uec.email = :email AND uec.tokenExpiration > :now)');
        }

        $result = $qb->getQuery()->getResult();

        if ($result === null || count($result) === 0) {
            return true;
        }

        return false;
    }

    /**
     * Used to upgrade (rehash) the user's password automatically over time.
     */
    public function upgradePassword(UserInterface $user, string $newEncodedPassword): void
    {
        if (!$user instanceof User) {
            throw new UnsupportedUserException(sprintf('Instances of "%s" are not supported.', \get_class($user)));
        }

        $user->setPassword($newEncodedPassword);
        $this->_em->persist($user);
        $this->_em->flush();
    }

    // /**
    //  * @return User[] Returns an array of User objects
    //  */
    /*
    public function findByExampleField($value)
    {
        return $this->createQueryBuilder('u')
            ->andWhere('u.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('u.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?User
    {
        return $this->createQueryBuilder('u')
            ->andWhere('u.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */

    public function supportsClass($class)
    {
        return User::class === $class;
    }
}
