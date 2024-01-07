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
    protected const CACHE_QUICK_TTL = 30;

    protected const DEFAULT_MORE_LIMIT = 15;

    public function __construct(private readonly Security $security, ManagerRegistry $registry)
    {
        parent::__construct($registry, Stream::class);
    }

    public function getStreamsWithPlayingError(int $threshold=2, ?int $ceiling)
    {
        $qb = $this->getEntityManager()->createQueryBuilder();

        $qb->select('s.id, s.name, s.playingError, s.streamUrl, s.countryCode')
            ->from(Stream::class, 's')
            ->where('s.playingError >= :threshold')
            ->orderBy('s.playingError', 'DESC');

        $qb->setParameter('threshold', $threshold);

        if ($ceiling) {
            $qb->andWhere('s.playingError <= :ceiling');
            $qb->setParameter('ceiling', $ceiling);
        }

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
        $limitThird = (int) round($limit / 3, 0);

        // popular country

        $resultCountry = $this->getStreams($limitThird, 0, $stream->getCountryCode(), 'popularity');

        // last country

        $resultCountryLast = $this->getStreams($limitThird, 0, $stream->getCountryCode(), 'last');

        // random

        $qbRandom = $this->getMoreStreamQuery($stream->getId(), $limitThird);
        $resultRandom = $qbRandom->getQuery()->getResult();

        return array_merge($resultCountry, $resultCountryLast, $resultRandom);
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
            ->andWhere('s.enabled = true and s.redirectToStream IS NULL')
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
            ->where('s.enabled = true and s.redirectToStream IS NULL')
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
                    $qb->addSelect('MAX(s.lastListeningAt) as last_listen')
                       //->distinct()
                       ->andWhere('s.lastListeningAt IS NOT NULL')
                       ->groupBy('s.id, r.codeName, ss.codeName, ss.enabled, rs.currentSong, rs.codeName, rs.url')
                       ->addOrderBy('MAX(s.lastListeningAt)', 'DESC');
                    break;
            }
        }

        $query = $qb->getQuery();

        if ($sort !== 'random' && $sort !== 'last') {
            $query->enableResultCache(self::CACHE_TTL);
        } else {
            // because bots
            $query->enableResultCache(self::CACHE_QUICK_TTL);
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
            ->where('s.enabled = true and s.redirectToStream IS NULL')
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
            ->where('s.enabled = true and s.redirectToStream IS NULL')
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
            ->from(Stream::class, 's')
            ->where('s.enabled = true and s.redirectToStream IS NULL');

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
            ->andWhere('s.enabled = true and s.redirectToStream IS NULL')
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
            ->andWhere('s.enabled = true and s.redirectToStream IS NULL')
            ->orderBy('s.clicksLast24h', 'DESC')
            ->setFirstResult(0)
            ->setMaxResults(1)
            ->setParameter('id', $radioStream->getId());

        $query = $qb->getQuery();
        $query->enableResultCache(self::CACHE_TTL);

        return $query->getOneOrNullResult();
    }
}
