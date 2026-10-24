<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Radio;
use App\Entity\Stream;
use App\Entity\StreamCheck;
use App\Entity\StreamOverloading;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Query\Expr\Join;
use Doctrine\ORM\Query\Parameter;
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

    protected const int GENRES_MIN_STREAMS = 10;

    protected const int CACHE_RADIOS_TTL = 604800; // week
    protected const string CACHE_RADIOS_ID = 'enabled_radios_streams';

    public function __construct(private readonly Security $security, protected PaginatorInterface $paginator, ManagerRegistry $registry, )
    {
        parent::__construct($registry, Stream::class);
    }

    public function getStreamsWithPlayingError(int $threshold, ?int $ceiling, ?string $countryCode)
    {
        $qb = $this->getEntityManager()->createQueryBuilder();

        $qb->select('s.id, s.name, s.playingError, s.streamUrl, s.countryCode, s.popup, s.playingErrorReason, s.forceHls, s.forceMpd, s.forceProxy, so.updatedAt, s.lastOverloadingOpen, s.checked')
            ->from(Stream::class, 's')
            ->leftJoin(StreamOverloading::class, 'so', Join::WITH, 'so.stream = s')
            ->where('s.playingError >= :threshold and s.enabled = true')
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
        $excludedIds = array_column($resultCountry, 'id');

        // last country

        // the excluded ids are filtered here instead of in the query: they are different on each stream page,
        // so the query would be different too and its result cache would never be hit.
        // Fixed row count for the same reason, enough to still have $limitFourth rows once the excluded ones are removed
        // (at most $limitFourth * 2 + 1 excluded)
        $lastRowCount = $limitFourth * 4;

        $resultCountryLast = $this->getStreams($lastRowCount, 0, $stream->getCountryCode(), 'last');
        $resultCountryLast = $this->excludeStreams($resultCountryLast, $excludedIds, $limitFourth);
        $excludedIds = array_merge($excludedIds, array_column($resultCountryLast, 'id'));

        // last all

        $resultLast = $this->getStreams($lastRowCount, 0, null, 'last');
        $resultLast = $this->excludeStreams($resultLast, $excludedIds, $limitFourth);

        // random (one more row as the current stream is removed afterwards, same cache reason)

        $qbRandom = $this->getMoreStreamQuery($limitFourth + 1);
        $resultRandom = $qbRandom->getQuery()->enableResultCache(self::CACHE_QUICK_TTL)->getResult();
        $resultRandom = $this->excludeStreams($resultRandom, [$stream->getId()], $limitFourth, 'code_name');

        return array_merge($resultCountry, $resultCountryLast, $resultLast, $resultRandom);
    }

    protected function excludeStreams(array $streams, array $excludedIds, int $limit, string $idKey = 'id'): array
    {
        $excludedIds = array_map(fn($id) => (string) $id, $excludedIds);

        $streams = array_filter($streams, fn($stream) => !in_array((string) $stream[$idKey], $excludedIds, true));

        return array_slice(array_values($streams), 0, $limit);
    }

    protected function getMoreStreamQuery(int $limit) {
        $qb = $this->getEntityManager()->createQueryBuilder();

        $qb->select('s.id as code_name, s.name as name, s.img, COALESCE(CASE WHEN(BOOL_AND(s.ownLogo) = TRUE) THEN s.radioStreamCodeName ELSE :null END, r.codeName) as img_alt, s.internalUseImg as internal_use_img, s.website')
            ->from(Stream::class, 's')
            ->leftJoin('s.radio', 'r')
            ->where("s.img is not null")
            ->andWhere("RANDOM() < 0.01")
            ->andWhere('s.enabled = true and s.banned = false and s.closed = false and s.redirectToStream IS NULL')
            ->groupBy('s.id, r.codeName, s.radioStreamCodeName')
            ->setMaxResults($limit)
            ->setParameter('null', null);

        return $qb;
    }

    public function getStreams(
        ?int $limit = null,
        ?int $offset = null,
        ?string $countryOrCategory = null,
        ?string $sort = null,
        array $favoritesFromCookies = [],
        ?array $excludedIds = null
    ): array {
        $user = $this->security->getUser();
        $qb = $this->getEntityManager()->createQueryBuilder();

        $qb->select("s.id as id, s.id as code_name, s.name, s.img, s.streamUrl as stream_url, s.tags, s.genres, s.language, s.countryCode as country_code, s.website, s.score as score, 'stream' as type, COALESCE(r.codeName) as radio_code_name, s.forceHls as force_hls, s.forceMpd as force_mpd, s.forceProxy as force_proxy, s.popup as popup,s.playingError as playing_error,"
            . 'COALESCE(CASE WHEN(s.ownLogo = TRUE) THEN s.radioStreamCodeName ELSE :null END, r.codeName) as img_alt, s.internalUseImg as internal_use_img,'
            . 'CASE WHEN(s.streamData IS NOT NULL) THEN TRUE ELSE FALSE END as is_stream_url_generated,'
            . 'CASE WHEN(ss.codeName IS NOT NULL and ss.enabled = TRUE) THEN TRUE ELSE FALSE END as current_song,'
            . 'CASE WHEN(ss.codeName IS NOT NULL and ss.enabled = TRUE and COALESCE(s.streamSongCodeName, s.streamUrl) IS NOT NULL) THEN CONCAT(ss.codeName, \'_\', COALESCE(s.streamSongCodeName, s.streamUrl)) ELSE s.radioStreamCodeName END as radio_stream_code_name')
            ->from(Stream::class, 's')
            ->leftJoin('s.radio', 'r')
            ->leftJoin('s.streamSong', 'ss')
            ->where('s.enabled = true and s.banned = false and s.closed = false and s.redirectToStream IS NULL')
            ->setMaxResults($limit)
            // needed as using NULL directly was not working, neither were hacks like NULLIF(1,1) or omitting the ELSE
            ->setParameter('null', null);

        if ($offset !== null) {
            $qb->setFirstResult($offset);
        }

        if (!empty($excludedIds)) {
            $qb->andWhere('s.id NOT IN (:excludedIds)')
                ->setParameter('excludedIds', array_map(
                    fn($id) => $id instanceof Uuid ? $id->toRfc4122() : (string) $id,
                    $excludedIds
                ));
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
                    // id as tie-breaker: many streams share a score, without it the paging can repeat or skip some
                    $qb->addOrderBy('s.score', 'DESC')
                       ->addOrderBy('s.id', 'ASC');
                    break;
                case 'random':
                    $qb->addOrderBy('RANDOM()');
                    break;
                case 'last':
                    $qb->addSelect('s.lastListeningAt as last_listen')
                       ->andWhere('s.lastListeningAt IS NOT NULL')
                       ->addOrderBy('s.lastListeningAt', 'DESC');
                    break;
            }
        }

        $query = $qb->getQuery();

        if ($sort !== 'random' && $sort !== 'last'
            && $countryOrCategory !== null
            && strtoupper($countryOrCategory) !== Stream::HISTORY
            && strtoupper($countryOrCategory) !== Stream::FAVORITES) {
            $query->enableResultCache(self::CACHE_TTL);
        } elseif ($sort !== 'random') {
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

        $qb->select("s.id as id, s.id as code_name, s.name, s.img, s.streamUrl as stream_url, s.tags, s.genres, s.language, s.countryCode as country_code, s.website, s.score as score, 'stream' as type, COALESCE(r.codeName) as radio_code_name, s.forceHls as force_hls, s.forceMpd as force_mpd, s.forceProxy as force_proxy, s.popup as popup,"
            . 'COALESCE(CASE WHEN(BOOL_AND(s.ownLogo) = TRUE) THEN s.radioStreamCodeName ELSE :null END, r.codeName) as img_alt, s.internalUseImg as internal_use_img,'
            . 'CASE WHEN(s.streamData IS NOT NULL) THEN TRUE ELSE FALSE END as is_stream_url_generated,'
            . 'CASE WHEN(ss.codeName IS NOT NULL and ss.enabled = TRUE) THEN TRUE ELSE FALSE END as current_song,'
            . 'CASE WHEN(ss.codeName IS NOT NULL and ss.enabled = TRUE and COALESCE(s.streamSongCodeName, s.streamUrl) IS NOT NULL) THEN CONCAT(ss.codeName, \'_\', COALESCE(s.streamSongCodeName, s.streamUrl)) ELSE s.radioStreamCodeName END as radio_stream_code_name')
            ->from(Stream::class, 's')
            ->leftJoin('s.radio', 'r')
            ->leftJoin('s.streamSong', 'ss')
            ->where('s.enabled = true and s.banned = false and s.closed = false and s.redirectToStream IS NULL')
            ->andWhere('(ILIKE(s.name, :text) = true or ILIKE(s.tags, :text) = true or ILIKE(s.genres, :text) = true)')
            ->groupBy('s.id, s.streamUrl, r.codeName, s.radioStreamCodeName, ss.codeName, ss.enabled')
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

        if (is_string($countryOrCategory) && (strtoupper($countryOrCategory) === Stream::HISTORY || strtoupper($countryOrCategory) === Stream::USER_LISTENED)
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
                    // id as tie-breaker: many streams share a score, without it the paging can repeat or skip some
                    $qb->addOrderBy('s.score', 'DESC')
                       ->addOrderBy('s.id', 'ASC');
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

        $qb->select("s.id as id, s.id as code_name, s.name, s.img, s.streamUrl as stream_url, s.tags, s.genres, s.language, s.countryCode as country_code, s.website, s.score as score, 'stream' as type, COALESCE(r.codeName) as radio_code_name, s.forceHls as force_hls, s.forceMpd as force_mpd, s.forceProxy as force_proxy, s.popup as popup,"
            . 'COALESCE(CASE WHEN(BOOL_AND(s.ownLogo) = TRUE) THEN s.radioStreamCodeName ELSE :null END, r.codeName) as img_alt, s.internalUseImg as internal_use_img,'
            . 'CASE WHEN(s.streamData IS NOT NULL) THEN TRUE ELSE FALSE END as is_stream_url_generated,'
            . 'CASE WHEN(ss.codeName IS NOT NULL and ss.enabled = TRUE) THEN TRUE ELSE FALSE END as current_song,'
            . 'CASE WHEN(ss.codeName IS NOT NULL and ss.enabled = TRUE and COALESCE(s.streamSongCodeName, s.streamUrl) IS NOT NULL) THEN CONCAT(ss.codeName, \'_\', COALESCE(s.streamSongCodeName, s.streamUrl)) ELSE s.radioStreamCodeName END as radio_stream_code_name')
            ->from(Stream::class, 's')
            ->leftJoin('s.radio', 'r')
            ->leftJoin('s.streamSong', 'ss')
            ->where('s.id = :id')
            ->andWhere('s.enabled = true and s.banned = false and s.closed = false')
            ->groupBy('s.id, s.streamUrl, r.codeName, s.radioStreamCodeName, ss.codeName, ss.enabled')
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
            ->where('s.enabled = true and s.banned = false and s.closed = false and s.redirectToStream IS NULL');

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
            ->where('s.enabled = true and s.banned = false and s.closed = false')
            ->andWhere('(ILIKE(s.name, :text) = true or ILIKE(s.tags, :text) = true or ILIKE(s.genres, :text) = true)')
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
            ->andWhere('s.enabled = true and s.banned = false and s.closed = false and s.redirectToStream IS NULL')
            ->andWhere('s.countryCode <> \'\'')
            ->orderBy('countryCode', 'ASC');

        $query = $qb->getQuery();
        $query->enableResultCache(self::CACHE_TTL);

        return $query->getResult();
    }

    public function getBestStreamForRadio(Radio $radio, array $subRadioSelection): ?Stream
    {
        $stream = null;

        // check first if user has selected a specific subradio
        if (array_key_exists($radio->getCodeName(), $subRadioSelection)) {
            $qb = $this->getEntityManager()->createQueryBuilder();

            $qb->select('s')
                ->from(Stream::class, 's')
                ->innerJoin('s.radio', 'r')
                ->where('r.id = :radioId')
                ->andWhere('s.enabled = true and s.banned = false and s.closed = false and s.redirectToStream IS NULL and s.radioStreamCodeName = :radioStreamCodeName')
                ->setFirstResult(0)
                ->setMaxResults(1)
                ->setParameter('radioId', $radio->getId())
                ->setParameter('radioStreamCodeName', $subRadioSelection[$radio->getCodeName()]);

            $query = $qb->getQuery();
            $query->enableResultCache(self::CACHE_TTL);

            $stream = $query->getOneOrNullResult();
        }

        if (!$stream) {
            $qb = $this->getEntityManager()->createQueryBuilder();

            $qb->select('s')
                ->from(Stream::class, 's')
                ->innerJoin('s.radio', 'r')
                ->where('r.id = :radioId')
                ->andWhere('s.enabled = true and s.banned = false and s.closed = false and s.redirectToStream IS NULL and s.isMainRadio = TRUE')
                ->setFirstResult(0)
                ->setMaxResults(1)
                ->setParameter('radioId', $radio->getId());

            $query = $qb->getQuery();
            $query->enableResultCache(self::CACHE_TTL);

            $stream = $query->getOneOrNullResult();
        }

        return $stream;
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
        $qb->select('s.id, s.enabled, s.name, s.streamUrl, s.forceHls, s.forceMpd, s.forceProxy, s.website, s.countryCode, sc.checkedAt, sc.img as check_img, sc.streamUrl as check_stream, sc.website as check_website, sc.websiteSsl as check_ssl')
           ->where('sc.img = false or sc.website = false or sc.websiteSsl = false')
           ->join(StreamCheck::class, 'sc', Join::WITH, 'sc.stream = s')
           ->orderBy('s.score', 'desc');

        return $this->paginator->paginate(
            $qb->getQuery(),
            $page,
            $perPage
        );
    }

    public function findOneBySlug(string $slug): ?Stream
    {
        try {
            $slugCleanedUp = '%' . str_replace('-', '%', $slug) . '%';

            $qb = $this->getEntityManager()->createQueryBuilder();

            $qb->select('s')
                ->from(Stream::class, 's')
                ->where('s.enabled = true and s.redirectToStream is null and s.banned = false and s.closed = false AND ILIKE(s.name, :name) = true')
                ->setParameter('name', $slugCleanedUp);

            $query = $qb->getQuery();
            $query->enableResultCache(self::CACHE_TTL);

            return $query->getOneOrNullResult();
        } catch (\Exception $e) {
            $qb = $this->getEntityManager()->createQueryBuilder();

            $qb->select('s')
                ->from(Stream::class, 's')
                ->where('ILIKE(s.name, :name) = true')
                ->setParameter('name', $slugCleanedUp);

            $query = $qb->getQuery();
            $query->enableResultCache(self::CACHE_TTL);

            return $query->getOneOrNullResult();
        }
    }

    public function getGenres(): array
    {
        $rsm = new ResultSetMapping();
        $rsm->addScalarResult('genre', 'genre');

        $query = $this->getEntityManager()->createNativeQuery(
            'SELECT genre
             FROM stream s, unnest(string_to_array(s.genres, \',\')) AS genre
             WHERE s.genres IS NOT NULL
             AND s.enabled = true AND s.banned = false AND s.closed = false AND s.redirect_to IS NULL
             GROUP BY genre
             HAVING COUNT(*) >= :min_streams
             ORDER BY genre ASC',
            $rsm
        );

        $query->setParameter('min_streams', self::GENRES_MIN_STREAMS);

        $query->enableResultCache(self::CACHE_TTL);

        return $query->getSingleColumnResult();
    }
}
