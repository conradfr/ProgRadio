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
    protected const CACHE_RADIO_ACTIVE_ID = 'active_radios';

    private $security;

    public function __construct(Security $security, ManagerRegistry $registry)
    {
        parent::__construct($registry, Radio::class);

        // Avoid calling getUser() in the constructor: auth may not
        // be complete yet. Instead, store the entire Security object.
        $this->security = $security;
    }

    public function getActiveRadios(): array {
        $query = $this->getEntityManager()->createQuery(
            "SELECT r.codeName as code_name, r.name, s.url as streamUrl,
                    s.url as streamingUrl, r.share, s.enabled as streaming_enabled,
                    c.codeName as category, 'radio' as type,
                    s.url as stream_url 
                FROM App:Radio r
                  INNER JOIN r.category c
                  INNER JOIN r.streams s
                WHERE r.active = :active 
                  AND s.main = TRUE
            "
        );

        $query->setParameter('active', true);

        $query->enableResultCache(self::CACHE_RADIO_TTL, self::CACHE_RADIO_ACTIVE_ID);
        $results = $query->getResult();

        return array_column($results, null, 'code_name');
    }

    public function getActiveRadiosFull(): array {
        $query = $this->getEntityManager()->createQuery(
            "SELECT r.codeName, r.name, s.url as streamingUrl, r.share, s.enabled as streamingEnabled,
                    s.retries as streamingRetries, s.status as streamingStatus,
                    c.codeName as category, 'radio' as type,
                    s.url as streamUrl 
                FROM App:Radio r
                  INNER JOIN r.category c
                  INNER JOIN r.streams s
                WHERE r.active = :active 
                  AND s.main = TRUE
            "
        );

        $query->setParameter('active', true);

        $query->enableResultCache(self::CACHE_RADIO_TTL, self::CACHE_RADIO_ACTIVE_ID);
        $results = $query->getResult();

        return array_column($results, null, 'code_name');
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

    public function getAllActiveRadioCodenameOfCollection(string $collection): array {
        $query = $this->getEntityManager()->createQuery(
            "SELECT r.codeName
                FROM App:Radio r
                  INNER JOIN r.collection cl
                WHERE r.active = :active
                  AND cl.codeName = :collection 
            "
        );

        $query->setParameters([
            'active' => true,
            'collection' => $collection
        ]);

        $query->enableResultCache(self::CACHE_RADIO_TTL, self::CACHE_RADIO_ACTIVE_ID . '_' . $collection);
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
