<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Stream;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Security\Core\Security;

class StreamRepository extends ServiceEntityRepository
{
    protected const CACHE_TTL = 21600; // six hours

    private $security;

    public function __construct(Security $security, ManagerRegistry $registry)
    {
        parent::__construct($registry, Stream::class);

        // Avoid calling getUser() in the constructor: auth may not
        // be complete yet. Instead, store the entire Security object.
        $this->security = $security;
    }

    public function getStreams(
        int $limit = null,
        int $offset = null,
        string $countryOrCategory = null,
        string $sort = null,
        array $favoritesFromCookies = []
    ): array {
        $user = $this->security->getUser();

        $qb = $this->getEntityManager()->createQueryBuilder();

        $qb->select("s.id as code_name, s.name, s.img, s.streamUrl as stream_url, s.tags, s.countryCode as country_code, s.clicksLast24h as clicks_last_24h, 'stream' as type")
            ->from(Stream::class, 's')
            ->setMaxResults($limit);

        if ($offset !== null) {
            $qb->setFirstResult($offset);
        }

        if ($countryOrCategory !== null) {
            if ($countryOrCategory === Stream::FAVORITES) {
                if ($user !== null) {
                    $favorites = $user->getFavoriteStreams()->map(
                        function ($stream) {
                            return $stream->getId();
                        }
                    )->toArray();
                } else {
                    $favorites = $favoritesFromCookies;
                }

                $qb->where('s.id IN (:favorites)')
                    ->setParameter('favorites', $favorites);
            } else {
                $qb->where('s.countryCode = :country')
                    ->setParameter('country', strtoupper($countryOrCategory));
            }
        }

        if ($sort !== null) {
            switch ($sort) {
                case 'name':
                    $qb->addOrderBy('s.name', 'ASC');
                    break;
                case 'popularity':
                    $qb->addOrderBy('s.clicksLast24h', 'DESC');
                    break;
                case 'random':
                    $qb->addOrderBy('RANDOM()');
                    break;
            }
        }

        if ($sort !== 'random') {
            $qb->getQuery()->enableResultCache(self::CACHE_TTL);
        }

        return $qb->getQuery()->getResult();
    }

    public function searchStreams(
        string $text,
        int $limit = null,
        int $offset = null,
        string $countryOrCategory = null,
        string $sort = null,
        array $favoritesFromCookies = []
    ): array {
        $user = $this->security->getUser();

        $qb = $this->getEntityManager()->createQueryBuilder();

        $qb->select("s.id as code_name, s.name, s.img, s.tags, s.streamUrl as stream_url, s.countryCode as country_code, s.clicksLast24h as clicks_last_24h, 'stream' as type")
            ->from(Stream::class, 's')
            ->where('ILIKE(s.name, :text) = true')
            ->orWhere('ILIKE(s.tags, :text) = true')
            ->setMaxResults($limit)
            ->setParameter('text', '%' . $text . '%');

        if ($offset !== null) {
            $qb->setFirstResult($offset);
        }

        if ($countryOrCategory !== null) {
            if ($countryOrCategory === Stream::FAVORITES) {
                if ($user !== null) {
                    $favorites = $user->getFavoriteStreams()->map(
                        function ($stream) {
                            return $stream->getId();
                        }
                    )->toArray();
                } else {
                    $favorites = $favoritesFromCookies;
                }

                $qb->andWhere('s.id IN (:favorites)')
                    ->setParameter('favorites', $favorites);
            } else {
                $qb->andWhere('s.countryCode = :country')
                    ->setParameter('country', strtoupper($countryOrCategory));
            }
        }

        if ($sort !== null) {
            switch ($sort) {
                case 'name':
                    $qb->addOrderBy('s.name', 'ASC');
                    break;
                case 'popularity':
                    $qb->addOrderBy('s.clicksLast24h', 'DESC');
                    break;
                case 'random':
                    $qb->addOrderBy('RANDOM()');
                    break;
            }
        }

        if ($sort !== 'random') {
            $qb->getQuery()->enableResultCache(self::CACHE_TTL);
        }

        return $qb->getQuery()->getResult();
    }

