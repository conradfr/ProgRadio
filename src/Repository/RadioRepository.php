<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Radio;
use App\Entity\Stream;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query\Parameter;

class RadioRepository extends EntityRepository
{
    protected const int CACHE_RADIO_TTL = 604800; // week
    protected const int CACHE_MORE_TTL = 60;
    protected const string CACHE_RADIO_ACTIVE_ID = 'active_radios';

    protected const int DEFAULT_MORE_MAX = 6;

    public function getActiveRadios(): array {
        $query = $this->getEntityManager()->createQuery(
            "SELECT r.id, r.codeName as code_name, r.name, s.streamUrl as streamUrl,
                    s.streamUrl as streamingUrl, r.share, COALESCE(s.enabled, false) as streaming_enabled,
                    c.codeName as category, 'radio' as type,
                    s.streamUrl as stream_url
                FROM " . Radio::class
                  . " r INNER JOIN r.category c
                  INNER JOIN r.streams s
                WHERE r.active = :active
                  AND s.isMainRadio = TRUE
                ORDER BY r.codeName ASC
            "
        );

        $query->setParameter('active', true);

        $query->enableResultCache(self::CACHE_RADIO_TTL, self::CACHE_RADIO_ACTIVE_ID);
        $result = $query->getResult();

        $resultRadios = array_column($result, null, 'code_name');

        return array_map(function ($radio) {
            $radio['streams'] = [];
            unset($radio['id']);
            return $radio;
        } , $resultRadios);
    }

    public function getActiveRadiosFull(): array {
        $query = $this->getEntityManager()->createQuery(
            "SELECT r.codeName, r.name, s.streamUrl as streamingUrl, r.share, COALESCE(s.enabled, false) as streamingEnabled,
                    s.playingError as streamingRetries,
                    c.codeName as category, 'radio' as type,
                    s.streamUrl as streamUrl
                FROM " . Radio::class
                  . " r INNER JOIN r.category c
                  LEFT JOIN r.streams s
                WHERE r.active = :active
                  AND s.isMainRadio = TRUE
            "
        );

        $query->setParameter('active', true);

        $query->enableResultCache(self::CACHE_RADIO_TTL, self::CACHE_RADIO_ACTIVE_ID);
        $results = $query->getResult();

        return array_column($results, null, 'code_name');
    }

    public function getAllCodename($filterbyActive = true): array {
        $qb = $this->createQueryBuilder('r');

        $qb->select('r.codeName, GROUP_CONCAT(sr.codeName) as sub_radios')
            ->innerJoin('r.subRadios', 'sr')
            ->groupBy('r.codeName');

        if ($filterbyActive) {
            $qb->where('r.active = true')
               ->andWhere('sr.enabled = true');
        }

        $query = $qb->getQuery();
        $query->enableResultCache(self::CACHE_RADIO_TTL);

        $result = $query->getResult();

        return array_column($result, 'sub_radios', 'codeName');
    }

    public function getNameAndShares(): array
    {
        $qb = $this->getEntityManager()->createQueryBuilder();

        $qb->select('r.id, r.codeName, r.name, r.share')
            ->from(Radio::class, 'r')
            ->addOrderBy('r.share', 'DESC')
            ->addOrderBy('r.codeName', 'ASC');

        return $qb->getQuery()->getResult();
    }

    public function getMoreRadiosFrom(Radio $radio, bool $inverse=false, $max=self::DEFAULT_MORE_MAX): array
    {
        $sort = random_int(0,1) === 1 ? 'DESC' : 'ASC';
        $sort2 = random_int(0,1) === 1 ? 'DESC' : 'ASC';
        $equality = $inverse === false ? '=' : '!=';

        $qb = $this->getEntityManager()->createQueryBuilder();

        $qb->select('r.id, r.codeName, r.name')
            ->from(Radio::class, 'r')
            ->innerJoin('r.streams', 's')
            ->where('r.collection ' . $equality . ' :collection')
            ->andWhere('r.active = TRUE')
            ->andWhere('r != :radio')
            ->andWhere('(s.isMainRadio = TRUE and s.enabled = TRUE)')
            ->addOrderBy('r.share', $sort)
            ->addOrderBy('r.codeName', $sort2)
            ->setMaxResults($max);

        $qb->setParameters(new ArrayCollection([
            new Parameter('radio', $radio),
            new Parameter('collection', $radio->getCollection()),
        ]));

        $query = $qb->getQuery();
        $query->enableResultCache(self::CACHE_MORE_TTL);

        return $query->getResult();
    }

}
