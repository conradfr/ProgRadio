<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Radio;
use App\Entity\Stream;
use App\Entity\RadioStream;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Security\Core\Security;

/*
 @TODO reduce code duplication for queries
 */
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

        $qb->select("s.id as code_name, s.name, s.img, s.streamUrl as stream_url, s.tags, s.countryCode as country_code, s.clicksLast24h as clicks_last_24h, 'stream' as type,"
            . 'COALESCE(r.codeName) as img_alt,'
            . 'CASE WHEN(ss.codeName IS NOT NULL and ss.enabled = TRUE) THEN TRUE ELSE rs.currentSong END as current_song,'
            . 'CASE WHEN(s.streamSongCodeName IS NOT NULL and ss.enabled = TRUE) THEN s.streamSongCodeName ELSE rs.codeName END as radio_code_name')
            ->from(Stream::class, 's')
            ->leftJoin('s.radioStream', 'rs')
            ->leftJoin('rs.radio', 'r')
            ->leftJoin('s.streamSong', 'ss')
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

        $query = $qb->getQuery();

        if ($sort !== 'random') {
            $query->enableResultCache(self::CACHE_TTL);
        }

        return $query->getResult();
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

        $qb->select("s.id as code_name, s.name, s.img, s.tags, s.streamUrl as stream_url, s.countryCode as country_code, s.clicksLast24h as clicks_last_24h, 'stream' as type,"
            . 'COALESCE(r.codeName) as img_alt,'
            . 'CASE WHEN(ss.codeName IS NOT NULL and ss.enabled = TRUE) THEN TRUE ELSE rs.currentSong END as current_song,'
            . 'CASE WHEN(s.streamSongCodeName IS NOT NULL and ss.enabled = TRUE) THEN s.streamSongCodeName ELSE rs.codeName END as radio_code_name')
            ->from(Stream::class, 's')
            ->leftJoin('s.radioStream', 'rs')
            ->leftJoin('rs.radio', 'r')
            ->leftJoin('s.streamSong', 'ss')
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

        $query = $qb->getQuery();

        if ($sort !== 'random') {
            $query->enableResultCache(self::CACHE_TTL);
        }

        return $query->getResult();
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

        $qb->select("s.id as code_name, s.name, s.img, s.streamUrl as stream_url, s.countryCode as country_code, s.clicksLast24h as clicks_last_24h, 'stream' as type,"
            . 'COALESCE(r.codeName) as img_alt,'
            . 'CASE WHEN(ss.codeName IS NOT NULL and ss.enabled = TRUE) THEN TRUE ELSE rs.currentSong END as current_song,'
            . 'CASE WHEN(s.streamSongCodeName IS NOT NULL and ss.enabled = TRUE) THEN s.streamSongCodeName ELSE rs.codeName END as radio_code_name')
            ->from(Stream::class, 's')
            ->leftJoin('s.radioStream', 'rs')
            ->leftJoin('rs.radio', 'r')
            ->leftJoin('s.streamSong', 'ss')
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

        $query = $qb->getQuery();
        $query->disableResultCache();

        return $query->getOneOrNullResult();
    }

    public function getOneSpecificStream(
        string $id
    ): ?array {
        $qb = $this->getEntityManager()->createQueryBuilder();

        $qb->select("s.id as code_name, s.name, s.img, s.streamUrl as stream_url, s.countryCode as country_code, s.clicksLast24h as clicks_last_24h, 'stream' as type,"
            . 'COALESCE(r.codeName) as img_alt,'
            . 'CASE WHEN(ss.codeName IS NOT NULL and ss.enabled = TRUE) THEN TRUE ELSE rs.currentSong END as current_song,'
            . 'CASE WHEN(s.streamSongCodeName IS NOT NULL and ss.enabled = TRUE) THEN s.streamSongCodeName ELSE rs.codeName END as radio_code_name')
            ->from(Stream::class, 's')
            ->leftJoin('s.radioStream', 'rs')
            ->leftJoin('rs.radio', 'r')
            ->leftJoin('s.streamSong', 'ss')
            ->where('s.id = :id')
            ->setMaxResults(1);

        $qb->setParameter('id', $id);

        $query = $qb->getQuery();
        $query->enableResultCache(self::CACHE_TTL);

        return $query->getOneOrNullResult();
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

        $query = $qb->getQuery();
        $query->enableResultCache(self::CACHE_TTL);

        return $query->getSingleScalarResult();
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

        $query = $qb->getQuery();
        $query->enableResultCache(self::CACHE_TTL);

        return $query->getSingleScalarResult();
    }

    public function getCountryCodes(): array
    {
        $qb = $this->getEntityManager()->createQueryBuilder();

        $qb->select('DISTINCT UPPER(s.countryCode) as countryCode')
            ->from(Stream::class, 's')
            ->where('s.countryCode IS NOT NULL')
            ->andWhere('s.countryCode <> \'\'')
            ->orderBy('countryCode', 'ASC');

        $query = $qb->getQuery();
        $query->enableResultCache(self::CACHE_TTL);

        return $query->getResult();
    }

    public function getBestStreamForRadio(Radio $radio)
    {
        $radioStream = $radio->getMainStream();

        if ($radioStream === null) {
            return null;
        }

        $qb = $this->getEntityManager()->createQueryBuilder();

        $qb->select('s')
            ->from(Stream::class, 's')
            ->innerJoin('s.radioStream', 'rs')
            ->where('rs.id = :id')
            ->orderBy('s.clicksLast24h', 'DESC')
            ->setFirstResult(0)
            ->setMaxResults(1)
            ->setParameter('id', $radioStream->getId());

        $query = $qb->getQuery();
        $query->enableResultCache(self::CACHE_TTL);

        return $query->getOneOrNullResult();
    }
}
