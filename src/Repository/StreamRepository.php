<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Radio;
use App\Entity\Stream;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Query\ResultSetMapping;
use Doctrine\Persistence\ManagerRegistry;
use Knp\Component\Pager\Pagination\PaginationInterface;
use Knp\Component\Pager\PaginatorInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Uid\Uuid;

/*
 @TODO reduce code duplication for queries
 */
class StreamRepository extends ServiceEntityRepository
{
    protected const int CACHE_TTL = 21600; // six hours
    protected const int CACHE_QUICK_TTL = 30;

    protected const int DEFAULT_MORE_LIMIT = 21;

    public function __construct(private readonly Security $security, protected PaginatorInterface $paginator, ManagerRegistry $registry, )
    {
        parent::__construct($registry, Stream::class);
    }

    public function getStreamsWithPlayingError(int $threshold, ?int $ceiling, ?string $countryCode)
    {
        $qb = $this->getEntityManager()->createQueryBuilder();

        $qb->select('s.id, s.name, s.playingError, s.streamUrl, s.countryCode, s.popup, s.playingErrorReason, s.forceHls, s.forceMpd, so.updatedAt, s.lastOverloadingOpen')
            ->from(Stream::class, 's')
            ->leftJoin('s.streamOverloading', 'so')
            ->where('s.playingError >= :threshold')
            ->orderBy('s.playingError', 'DESC');

        $qb->setParameter('threshold', $threshold);

        if ($ceiling) {
            $qb->andWhere('s.playingError <= :ceiling');
            $qb->setParameter('ceiling', $ceiling);
        }

        if ($countryCode) {
            $qb->andWhere('s.countryCode = :countryCode');
            $qb->setParameter('countryCode', $countryCode);
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
        $limitFourth = (int) round($limit / 4, 0);

        // popular country

        $resultCountry = $this->getStreams($limitFourth + 1, 0, $stream->getCountryCode(), 'popularity');

        // last country

        $resultCountryLast = $this->getStreams($limitFourth, 0, $stream->getCountryCode(), 'last');

        // last all

        $resultLast = $this->getStreams($limitFourth, 0, null, 'last');

        // random

        $qbRandom = $this->getMoreStreamQuery($stream->getId(), $limitFourth);
        $resultRandom = $qbRandom->getQuery()->enableResultCache(self::CACHE_QUICK_TTL)->getResult();

        return array_merge($resultCountry, $resultCountryLast, $resultLast, $resultRandom);
    }

    protected function getMoreStreamQuery(Uuid $id, int $limit) {
        $qb = $this->getEntityManager()->createQueryBuilder();

        $qb->select('s.id as code_name, s.name as name, s.img, COALESCE(CASE WHEN(BOOL_AND(rs.ownLogo) = TRUE) THEN rs.codeName ELSE :null END, r.codeName) as img_alt, s.website')
            ->from(Stream::class, 's')
            ->leftJoin('s.radioStream', 'rs')
            ->leftJoin('rs.radio', 'r')
            ->where("s.img is not null")
            ->andWhere("RANDOM() < 0.01")
            ->andWhere('s.id != :id')
            ->andWhere('s.enabled = true and s.banned = false and s.redirectToStream IS NULL')
            ->groupBy('s.id, r.codeName, rs.codeName')
            ->setMaxResults($limit)
            ->setParameter('null', null);

        $qb->setParameter('id', $id);

        return $qb;
    }

    public function getStreams(
        ?int $limit = null,
        ?int $offset = null,
        ?string $countryOrCategory = null,
        ?string $sort = null,
        array $favoritesFromCookies = []
    ): array {
        $user = $this->security->getUser();
        $qb = $this->getEntityManager()->createQueryBuilder();

        $qb->select("s.id as code_name, s.name, s.img, COALESCE(rs.url, s.streamUrl) as stream_url, s.tags, s.countryCode as country_code, s.website, s.clicksLast24h as clicks_last_24h, s.score as score, 'stream' as type, COALESCE(r.codeName) as radio_code_name, s.forceHls as force_hls, s.forceMpd as force_mpd, s.popup as popup,s.playingError as playing_error,"
            . 'COALESCE(CASE WHEN(BOOL_AND(rs.ownLogo) = TRUE) THEN rs.codeName ELSE :null END, r.codeName) as img_alt,'
            . 'CASE WHEN(ss.codeName IS NOT NULL and ss.enabled = TRUE) THEN TRUE ELSE rs.currentSong END as current_song,'
            . 'CASE WHEN(ss.codeName IS NOT NULL and ss.enabled = TRUE and s.streamSongCodeName IS NOT NULL) THEN CONCAT(ss.codeName, \'_\', s.streamSongCodeName) ELSE rs.codeName END as radio_stream_code_name')
            ->from(Stream::class, 's')
            ->leftJoin('s.radioStream', 'rs')
            ->leftJoin('rs.radio', 'r')
            ->leftJoin('s.streamSong', 'ss')
            ->where('s.enabled = true and s.banned = false and s.redirectToStream IS NULL')
            ->groupBy('s.id, rs.url, r.codeName, rs.codeName, ss.codeName, ss.enabled, rs.currentSong')
            ->setMaxResults($limit)
            // needed as using NULL directly was not working, neither were hacks like NULLIF(1,1) or omitting the ELSE
            ->setParameter('null', null);

        if ($offset !== null) {
            $qb->setFirstResult($offset);
        }

        if ($countryOrCategory !== null) {
            if (strtoupper($countryOrCategory) === Stream::FAVORITES) {
                if ($user !== null) {
                    $favorites = $user->getFavoriteStreams()->map(
                        fn($stream) => $stream->getId()
                    )->toArray();
                } else {
                    $favorites = $favoritesFromCookies;
                }

                $qb->andWhere('s.id IN (:favorites)')
                    ->setParameter('favorites', $favorites);
            } elseif (strtoupper($countryOrCategory) === Stream::HISTORY && $user !== null) {
                $qb->innerJoin('s.streamsHistory', 'sh')
                    ->andWhere('sh.user = :user')
                    ->setParameter('user', $user);
            }
            else {
                $qb->andWhere('s.countryCode = :country')
                    ->setParameter('country', strtoupper($countryOrCategory));
            }
        }

        if ((($countryOrCategory !== null && strtoupper($countryOrCategory) === Stream::HISTORY)
            || ($sort !== null && strtoupper($sort) === Stream::USER_LISTENED))
            && $user !== null) {
            if ($countryOrCategory === null || strtoupper($countryOrCategory) !== Stream::HISTORY) {
                $qb->innerJoin('s.streamsHistory', 'sh')
                    ->andWhere('sh.user = :user')
                    ->setParameter('user', $user);
            }

            $qb->groupBy('s.id, rs.url, r.codeName, rs.codeName, ss.codeName, ss.enabled, rs.currentSong, sh.lastListenedAt');

            switch ($sort) {
                case 'random':
                    $qb->addOrderBy('RANDOM()');
                    break;
                default:
                    $qb->addOrderBy('sh.lastListenedAt', 'DESC');
            }
        }
        else if ($sort !== null) {
            switch ($sort) {
                case 'name':
                    $qb->addOrderBy('s.name', 'ASC');
                    break;
                case 'popularity':
                    $qb->addOrderBy('s.score', 'DESC');
                    break;
                case 'random':
                    $qb->addOrderBy('RANDOM()');
                    break;
                case 'last':
                    $qb->addSelect('MAX(s.lastListeningAt) as last_listen')
                       //->distinct()
                       ->andWhere('s.lastListeningAt IS NOT NULL')
                       ->groupBy('s.id, r.codeName, ss.codeName, ss.enabled, rs.currentSong, rs.codeName, rs.url, s.lastListeningAt')
                       ->addOrderBy('MAX(s.lastListeningAt)', 'DESC');
                    break;
            }
        }

        $query = $qb->getQuery();

        if ($sort !== 'random' && $sort !== 'last'
            && $countryOrCategory !== null
            && strtoupper($countryOrCategory) !== Stream::HISTORY
            && strtoupper($countryOrCategory) !== Stream::FAVORITES) {
            $query->enableResultCache(self::CACHE_TTL);
        } else {
            $query->enableResultCache(self::CACHE_QUICK_TTL);
        }

        return $query->getResult();
    }

    public function searchStreams(
        string $text,
        ?int $limit,
        ?int $offset,
        ?string $countryOrCategory,
        ?string $sort,
        array $favoritesFromCookies = []
    ): array {
        $user = $this->security->getUser();

        $qb = $this->getEntityManager()->createQueryBuilder();

        $qb->select("s.id as code_name, s.name, s.img, COALESCE(rs.url, s.streamUrl) as stream_url, s.tags, s.countryCode as country_code, s.website, s.clicksLast24h as clicks_last_24h, s.score as score, 'stream' as type, COALESCE(r.codeName) as radio_code_name, s.forceHls as force_hls, s.forceMpd as force_mpd, s.popup as popup,"
            . 'COALESCE(CASE WHEN(BOOL_AND(rs.ownLogo) = TRUE) THEN rs.codeName ELSE :null END, r.codeName) as img_alt,'
            . 'CASE WHEN(ss.codeName IS NOT NULL and ss.enabled = TRUE) THEN TRUE ELSE rs.currentSong END as current_song,'
            . 'CASE WHEN(ss.codeName IS NOT NULL and ss.enabled = TRUE and s.streamSongCodeName IS NOT NULL) THEN CONCAT(ss.codeName, \'_\', s.streamSongCodeName) ELSE rs.codeName END as radio_stream_code_name')
            ->from(Stream::class, 's')
            ->leftJoin('s.radioStream', 'rs')
            ->leftJoin('rs.radio', 'r')
            ->leftJoin('s.streamSong', 'ss')
            ->where('s.enabled = true and s.banned = false and s.redirectToStream IS NULL')
            ->andWhere('(ILIKE(s.name, :text) = true or ILIKE(s.tags, :text) = true)')
            ->groupBy('s.id, rs.url, r.codeName, rs.codeName, ss.codeName, ss.enabled, rs.currentSong')
            //->orWhere('ILIKE(s.tags, :text) = true')
            ->setMaxResults($limit)
            ->setParameter('text', '%' . $text . '%')
            ->setParameter('null', null);

        if ($offset !== null) {
            $qb->setFirstResult($offset);
        }

        if ($countryOrCategory !== null) {
            if (strtoupper($countryOrCategory) === Stream::FAVORITES) {
                if ($user !== null) {
                    $favorites = $user->getFavoriteStreams()->map(
                        fn($stream) => $stream->getId()
                    )->toArray();
                } else {
                    $favorites = $favoritesFromCookies;
                }

                $qb->andWhere('s.id IN (:favorites)')
                    ->setParameter('favorites', $favorites);
            }
            elseif (strtoupper($countryOrCategory) === Stream::HISTORY && $user !== null) {
                $qb->innerJoin('s.streamsHistory', 'sh')
                    ->andWhere('sh.user = :user')
                    ->setParameter('user', $user);
            }
            else {
                $qb->andWhere('s.countryCode = :country')
                    ->setParameter('country', strtoupper($countryOrCategory));
            }
        }

        if ((strtoupper($countryOrCategory) === Stream::HISTORY || strtoupper($countryOrCategory) === Stream::USER_LISTENED)
            && $user !== null) {
            $qb->addGroupBy('sh.lastListenedAt');

            switch ($sort) {
                case 'random':
                    $qb->addOrderBy('RANDOM()');
                    break;
                default:
                    $qb->addOrderBy('sh.lastListenedAt', 'DESC');
            }
        }
        elseif ($sort !== null) {
            switch ($sort) {
                case 'name':
                    $qb->addOrderBy('s.name', 'ASC');
                    break;
                case 'popularity':
                    $qb->addOrderBy('s.score', 'DESC');
                    break;
                case 'random':
                    $qb->addOrderBy('RANDOM()');
                    break;
                case 'last':
                    $qb->addSelect('MAX(ls.dateTimeStart) as last_listen')
                        //->distinct()
                        ->leftJoin('s.listeningSessions', 'ls')
                        ->addOrderBy('MAX(ls.dateTimeStart)', 'DESC');
                    break;
            }
        }

        $query = $qb->getQuery();

        if ($sort !== 'random' && $sort !== 'last'
            && $countryOrCategory !== null
            && strtoupper($countryOrCategory) !== Stream::HISTORY
            && strtoupper($countryOrCategory) !== Stream::FAVORITES) {
            $query->enableResultCache(self::CACHE_TTL);
        }

        return $query->getResult();
    }

    public function getOneSpecificStream(
        string $id
    ): ?array {
        $qb = $this->getEntityManager()->createQueryBuilder();

        $qb->select("s.id as code_name, s.name, s.img, COALESCE(rs.url, s.streamUrl) as stream_url, s.tags, s.countryCode as country_code, s.website, s.clicksLast24h as clicks_last_24h, s.score as score, 'stream' as type, COALESCE(r.codeName) as radio_code_name, s.forceHls as force_hls, s.forceMpd as force_mpd, s.popup as popup,"
            . 'COALESCE(CASE WHEN(BOOL_AND(rs.ownLogo) = TRUE) THEN rs.codeName ELSE :null END, r.codeName) as img_alt,'
            . 'CASE WHEN(ss.codeName IS NOT NULL and ss.enabled = TRUE) THEN TRUE ELSE rs.currentSong END as current_song,'
            . 'CASE WHEN(ss.codeName IS NOT NULL and ss.enabled = TRUE and s.streamSongCodeName IS NOT NULL) THEN CONCAT(ss.codeName, \'_\', s.streamSongCodeName) ELSE rs.codeName END as radio_stream_code_name')
            ->from(Stream::class, 's')
            ->leftJoin('s.radioStream', 'rs')
            ->leftJoin('rs.radio', 'r')
            ->leftJoin('s.streamSong', 'ss')
            ->where('s.id = :id')
            ->andWhere('s.enabled = true and s.banned = false')
            ->groupBy('s.id, rs.url, r.codeName, rs.codeName, ss.codeName, ss.enabled, rs.currentSong')
            ->setMaxResults(1)
            ->setParameter('null', null);

        $qb->setParameter('id', $id);

        $query = $qb->getQuery();
        $query->enableResultCache(self::CACHE_TTL);

        return $query->getOneOrNullResult();
    }

    public function countStreams(
        ?string $countryOrCategory = null,
        ?string $language = null,
        array $favoritesFromCookies = []
    ): int {
        $user = $this->security->getUser();

        $qb = $this->getEntityManager()->createQueryBuilder();

        $qb->select('count(s.id)')
            ->from(Stream::class, 's')
            ->where('s.enabled = true and s.banned = false and s.redirectToStream IS NULL');

        if ($countryOrCategory !== null) {
            if (strtoupper($countryOrCategory) === Stream::FAVORITES) {
                if ($user !== null) {
                    $favorites = $user->getFavoriteStreams()->map(
                        fn($stream) => $stream->getId()
                    )->toArray();
                } else {
                    $favorites = $favoritesFromCookies;
                }

                $qb->andWhere('s.id IN (:favorites)')
                    ->setParameter('favorites', $favorites);
            }
            elseif (strtoupper($countryOrCategory) === Stream::HISTORY && $user !== null) {
                $qb->innerJoin('s.streamsHistory', 'sh')
                    ->andWhere('sh.user = :user')
                    ->setParameter('user', $user);
            }
            else {
                $qb->andWhere('s.countryCode = :country')
                    ->setParameter('country', strtoupper($countryOrCategory));
            }
        }

        if ($language !== null) {
            $qb->andWhere('s.language = :language')
                ->setParameter('language', $language);
        }

        $query = $qb->getQuery();
        if ($countryOrCategory !== null
            && strtoupper($countryOrCategory) !== Stream::HISTORY
            && strtoupper($countryOrCategory) !== Stream::FAVORITES) {
            $query->enableResultCache(self::CACHE_TTL);
        }

        return $query->getSingleScalarResult();
    }

    public function countSearchStreams(
        string $text,
        ?string $countryOrCategory = null,
        ?string $language = null,
        array $favoritesFromCookies = []
    ): int {
        $user = $this->security->getUser();

        $qb = $this->getEntityManager()->createQueryBuilder();

        $qb->select('count(s.id)')
            ->from(Stream::class, 's')
            ->where('s.enabled = true and s.banned = false')
            ->andWhere('(ILIKE(s.name, :text) = true or ILIKE(s.tags, :text) = true)')
            ->setParameter('text', '%' . $text . '%');

        if ($countryOrCategory !== null) {
            if (strtoupper($countryOrCategory) === Stream::FAVORITES) {
                if ($user !== null) {
                    $favorites = $user->getFavoriteStreams()->map(
                        fn($stream) => $stream->getId()
                    )->toArray();
                } else {
                    $favorites = $favoritesFromCookies;
                }

                $qb->andWhere('s.id IN (:favorites)')
                    ->setParameter('favorites', $favorites);
            }
            elseif (strtoupper($countryOrCategory) === Stream::HISTORY && $user !== null) {
                $qb->innerJoin('s.streamsHistory', 'sh')
                    ->andWhere('sh.user = :user')
                    ->setParameter('user', $user);
            }
            else {
                $qb->andWhere('s.countryCode = :country')
                    ->setParameter('country', strtoupper($countryOrCategory));
            }
        }

        if ($language !== null) {
            $qb->andWhere('s.language = :language')
                ->setParameter('language', $language);
        }

        $query = $qb->getQuery();

        if ($countryOrCategory !== null
            && strtoupper($countryOrCategory) !== Stream::HISTORY
            && strtoupper($countryOrCategory) !== Stream::FAVORITES) {
            $query->enableResultCache(self::CACHE_TTL);
        }

        return $query->getSingleScalarResult();
    }

    public function getCountryCodes(): array
    {
        $qb = $this->getEntityManager()->createQueryBuilder();

        $qb->select('DISTINCT UPPER(s.countryCode) as countryCode')
            ->from(Stream::class, 's')
            ->where('s.countryCode IS NOT NULL')
            ->andWhere('s.enabled = true and s.banned = false and s.redirectToStream IS NULL')
            ->andWhere('s.countryCode <> \'\'')
            ->orderBy('countryCode', 'ASC');

        $query = $qb->getQuery();
        $query->enableResultCache(self::CACHE_TTL);

        return $query->getResult();
    }

    public function getBestStreamForRadio(Radio $radio): ?Stream
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
            ->andWhere('s.enabled = true and s.banned = false and s.redirectToStream IS NULL')
            ->orderBy('s.score', 'DESC')
            ->setFirstResult(0)
            ->setMaxResults(1)
            ->setParameter('id', $radioStream->getId());

        $query = $qb->getQuery();
        $query->enableResultCache(self::CACHE_TTL);

        return $query->getOneOrNullResult();
    }

