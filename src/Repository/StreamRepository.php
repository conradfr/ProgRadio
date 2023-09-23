<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Radio;
use App\Entity\Stream;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Query\ResultSetMapping;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Bundle\SecurityBundle\Security;

/*
 @TODO reduce code duplication for queries
 */
class StreamRepository extends ServiceEntityRepository
{
    protected const CACHE_TTL = 21600; // six hours

    protected const DEFAULT_MORE_LIMIT = 12;

    public function __construct(private readonly Security $security, ManagerRegistry $registry)
    {
        parent::__construct($registry, Stream::class);
    }

    public function getStreamsWithPlayingError($threshold=2)
    {
        $qb = $this->getEntityManager()->createQueryBuilder();

        $qb->select('s.id, s.name, s.playingError, s.streamUrl')
            ->from(Stream::class, 's')
            ->where('s.playingError >= :threshold')
            ->orderBy('s.playingError', 'DESC');

        $qb->setParameter('threshold', $threshold);

        return $qb->getQuery()->getResult();
    }

    public function resetAllPlayingErrors()
    {
        $rsm = new ResultSetMapping();
        $query = $this->getEntityManager()->createNativeQuery('UPDATE stream SET playing_error = 0 WHERE playing_error > 0', $rsm);

        $query->getResult();
    }

    public function getMoreStreams(Stream $stream, int $limit=self::DEFAULT_MORE_LIMIT)
    {
        $limitHalf = $limit / 2;

        // country

        $qbCountry = $this->getMoreStreamQuery($stream->getId(), $limitHalf);

        if ($stream->getCountryCode() !== null) {
            $qbCountry->andWhere('s.countryCode = :countryCode')
               ->setParameter('countryCode', $stream->getCountryCode());
        }

        $resultCountry = $qbCountry->getQuery()->getResult();

        // random

        $qbRandom = $this->getMoreStreamQuery($stream->getId(), $limitHalf);
        $resultRandom = $qbRandom->getQuery()->getResult();

        return array_merge($resultCountry, $resultRandom);
    }

