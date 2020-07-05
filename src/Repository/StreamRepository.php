<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Stream;
use Doctrine\ORM\EntityRepository;

class StreamRepository extends EntityRepository
{
    protected const CACHE_TTL = 3600; // one hour

    public function getStreams(
        int $limit = null,
        int $offset = null,
        string $country = null,
        string $sort = null
    ): array {
        $qb = $this->getEntityManager()->createQueryBuilder();

        $qb->select("s.id as code_name, s.name, s.img, s.streamUrl as stream_url, s.countryCode as country_code, s.votes, s.clicksLast24h as clicks_last_24h, 'stream' as type")
            ->from(Stream::class, 's')
            ->setMaxResults($limit);

        if ($offset !== null) {
            $qb->setFirstResult($offset);
        }

        if ($country !== null) {
            $qb->where('s.countryCode = :country')
                ->setParameter('country', $country);
        }

        if ($sort !== null) {
            switch ($sort) {
                case 'name':
                    $qb->addOrderBy('s.name', 'ASC');
                    break;
                case 'popularity':
                    $qb->addOrderBy('s.votes', 'DESC');
                    break;
                case 'random':
                    $qb->addOrderBy('RANDOM()');
                    break;
            }
        }

        $qb->getQuery()->enableResultCache(self::CACHE_TTL);

        return $qb->getQuery()->getResult();
    }

    public function getOneRandomStream(
        string $country = null,
        string $language = null
    ): ?array {
        $total = $this->countStreams($country, $language);
        $offset = mt_rand(0, $total - 1);

        $qb = $this->getEntityManager()->createQueryBuilder();

        $qb->select('s.id as code_name, s.name, s.img, s.streamUrl as stream_url, s.countryCode as country_code, s.votes, s.clicksLast24h as clicks_last_24h')
            ->from(Stream::class, 's')
            ->addOrderBy('s.name', 'ASC')
            ->setFirstResult($offset)
            ->setMaxResults(1);

        if ($country !== null) {
            $qb->where('s.countryCode = :country')
                ->setParameter('country', strtoupper($country));
        }

        if ($language !== null) {
            $qb->andWhere('s.language = :language')
                ->setParameter('language', $language);
        }

        $qb->getQuery()->enableResultCache(self::CACHE_TTL);

        return $qb->getQuery()->getOneOrNullResult();
    }

    public function countStreams(
        string $country = null,
        string $language = null
    ): int {
        $qb = $this->getEntityManager()->createQueryBuilder();

        $qb->select('count(s.id)')
            ->from(Stream::class, 's');

        if ($country !== null) {
            $qb->where('s.countryCode = :country')
                ->setParameter('country', strtoupper($country));
        }

        if ($language !== null) {
            $qb->andWhere('s.language = :language')
                ->setParameter('language', $language);
        }

        $qb->getQuery()->enableResultCache(self::CACHE_TTL);

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function getCountryCodes(): array
    {
        $qb = $this->getEntityManager()->createQueryBuilder();

        $qb->select('DISTINCT UPPER(s.countryCode) as countryCode')
            ->from(Stream::class, 's')
            ->where("s.countryCode <> ''")
            ->orderBy('countryCode', 'ASC');

        $qb->getQuery()->enableResultCache(self::CACHE_TTL);

        return $qb->getQuery()->getResult();
    }
}
