<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Affiliate;
use App\Entity\Stream;
use App\Entity\UserSong;
use App\Service\Host;
use App\Service\ScheduleManager;
use App\Entity\Radio;
use App\Entity\SubRadio;
use App\Entity\Category;
use App\Entity\Collection;
use App\Entity\ScheduleEntry;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Intl\Countries;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\String\Slugger\AsciiSlugger;
use Keiko\Uuid\Shortener\Dictionary;
use Keiko\Uuid\Shortener\Shortener;

class DefaultController extends AbstractBaseController
{
    protected const MIN_DATE = '2017-08-19';

    // LEGACY
    #[Route('/schedule/{date}', name: 'schedule')]
    public function schedule(\DateTime $date, ScheduleManager $scheduleManager, Request $request): Response
    {
        $collection = $request->query->get('collection');

        if ($radio = $request->query->get('radio')) {
            $schedule = $scheduleManager->getDayScheduleOfRadio($date, $radio);
        } elseif ($collection !== null) {
            $schedule = $scheduleManager->getDayScheduleOfCollection($date, $collection);
        } else {
            $schedule = $scheduleManager->getDayScheduleOfDate($date);
        }

        return $this->jsonResponse([
            'schedule' => $schedule
        ]);
    }

    // LEGACY
    #[Route('/radios', name: 'api_radios')]
    public function radios(EntityManagerInterface $em, Request $request): Response
    {
        $favorites = $request->attributes->get('favorites', []);
        $radios = $em->getRepository(Radio::class)->getActiveRadios();
        $categories = $em->getRepository(Category::class)->getCategories();
        $collections = $em->getRepository(Collection::class)->getCollections($favorites);

        return $this->jsonResponse([
            'radios' => $radios,
            'categories' => $categories,
            'collections' => $collections
        ]);
    }

