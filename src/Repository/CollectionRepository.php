<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Collection;
use App\Entity\Radio;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Security\Core\Security;

class CollectionRepository extends ServiceEntityRepository
{
    protected const CACHE_COLLECTION_TTL = 604800; // week
    protected const CACHE_COLLECTION_ID = 'collections';

    private $security;

    public function __construct(Security $security, ManagerRegistry $registry)
    {
        parent::__construct($registry, Collection::class);

        // Avoid calling getUser() in the constructor: auth may not
        // be complete yet. Instead, store the entire Security object.
        $this->security = $security;
    }

    public function getCollections(array $favoritesFromCookies = []): array {
        $user = $this->security->getUser();

        $query = $this->getEntityManager()->createQuery(
            'SELECT c.codeName as code_name, c.name as name_FR, c.shortName as short_name, 
                c.priority, c.sortField as sort_field, c.sortOrder as sort_order,
                GROUP_CONCAT(r.codeName) as radios
                FROM App:Collection c
                LEFT JOIN c.radios r
                GROUP BY c.id, c.priority
                ORDER BY c.priority asc, c.id asc
            '
        );

        $query->enableResultCache( self::CACHE_COLLECTION_TTL, self::CACHE_COLLECTION_ID);
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

        $data = [];
        foreach ($results as $collection) {
            if ($collection['code_name'] === Radio::FAVORITES) {
                $collection['radios'] = $favorites;
            } else {
                $collection['radios'] = explode(',', $collection['radios']);
            }

            //$data[$collection['code_name']] = $collection;
            $data[] = $collection;
        }

        return array_column($data, null, 'code_name');
    }

    public function getFavorites(array $favoritesFromCookies = []): array
    {
        $user = $this->security->getUser();

        $qb = $this->getEntityManager()->createQueryBuilder();

        $qb->select('r.codeName')
            ->from(Radio::class, 'r')
            ->where('r.active = :active');

        $qb->setParameter('active', true);

        if ($user !== null) {
            $favorites = $user->getFavoriteRadios()->map(
                function ($radio) {
                    return $radio->getCodeName();
                }
            )->toArray();
        } else {
            $favorites = $favoritesFromCookies;
        }

        $qb->andWhere('r.codeName IN (:radios)')
            ->setParameter('radios', $favorites);

        $qb->getQuery()->disableResultCache(); // rely on app schedule cache and only get fresh data here
        $result = $qb->getQuery()->getResult();

        return array_column($result, 'codeName');
    }
}
