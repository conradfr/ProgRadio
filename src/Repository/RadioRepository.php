<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Radio;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Security\Core\Security;

class RadioRepository extends ServiceEntityRepository
{
    protected const CACHE_RADIO_TTL = 604800; // week

    private $security;

    public function __construct(Security $security, ManagerRegistry $registry)
    {
        parent::__construct($registry, Radio::class);

        // Avoid calling getUser() in the constructor: auth may not
        // be complete yet. Instead, store the entire Security object.
        $this->security = $security;
    }

    public function getActiveRadios(array $favoritesFromCookies = []): array {
        $user = $this->security->getUser();

        $query = $this->getEntityManager()->createQuery(
            "SELECT r.codeName as code_name, r.name, r.streamingUrl as streamUrl,
                    r.streamingUrl, r.share, r.streamingEnabled as streaming_enabled,
                    c.codeName as category, cl.codeName as collection, 'radio' as type,
                    r.streamingUrl as stream_url 
                FROM App:Radio r
                  INNER JOIN r.category c
                  INNER JOIN r.collection cl
                WHERE r.active = :active
            "
        );

        $query->setParameter('active', true);

        $query->enableResultCache(self::CACHE_RADIO_TTL, 'active_radios');

        $results = $query->getResult();

        // @todo refactor favorite management

        $favorites = null;
        if($user !== null) {
            $favorites = $user->getFavoriteRadios()->map(
                function ($radio) {
                    return $radio->getCodeName();
                }
            )->toArray();
        } else {
            $favorites = $favoritesFromCookies;
        }

        $withCollectionAsArray = array_map(function($radio) use ($favorites) {
            $radio['collection'] = [$radio['collection']];
            if (in_array($radio['code_name'], $favorites)) {
                $radio['collection'][] = Radio::FAVORITES;
            }
            return $radio;
        }, $results);

        return $withCollectionAsArray;
    }

    public function getAllCodename($filterbyActive = true): array {
        $queryString = 'SELECT r.codeName' . PHP_EOL
                        . 'FROM App:Radio r' . PHP_EOL;

        if ($filterbyActive) {
            $queryString .= ' WHERE r.active = TRUE'.PHP_EOL;
        }

        $query = $this->getEntityManager()->createQuery(
            $queryString
        );

        $query->setResultCacheLifetime(self::CACHE_RADIO_TTL);
        $result = $query->getResult();

       return array_column($result, 'codeName');
    }

    public function getNameAndShares(): array
    {
        $qb = $this->getEntityManager()->createQueryBuilder();

        $qb->select('r.id, r.codeName, r.name, r.share')
            ->from('App:Radio', 'r')
            ->addOrderBy('r.share', 'DESC')
            ->addOrderBy('r.codeName', 'ASC');

        return $qb->getQuery()->getResult();
    }
}