    public function insertOrUpdateStreamListening(User $user, Stream $stream)
    {
        $dateTime = new \DateTime('now', new \DateTimeZone('UTC'));

        $sql = <<<EOD
            INSERT INTO users_streams_history (user_id, stream_id, last_listened_at)
            VALUES
            (?, ?, ?)
            ON CONFLICT (user_id, stream_id)
            DO 
                UPDATE SET last_listened_at = ?;
        EOD;

        $rsm = new ResultSetMapping();
        $query = $this->getEntityManager()->createNativeQuery($sql, $rsm);
        $query->setParameters([
            $user->getId(),
            $stream->getId(),
            $dateTime->format(\DateTime::ATOM),
            $dateTime->format(\DateTime::ATOM)
        ]);

        $query->getResult();
    }

    public function insertNewStream(Stream $stream)
    {
        $sql = <<<EOD
            INSERT INTO stream (id, name, original_img, country_code, language, website, stream_url, user_id, source, created_at, updated_at,description,slogan,tags)
            VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?);
        EOD;

        $rsm = new ResultSetMapping();
        $query = $this->getEntityManager()->createNativeQuery($sql, $rsm);
        $query->setParameters([
            $stream->getId(),
            $stream->getName(),
            $stream->getOriginalImg(),
            $stream->getCountryCode(),
            $stream->getLanguage(),
            $stream->getWebsite(),
            $stream->getStreamUrl(),
            $stream->getUser()->getId(),
            $stream->getSource(),
            new \DateTime(),
            new \DateTime(),
            $stream->getDescription(),
            $stream->getSlogan(),
            $stream->getTags()
        ]);

