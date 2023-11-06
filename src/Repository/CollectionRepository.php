<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Collection;
use App\Entity\Radio;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Bundle\SecurityBundle\Security;

class CollectionRepository extends ServiceEntityRepository
{
    protected const CACHE_COLLECTION_TTL = 604800; // week
    protected const CACHE_COLLECTION_ID = 'collections';

    protected const CACHE_FAVORITES_TTL = 3600;

    public function __construct(// one hour
    private readonly Security $security, ManagerRegistry $registry)
    {
        parent::__construct($registry, Collection::class);
    }

    public function getCollections(array $favoritesFromCookies = []): array {
        $user = $this->security->getUser();

        $qb = $this->getEntityManager()->createQueryBuilder();

        $qb->select('c.codeName as code_name, c.name_fr as name_FR, c.name_en as name_EN, c.name_es as name_ES, c.name_de as name_DE, c.name_pt as name_PT, c.name_it as name_IT, c.name_pl as name_PL, c.name_el as name_EL, c.shortName as short_name, 
                c.priority, c.sortField as sort_field, c.sortOrder as sort_order,
                GROUP_CONCAT(r.codeName) as radios')
            ->from(Collection::class, 'c')
            ->leftJoin('c.radios', 'r')
            ->groupBy('c.id, c.priority')
            ->orderBy('c.priority', 'ASC');

        $query = $qb->getQuery();
        $query->enableResultCache( self::CACHE_COLLECTION_TTL, self::CACHE_COLLECTION_ID);
        $results = $query->getResult();

        // @todo refactor favorite management

        $favorites = null;
        if($user !== null) {
            $favorites = $user->getFavoriteRadios()->map(
                fn($radio) => $radio->getCodeName()
            )->toArray();
        } else {
            $favorites = $favoritesFromCookies;
        }

        $data = [];
        foreach ($results as $collection) {
            if ($collection['code_name'] === Radio::FAVORITES) {
                $collection['radios'] = $favorites;
            } else {
                $collection['radios'] = explode(',', (string) $collection['radios']);
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
                fn($radio) => $radio->getCodeName()
            )->toArray();
        } else {
            $favorites = $favoritesFromCookies;
        }

        $qb->andWhere('r.codeName IN (:radios)')
            ->setParameter('radios', $favorites);

        $query = $qb->getQuery();
        $query->enableResultCache(self::CACHE_FAVORITES_TTL);
        $result = $query->getResult();

        return array_column($result, 'codeName');
    }
}