    /**
     * @throws \Exception
     */
    #[
        Route(
            path: [
                'en' => '/{_locale}/schedule-streaming-{codeName}-{subRadioCodeName}/{date?}',
                'fr' => '/{_locale}/grille-ecouter-{codeName}-{subRadioCodeName}/{date?}',
                'es' => '/{_locale}/escuchar-{codeName}-{subRadioCodeName}/{date?}',
                'de' => '/{_locale}/zuhören-{codeName}-{subRadioCodeName}/{date?}',
                'pt' => '/{_locale}/ouvir-{codeName}-{subRadioCodeName}/{date?}',
                'it' => '/{_locale}/ascolti-{codeName}-{subRadioCodeName}/{date?}',
                'pl' => '/{_locale}/streaming-{codeName}-{subRadioCodeName}/{date?}',
                'el' => '/{_locale}/streaming-{codeName}-{subRadioCodeName}/{date?}',
                'ar' => '/{_locale}/البث-{codeName}-{subRadioCodeName}/{date?}'
            ],
            name: 'radio_subradio',
            defaults: [
                'priority' => '0.8',
                'changefreq' => 'daily'
            ]
        )
    ]
    public function radioSubRadio(string $codeName, string $subRadioCodeName, EntityManagerInterface $em, ScheduleManager $scheduleManager, \DateTime $date=null): Response
    {
        if ($date === null) {
            $date = new \DateTime();
        }

        /** @var Radio $radio */
        $radio = $em->getRepository(Radio::class)->findOneBy(['codeName' => $codeName, 'active' => true]);
        if (!$radio) {
            throw new NotFoundHttpException('Radio not found');
        }

        /** @var SubRadio $subRadio */
        $subRadio = $em->getRepository(SubRadio::class)->findOneBy(['codeName' => $subRadioCodeName, 'enabled' => true]);
        if (!$subRadio) {
            throw new NotFoundHttpException('Radio not found');
        }

        $moreRadios = $em->getRepository(Radio::class)->getMoreRadiosFrom($radio);
        $moreRadios2 = $em->getRepository(Radio::class)->getMoreRadiosFrom($radio, true);

        $schedule = $scheduleManager->getDayScheduleOfRadio($date, $codeName, $subRadio);
        $scheduleRadio = [];

        if (isset($schedule[$codeName])) {
            $scheduleRadio = $schedule[$codeName];
        }

        // not ideal as we do the full sql queries, but at least it will put it in cache,
        // and it should be low traffic as it's mostly done for SEO

        $prevDate = clone $date;
        $prevDate->modify("-1 day");
        $nextDate = clone $date;
        $nextDate->modify("+1 day");

        // data start at this date
        if ($date->format('Y-m-d') === self::MIN_DATE) {
            $prevSchedule = null;
        } else {
            $prevSchedule = $scheduleManager->getDayScheduleOfRadio($prevDate, $codeName);
        }

        // don't go after tomorrow, we don't have the data
        $tomorrow = new \DateTime('tomorrow');
        if ($date->format('Y-m-d') === $tomorrow->format('Y-m-d')) {
            $nextSchedule = null;
        } else {
            $nextSchedule = $scheduleManager->getDayScheduleOfRadio($nextDate, $codeName);
        }

        return $this->render('default/radio.html.twig', [
            'schedule' => $scheduleRadio,
            'radio' => $radio,
            'sub_radio' => $subRadio,
            'date' => $date,
            'prev_date' => $prevDate,
            'next_date' => $nextDate,
            'has_prev' => $prevSchedule !== null,
            'has_next' => $nextSchedule !== null,
            'more_radios' => $moreRadios,
            'more_radios2' => $moreRadios2
        ]);
    }

    /**
     * @throws \Exception
     */
    #[
        Route(
            path: [
                'en' => '/{_locale}/schedule-streaming-{codeName}/{date?}',
                'fr' => '/{_locale}/grille-ecouter-{codeName}/{date?}',
                'es' => '/{_locale}/escuchar-{codeName}/{date?}',
                'de' => '/{_locale}/zuhören-{codeName}/{date?}',
                'pt' => '/{_locale}/ouvir-{codeName}/{date?}',
                'it' => '/{_locale}/ascolti-{codeName}/{date?}',
                'pl' => '/{_locale}/streaming-{codeName}/{date?}',
                'el' => '/{_locale}/streaming-{codeName}/{date?}',
                'ar' => '/{_locale}/البث-{codeName}/{date?}'
            ],
            name: 'radio',
            defaults: [
                'priority' => '0.8',
                'changefreq' => 'daily'
            ]
        )
    ]
    public function radio(string $codeName, EntityManagerInterface $em, ScheduleManager $scheduleManager, \DateTime $date=null): Response
    {
        /** @var Radio $radio */
        $radio = $em->getRepository(Radio::class)->findOneBy(['codeName' => $codeName, 'active' => true]);
        if (!$radio) {
            throw new NotFoundHttpException('Radio not found');
        }

        /** @var SubRadio $subRadio */
        $subRadio = $em->getRepository(SubRadio::class)->findOneBy(['radio' => $radio, 'main' => true, 'enabled' => true]);
        if (!$subRadio) {
            throw new NotFoundHttpException('Radio not found');
        }

        // We don't do a redirect to keep the url clean without the default subradio.
        return $this->radioSubRadio($codeName, $subRadio->getCodeName(), $em, $scheduleManager, $date);
    }

    #[
        Route(
            path: [
                'en' => '/{_locale}/stream-{shortId}/listen-{codename}',
                'fr' => '/{_locale}/stream-{shortId}/ecouter-{codename}',
                'es' => '/{_locale}/stream-{shortId}/escuchar-{codename}',
                'de' => '/{_locale}/stream-{shortId}/zuhören-{codename}',
                'pt' => '/{_locale}/stream-{shortId}/ouvir-{codename}',
                'it' => '/{_locale}/stream-{shortId}/ascolti-{codename}',
                'pl' => '/{_locale}/stream-{shortId}/słuchaj-{codename}',
                'el' => '/{_locale}/stream-{shortId}/ακούω-{codename}',
                'ar' => '/{_locale}/stream-{shortId}/استمع-{codename}'
            ],
            name: 'streams_one_short',
            defaults: [
                'priority' => '0.7',
                'changefreq' => 'monthly'
            ]
        )
    ]
    public function oneShort(string $shortId, string $codename, RouterInterface $router, Host $host, EntityManagerInterface $em, Request $request): Response
    {
        // !!! NOTE !!! could not find in the doc how to do a custom ParamConverter in Symfony 6.3 like with ExtraBundle before
        // So we do it manually here, oh well...

        $shortener = Shortener::make(
            Dictionary::createUnmistakable()
        );

        $uuid = $shortener->expand($shortId);

        $stream = $em->getRepository(Stream::class)->find($uuid);

        if (!$stream) {
            throw new NotFoundHttpException('Radio not found');
        }

        // redirect non-fr stream seo pages to new host
        if ($host->isProgRadio($request) === true && $request->getLocale() !== 'fr') {
            $router->getContext()->setHost('www.' . Host::DATA['radioaddict']['domain'][0]);
            $redirectUrl = $router->generate('streams_one_short', [
                '_locale' => $request->getLocale(),
                'shortId' => $shortener->reduce($stream->getId()),
                'codename' => $codename
            ], UrlGeneratorInterface::ABSOLUTE_URL);

            return $this->redirect($redirectUrl, 301);
        }

        if ($stream->getRedirectToStream() !== null) {
            $slugger = new AsciiSlugger();

            $shortId = $shortener->reduce($stream->getRedirectToStream()->getId());

            $redirectUrl = $router->generate('streams_one_short', [
                '_locale' => $request->getLocale(),
                'shortId' => $shortId,
                'codename' => $slugger->slug($stream->getRedirectToStream()->getName())
            ], UrlGeneratorInterface::ABSOLUTE_URL);

            return $this->redirect($redirectUrl, 301);
        }

        $moreStreams = $em->getRepository(Stream::class)->getMoreStreams($stream);

        return $this->render('default/stream.html.twig', [
            'stream' => $stream,
            'more_streams' => $moreStreams
        ]);
    }

    #[
        Route(
            path: [
                'en' => '/{_locale}/stream/{id}/listen-{codename}',
                'fr' => '/{_locale}/stream/{id}/ecouter-{codename}',
                'es' => '/{_locale}/stream/{id}/escuchar-{codename}',
                'de' => '/{_locale}/stream/{id}/zuhören-{codename}',
                'pt' => '/{_locale}/stream/{id}/ouvir-{codename}',
                'it' => '/{_locale}/stream/{id}/ascolti-{codename}',
                'pl' => '/{_locale}/stream/{id}/słuchaj-{codename}',
                'el' => '/{_locale}/stream/{id}/ακούω-{codename}',
                'ar' => '/{_locale}/stream/{id}/استمع-{codename}'
            ],
            name: 'streams_one',
            defaults: [
                'priority' => '0.6',
                'changefreq' => 'monthly'
            ]
        )
    ]
    public function one(Stream $stream, string $codename, RouterInterface $router, Host $host, Request $request): Response
    {
        $shortener = Shortener::make(
            Dictionary::createUnmistakable() // or pass your own characters set
        );

        // redirect non-fr stream seo pages to new host
        if ($host->isProgRadio($request) === true && $request->getLocale() !== 'fr') {
            $router->getContext()->setHost('www.' . Host::DATA['radioaddict']['domain'][0]);
            $redirectUrl = $router->generate('streams_one_short', [
                '_locale' => $request->getLocale(),
                'shortId' => $shortener->reduce($stream->getId()),
                'codename' => $codename
            ], UrlGeneratorInterface::ABSOLUTE_URL);

            return $this->redirect($redirectUrl, 301);
        }

        $slugger = new AsciiSlugger();

        $name = $stream->getRedirectToStream() !== null ? $stream->getRedirectToStream()->getName() : $stream->getName();
        $shortId = $stream->getRedirectToStream() !== null ? $stream->getRedirectToStream()->getId() : $stream->getId();

        $redirectUrl = $router->generate('streams_one_short', [
            '_locale' => $request->getLocale(),
            'shortId' =>  $shortener->reduce($shortId),
            'codename' => $slugger->slug($name)
        ], UrlGeneratorInterface::ABSOLUTE_URL);

        return $this->redirect($redirectUrl, 301);
    }

    #[Route('/{_locale}/top/{countryCode}',
            name: 'streams_top',
            defaults: [
                'priority' => '0.5',
                'changefreq' => 'weekly'
            ],
            requirements: ['_locale' => 'en|fr|es|de|pt|it|pl|el|ar']
        )
    ]
    public function top(string $countryCode, Host $host, RouterInterface $router, EntityManagerInterface $em, Request $request): Response
    {
        // redirect non-fr stream seo pages to new host
        if ($host->isProgRadio($request) === true && $request->getLocale() !== 'fr') {
            $router->getContext()->setHost('www.' . Host::DATA['radioaddict']['domain'][0]);
            $redirectUrl = $router->generate('streams_top', [
                '_locale' => $request->getLocale(),
                'countryCode' => $countryCode
            ], UrlGeneratorInterface::ABSOLUTE_URL);

            return $this->redirect($redirectUrl, 301);
        }

        $howMany = StreamsController::DEFAULT_RESULTS;
        $offset = 0;

        $streams = $em->getRepository(Stream::class)->getStreams($howMany, $offset, $countryCode, 'popularity');
        $totalCount = $em->getRepository(Stream::class)->countStreams($countryCode);

        return $this->render('default/top.html.twig', [
            'streams' => $streams,
            'total'   => $totalCount,
            'country' => $countryCode !== null ? Countries::getName(strtoupper($countryCode), $request->getLocale()) : null,
            'country_code' => $countryCode
        ]);
    }

    #[Route('/{_locale}/last/{countryCode}',
        name: 'streams_last',
        defaults: [
            'priority' => '0.5',
            'changefreq' => 'weekly'
        ],
        requirements: ['_locale' => 'en|fr|es|de|pt|it|pl|el|ar']
    )
    ]
    public function last(string $countryCode, Host $host, RouterInterface $router, EntityManagerInterface $em, Request $request): Response
    {
        // redirect non-fr stream seo pages to new host
        if ($host->isProgRadio($request) === true && $request->getLocale() !== 'fr') {
            $router->getContext()->setHost('www.' . Host::DATA['radioaddict']['domain'][0]);
            $redirectUrl = $router->generate('streams_last', [
                '_locale' => $request->getLocale(),
                'countryCode' => $countryCode
            ], UrlGeneratorInterface::ABSOLUTE_URL);

            return $this->redirect($redirectUrl, 301);
        }

        $howMany = StreamsController::DEFAULT_RESULTS;
        $offset = 0;

        $streams = $em->getRepository(Stream::class)->getStreams($howMany, $offset, $countryCode, 'last');
        $totalCount = $em->getRepository(Stream::class)->countStreams($countryCode);

        return $this->render('default/last.html.twig', [
            'streams' => $streams,
            'total'   => $totalCount,
            'country' => $countryCode !== null ? Countries::getName(strtoupper($countryCode), $request->getLocale()) : null,
            'country_code' => $countryCode
        ]);
    }

    #[Route('/user', name: 'user_config')]
    public function user(Request $request, AuthorizationCheckerInterface $authChecker): Response
    {
        /** @var User $user */
        $user = $this->getUser();

        if ($user !== null) {
            $favorites = $user->getFavoriteRadios()->map(
                fn($radio) => $radio->getCodeName()
            )->toArray();

            $favoritesStream = $user->getFavoriteStreams()->map(
                fn($stream) => $stream->getId()
            )->toArray();

            $songs = $user->getUserSongsAsArray();
        } else {
            $songs = [];
            $favorites = $request->attributes->get('favorites', []);
            $favoritesStream = $request->attributes->get('favoritesStream', []);
        }

        return $this->jsonResponse([
            'user' => [
                'favoritesRadio' => $favorites,
                'favoritesStream' => $favoritesStream,
                'songs' => $songs,
                'logged' => $user !== null,
                'isAdmin' => $user !== null && $authChecker->isGranted('ROLE_ADMIN')
            ]
        ]);
    }

    #[Route('/radios/favorite/{codeName}', name: 'favorite_toggle')]
    #[IsGranted('ROLE_USER')]
    public function toggleFavorite(Radio $radio, EntityManagerInterface $em): Response
    {
        /** @var User $user */
        $user = $this->getUser();

        // Note: we link this radio to a stream when applicable

        if ($user->getFavoriteRadios()->contains($radio)) {
            $user->removeFavoriteRadio($radio);

            $radioStream = $radio->getMainStream();

            if ($radioStream !== null) {
                foreach ($radioStream->getStreams() as $stream) {
                    $user->removeFavoriteStream($stream);
                }
            }
        } else {
            $user->addFavoriteRadio($radio);

            $stream =  $em->getRepository(Stream::class)->getBestStreamForRadio($radio);

            if ($stream !== null) {
                $user->addFavoriteStream($stream);
            }
        }

        $em->persist($user);
        $em->flush();

        return $this->jsonResponse([
            'count' => $user->getFavoriteRadios()->count()
        ]);
    }

    #[Route('/user/song/add/{song}', name: 'user_add_song')]
    #[IsGranted('ROLE_USER')]
    public function addSong(string $song, EntityManagerInterface $em): Response
    {
        /** @var User $user */
        $user = $this->getUser();

        $userSong = new UserSong();
        $userSong->setUser($user);
        $userSong->setSong($song);

        $em->persist($userSong);
        $em->flush();

        return $this->jsonResponse([
            'status' => 'OK',
            'id' => 's' . $userSong->getId()
        ]);
    }

    #[Route('/user/song/remove/s{songId}', name: 'user_remove_song')]
    #[IsGranted('ROLE_USER')]
    public function removeSong(int $songId, EntityManagerInterface $em): Response
    {
        /** @var User $user */
        $user = $this->getUser();

        $userSong = $em->getRepository(UserSong::class)->findOneBy(['id' => $songId, 'user' => $user]);

        if (!$userSong) {
            return $this->jsonResponse([
                'status' => 'KO'
            ]);
        }

        $em->remove($userSong);
        $em->flush();

        return $this->jsonResponse([
            'status' => 'OK'
        ]);
    }

    /**
     * @throws \Exception
     */
    #[
        Route('/{_locale}/now',
            name: 'now',
            defaults: [
                'priority' => '0.9',
                'changefreq' => 'hourly'
            ]
        )
    ]
    public function now(EntityManagerInterface $em, Request $request): Response
    {
        $dateTime = new \DateTime();

        $schedule = $em->getRepository(ScheduleEntry::class)->getTimeSpecificSchedule($dateTime, ['europe1']);

        $collections = $em->getRepository(Collection::class)->getCollections();
        $collections = array_filter($collections, fn($collection) => $collection['code_name'] !== Radio::FAVORITES);

        return $this->render('default/now.html.twig', [
            'schedule' => $schedule,
            'collections' => $collections,
            'date' => $dateTime,
        ]);
    }

    #[Route('/{_locale}/affiliate', name: 'affiliate')]
    public function affiliate(EntityManagerInterface $em, Request $request): Response
    {
        $result = $em->getRepository(Affiliate::class)->getOneAffiliate($request->getLocale());
        $affiliate = '';

        if ($result !== null && is_array($result)) {
            $affiliate = $result['htmlLink'];
        }

        return $this->render('default/affiliate.html.twig', [
            'affiliate' => $affiliate
        ]);
    }

    #[
        Route('/',
            name: 'index_radio_addict',
            priority: 2,
            host: '{subdomain}.radio-addict.com',
            defaults: [ 'subdomain' => 'www'],
            requirements: ['subdomain' => 'www|local']
        )
    ]
    public function indexRadioAddict(): Response
    {
        return $this->redirectToRoute('streaming_spa');
    }

    #[
        Route('/{_locale}/',
            name: 'index_radio_addict_locale',
            priority: 1,
            host: '{subdomain}.radio-addict.com',
            defaults: [ 'subdomain' => 'www'],
            requirements: [
                'subdomain' => 'www|local',
                '_locale' => 'en|fr|es|de|pt|it|pl|el|ar'
            ]
        )
    ]
    public function indexRadioAddictLocale(): Response
    {
        return $this->redirectToRoute('streaming_spa');
    }

    /*
     * This is the spa entry point,
     *   matching multiple urls that are then handled by the spa router
     */
    #[
        Route('/{_locale}/',
            name: 'app',
            defaults: [
                'priority' => '1.0',
                'changefreq' => 'daily'
            ],
            requirements: [
                '_locale' => 'en|fr|es|de|pt|it|pl|el|ar'
            ]
        )
    ]
    public function index(Request $request, string $collection=null): Response
    {
        return $this->render('default/index.html.twig', []);
    }

    #[Route('/', name: 'app_legacy')]
    public function indexLegacy(Host $host, Request $request): RedirectResponse
    {
        $locale = $host->getDefaultLocale($request);
        if ($request->getPreferredLanguage() !== null && in_array($request->getPreferredLanguage(), SiteController::LANG)) {
            $locale = $request->getPreferredLanguage();
        }

        return $this->redirectToRoute('app', ['_locale' => $locale], 301);
    }
}