        return $query->getResult();
    }

    public function getStreamCheckListPagination(int $page, int $perPage): PaginationInterface
    {
        $qb = $this->createQueryBuilder('s');
        $qb->select('s.id, s.enabled, s.name, s.streamUrl, s.forceHls, s.forceMpd, s.website, s.countryCode, sc.checkedAt, sc.img as check_img, sc.streamUrl as check_stream, sc.website as check_website, sc.websiteSsl as check_ssl')
           ->where('sc.img = false or sc.website = false or sc.websiteSsl = false')
           ->join('s.streamCheck', 'sc')
           ->orderBy('s.clicksLast24h', 'desc');

        return $this->paginator->paginate(
            $qb->getQuery(),
            $page,
            $perPage
        );
    }

    public function findOneBySlug(string $slug): ?Stream
    {
        $slugCleanedUp = '%' . str_replace('-', '%', $slug) . '%';

        $qb = $this->getEntityManager()->createQueryBuilder();

        $qb->select('s')
            ->from(Stream::class, 's')
            ->where('s.enabled = true AND ILIKE(s.name, :name) = true')
            ->setParameter('name', $slugCleanedUp);

        $query = $qb->getQuery();
        $query->enableResultCache(self::CACHE_TTL);

        return $query->getOneOrNullResult();
    }
}