    protected function getMoreStreamQuery(string $id, int $limit) {
        $qb = $this->getEntityManager()->createQueryBuilder();

        $qb->select('s.id as code_name, s.name as name, s.img, COALESCE(r.codeName) as img_alt, s.website')
            ->from(Stream::class, 's')
            ->leftJoin('s.radioStream', 'rs')
            ->leftJoin('rs.radio', 'r')
            ->where("s.img is not null")
            ->andWhere("RANDOM() < 0.01")
            ->andWhere('s.id != :id')
            ->andWhere('s.enabled = true')
            ->setMaxResults($limit);

        $qb->setParameter('id', $id);

        return $qb;
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

        $qb->select("s.id as code_name, s.name, s.img, COALESCE(rs.url, s.streamUrl) as stream_url, s.tags, s.countryCode as country_code, s.clicksLast24h as clicks_last_24h, 'stream' as type, COALESCE(r.codeName) as radio_code_name,"
            . 'COALESCE(r.codeName) as img_alt,'
            . 'CASE WHEN(ss.codeName IS NOT NULL and ss.enabled = TRUE) THEN TRUE ELSE rs.currentSong END as current_song,'
            . 'CASE WHEN(s.streamSongCodeName IS NOT NULL and ss.enabled = TRUE) THEN s.streamSongCodeName ELSE rs.codeName END as radio_stream_code_name')
            ->from(Stream::class, 's')
            ->leftJoin('s.radioStream', 'rs')
            ->leftJoin('rs.radio', 'r')
            ->leftJoin('s.streamSong', 'ss')
            ->where('s.enabled = true')
            ->setMaxResults($limit);

        if ($offset !== null) {
            $qb->setFirstResult($offset);
        }

        if ($countryOrCategory !== null) {
            if ($countryOrCategory === Stream::FAVORITES) {
                if ($user !== null) {
                    $favorites = $user->getFavoriteStreams()->map(
                        fn($stream) => $stream->getId()
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
                case 'last':
                    $qb->addSelect('MAX(ls.dateTimeStart) as last_listen')
                       //->distinct()
                       ->leftJoin('s.listeningSessions', 'ls')
                       ->groupBy('s.id, r.codeName, ss.codeName, ss.enabled, rs.currentSong, rs.codeName, rs.url')
                       ->addOrderBy('MAX(ls.dateTimeStart)', 'DESC');
                    break;
            }
        }

        $query = $qb->getQuery();

        if ($sort !== 'random' && $sort !== 'last') {
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

        $qb->select("s.id as code_name, s.name, s.img, s.streamUrl as stream_url, s.tags, s.countryCode as country_code, s.website, s.clicksLast24h as clicks_last_24h, 'stream' as type, COALESCE(r.codeName) as radio_code_name,"
            . 'COALESCE(r.codeName) as img_alt,'
            . 'CASE WHEN(ss.codeName IS NOT NULL and ss.enabled = TRUE) THEN TRUE ELSE rs.currentSong END as current_song,'
            . 'CASE WHEN(s.streamSongCodeName IS NOT NULL and ss.enabled = TRUE) THEN s.streamSongCodeName ELSE rs.codeName END as radio_stream_code_name')
            ->from(Stream::class, 's')
            ->leftJoin('s.radioStream', 'rs')
            ->leftJoin('rs.radio', 'r')
            ->leftJoin('s.streamSong', 'ss')
            ->where('s.enabled = true')
            ->andWhere('(ILIKE(s.name, :text) = true or ILIKE(s.tags, :text) = true)')
            //->orWhere('ILIKE(s.tags, :text) = true')
            ->setMaxResults($limit)
            ->setParameter('text', '%' . $text . '%');

        if ($offset !== null) {
            $qb->setFirstResult($offset);
        }

        if ($countryOrCategory !== null) {
            if ($countryOrCategory === Stream::FAVORITES) {
                if ($user !== null) {
                    $favorites = $user->getFavoriteStreams()->map(
                        fn($stream) => $stream->getId()
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
                case 'last':
                    $qb->addSelect('MAX(ls.dateTimeStart) as last_listen')
                        //->distinct()
                        ->leftJoin('s.listeningSessions', 'ls')
                        ->groupBy('s.id, r.codeName, ss.codeName, ss.enabled, rs.currentSong, rs.codeName')
                        ->addOrderBy('MAX(ls.dateTimeStart)', 'DESC');
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

        $offset = random_int(0, $total - 1);

        $qb = $this->getEntityManager()->createQueryBuilder();

        $qb->select("s.id as code_name, s.name as name, s.img, s.streamUrl as stream_url, s.tags, s.countryCode as country_code, s.website, s.clicksLast24h as clicks_last_24h, 'stream' as type, COALESCE(r.codeName) as radio_code_name,"
            . 'COALESCE(r.codeName) as img_alt,'
            . 'CASE WHEN(ss.codeName IS NOT NULL and ss.enabled = TRUE) THEN TRUE ELSE rs.currentSong END as current_song,'
            . 'CASE WHEN(s.streamSongCodeName IS NOT NULL and ss.enabled = TRUE) THEN s.streamSongCodeName ELSE rs.codeName END as radio_stream_code_name')
            ->from(Stream::class, 's')
            ->leftJoin('s.radioStream', 'rs')
            ->leftJoin('rs.radio', 'r')
            ->leftJoin('s.streamSong', 'ss')
            ->where('s.enabled = true')
            ->addOrderBy('s.name', 'ASC')
            ->setFirstResult($offset)
            ->setMaxResults(1);

        if ($countryOrCategory !== null) {
            if ($countryOrCategory === Stream::FAVORITES) {
                if ($user !== null) {
                    $favorites = $user->getFavoriteStreams()->map(
                        fn($stream) => $stream->getId()
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

        $qb->select("s.id as code_name, s.name, s.img, s.streamUrl as stream_url, s.tags, s.countryCode as country_code, s.website, s.clicksLast24h as clicks_last_24h, 'stream' as type, COALESCE(r.codeName) as radio_code_name,"
            . 'COALESCE(r.codeName) as img_alt,'
            . 'CASE WHEN(ss.codeName IS NOT NULL and ss.enabled = TRUE) THEN TRUE ELSE rs.currentSong END as current_song,'
            . 'CASE WHEN(s.streamSongCodeName IS NOT NULL and ss.enabled = TRUE) THEN s.streamSongCodeName ELSE rs.codeName END as radio_stream_code_name')
            ->from(Stream::class, 's')
            ->leftJoin('s.radioStream', 'rs')
            ->leftJoin('rs.radio', 'r')
            ->leftJoin('s.streamSong', 'ss')
            ->where('s.id = :id')
            ->andWhere('s.enabled = true')
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
                        fn($stream) => $stream->getId()
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
            ->where('s.enabled = true')
            ->andWhere('(ILIKE(s.name, :text) = true or ILIKE(s.tags, :text) = true)')
            ->setParameter('text', '%' . $text . '%');

        if ($countryOrCategory !== null) {
            if ($countryOrCategory === Stream::FAVORITES) {
                if ($user !== null) {
                    $favorites = $user->getFavoriteStreams()->map(
                        fn($stream) => $stream->getId()
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
            ->andWhere('s.enabled = true')
            ->orderBy('s.clicksLast24h', 'DESC')
            ->setFirstResult(0)
            ->setMaxResults(1)
            ->setParameter('id', $radioStream->getId());

        $query = $qb->getQuery();
        $query->enableResultCache(self::CACHE_TTL);

        return $query->getOneOrNullResult();
    }
}