    public function getOneRandomStream(
        string $countryOrCategory = null,
        string $language = null,
        array $favoritesFromCookies = []
    ): ?array {
        $user = $this->security->getUser();

        $total = $this->countStreams($countryOrCategory, $language);

        if ($total === 0) {
            return $this->getOneRandomStream();
        }

        $offset = mt_rand(0, $total - 1);

        $qb = $this->getEntityManager()->createQueryBuilder();

        $qb->select('s.id as code_name, s.name, s.img, s.streamUrl as stream_url, s.countryCode as country_code, s.clicksLast24h as clicks_last_24h')
            ->from(Stream::class, 's')
            ->addOrderBy('s.name', 'ASC')
            ->setFirstResult($offset)
            ->setMaxResults(1);

        if ($countryOrCategory !== null) {
            if ($countryOrCategory === Stream::FAVORITES) {
                if ($user !== null) {
                    $favorites = $user->getFavoriteStreams()->map(
                        function ($stream) {
                            return $stream->getId();
                        }
                    )->toArray();
                } else {
                    $favorites = $favoritesFromCookies;
                }

                $qb->where('s.id IN (:favorites)')
                    ->setParameter('favorites', $favorites);
            } else {
                $qb->where('s.countryCode = :country')
                    ->setParameter('country', strtoupper($countryOrCategory));
            }
        }

        if ($language !== null) {
            $qb->andWhere('s.language = :language')
                ->setParameter('language', $language);
        }

        $qb->getQuery()->enableResultCache(self::CACHE_TTL);

        return $qb->getQuery()->getOneOrNullResult();
    }

    public function countStreams(
        string $countryOrCategory = null,
        string $language = null,
        array $favoritesFromCookies = []
    ): int {
        $user = $this->security->getUser();

        $qb = $this->getEntityManager()->createQueryBuilder();

        $qb->select('count(s.id)')
            ->from(Stream::class, 's');

        if ($countryOrCategory !== null) {
            if ($countryOrCategory === Stream::FAVORITES) {
                if ($user !== null) {
                    $favorites = $user->getFavoriteStreams()->map(
                        function ($stream) {
                            return $stream->getId();
                        }
                    )->toArray();
                } else {
                    $favorites = $favoritesFromCookies;
                }

                $qb->where('s.id IN (:favorites)')
                    ->setParameter('favorites', $favorites);
            } else {
                $qb->where('s.countryCode = :country')
                    ->setParameter('country', strtoupper($countryOrCategory));
            }
        }

        if ($language !== null) {
            $qb->andWhere('s.language = :language')
                ->setParameter('language', $language);
        }

        $qb->getQuery()->enableResultCache(self::CACHE_TTL);

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function countSearchStreams(
        string $text,
        string $countryOrCategory = null,
        string $language = null,
        array $favoritesFromCookies = []
    ): int {
        $user = $this->security->getUser();

        $qb = $this->getEntityManager()->createQueryBuilder();

        $qb->select('count(s.id)')
            ->from(Stream::class, 's')
            ->where('ILIKE(s.name, :text) = true')
            ->orWhere('ILIKE(s.tags, :text) = true')
            ->setParameter('text', '%' . $text . '%');

        if ($countryOrCategory !== null) {
            if ($countryOrCategory === Stream::FAVORITES) {
                if ($user !== null) {
                    $favorites = $user->getFavoriteStreams()->map(
                        function ($stream) {
                            return $stream->getId();
                        }
                    )->toArray();
                } else {
                    $favorites = $favoritesFromCookies;
                }

                $qb->andWhere('s.id IN (:favorites)')
                    ->setParameter('favorites', $favorites);
            } else {
                $qb->andWhere('s.countryCode = :country')
                    ->setParameter('country', strtoupper($countryOrCategory));
            }
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
