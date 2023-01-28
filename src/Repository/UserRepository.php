<?php

namespace App\Repository;

use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\PasswordUpgraderInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Bridge\Doctrine\Security\User\UserLoaderInterface;
use Symfony\Component\Security\Core\Security;

class UserRepository extends ServiceEntityRepository implements PasswordUpgraderInterface, UserLoaderInterface
{
    public function __construct(ManagerRegistry $registry, private readonly Security $security)
    {
        parent::__construct($registry, User::class);
    }

    public function loadUserByIdentifier($email): ?UserInterface
    {
        return $this->getEntityManager()->createQuery(
            'SELECT u
                FROM App\Entity\User u
                WHERE u.email = :email'
        )
        ->setParameter('email', $email)
        ->getOneOrNullResult();
    }

    public function loadUserByUsername($email): ?UserInterface
    {
        return $this->loadUserByIdentifier($email);
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

    public function lastNAccounts(int $howMany=10)
    {
        $qb = $this->createQueryBuilder('u')
            ->select('u.id, u.email, u.createdAt')
            ->orderBy('u.createdAt', 'DESC')
            ->setMaxResults($howMany);

        return $qb->getQuery()->getResult();
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

        if ($result === null || (is_countable($result) ? count($result) : 0) === 0) {
            return true;
        }

        return false;
    }

    /*
     * Used to upgrade (rehash) the user's password automatically over time.
     */
    public function upgradePassword(PasswordAuthenticatedUserInterface $user, string $newHashedPassword): void
    {
        if (!$user instanceof User) {
            throw new UnsupportedUserException(sprintf('Instances of "%s" are not supported.', $user::class));
        }

        $user->setPassword($newHashedPassword);
        $this->_em->persist($user);
        $this->_em->flush();
    }

    public function supportsClass($class)
    {
        return User::class === $class;
    }
}
