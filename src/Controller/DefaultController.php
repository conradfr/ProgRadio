<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Affiliate;
use App\Entity\Stream;
use App\Entity\StreamSuggestion;
use App\Entity\UserSong;
use App\Form\StreamSuggestionType;
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
use Symfony\Component\HttpKernel\Attribute\Cache;
use Symfony\Component\Intl\Countries;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\String\Slugger\AsciiSlugger;
use Keiko\Uuid\Shortener\Dictionary;
use Keiko\Uuid\Shortener\Shortener;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Contracts\Translation\TranslatorInterface;

class DefaultController extends AbstractBaseController
{
    protected const MIN_DATE = '2017-08-19';
    protected const COOKIE_LOCALE = 'locale';

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
                'en' => '/{_locale}/schedule-streaming-{codeName}-{subRadioCodeName}/schedule-of-day/{date?}',
                'fr' => '/{_locale}/grille-ecouter-{codeName}-{subRadioCodeName}/programmes-du-jour/{date?}',
                'es' => '/{_locale}/escuchar-{codeName}-{subRadioCodeName}/programas de día/{date?}',
                'de' => '/{_locale}/zuhören-{codeName}-{subRadioCodeName}/tagesprogramme/{date?}',
                'pt' => '/{_locale}/ouvir-{codeName}-{subRadioCodeName}/programas-diurnos/{date?}',
                'it' => '/{_locale}/ascolti-{codeName}-{subRadioCodeName}/programmi-diurni/{date?}',
                'pl' => '/{_locale}/streaming-{codeName}-{subRadioCodeName}/programy-dzienne/{date?}',
                'el' => '/{_locale}/streaming-{codeName}-{subRadioCodeName}/προγράμματα-ημέρας/{date?}',
                'ro' => '/{_locale}/streaming-{codeName}-{subRadioCodeName}/programe-de-zi/{date?}',
                'hu' => '/{_locale}/streaming-{codeName}-{subRadioCodeName}/programok/{date?}',
                'ar' => '/{_locale}/البث-{codeName}-{subRadioCodeName}/برامج-اليوم/{date?}',
                'tr' => '/{_locale}/dinlemek-{codeName}-{subRadioCodeName}/programlı/{date?}',
            ],
            name: 'radio_subradio',
            defaults: [
                'priority' => '0.8',
                'changefreq' => 'daily'
            ]
        )
    ]
    public function radioSubRadio(
        string $codeName,
        string $subRadioCodeName,
        EntityManagerInterface $em,
        ScheduleManager $scheduleManager,
        Host $host,
        RouterInterface $router,
        Request $request,
        \DateTime $date=null): Response
    {
        // redirect to progradio if not (for seo)
        if ($host->isProgRadio($request) === false) {
            $router->getContext()->setHost('www.' . Host::DATA['progradio']['domain']);

            $routeParams = [
                '_locale' => $request->getLocale(),
                'codeName' => $codeName,
                'subRadioCodeName' => $subRadioCodeName
            ];

            if ($date !== null) {
                $routeParams['date'] = $date->format('Y-m-d');
            }

            $redirectUrl = $router->generate('radio_subradio', $routeParams, UrlGeneratorInterface::ABSOLUTE_URL);

            return $this->redirect($redirectUrl, 301);
        }

        $noDate = false;
        if ($date === null) {
            $noDate = true;
            $date = new \DateTime();
        }

        /** @var Radio|null $radio */
        $radio = $em->getRepository(Radio::class)->findOneBy(['codeName' => $codeName, 'active' => true]);
        if (!$radio) {
            throw new NotFoundHttpException('Radio not found');
        }

        /** @var SubRadio|null $subRadio */
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

        $response = $this->render('default/radio.html.twig', [
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

        //cache prev dates
        if ($noDate === false) {
            $response->setCache([
                'no_cache' => false,
                'max_age' => ScheduleManager::CACHE_SCHEDULE_TTL,
                's_maxage' => ScheduleManager::CACHE_SCHEDULE_TTL
            ]);
        }

        return $response;
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
                'ro' => '/{_locale}/streaming-{codeName}-{subRadioCodeName}/{date?}',
                'hu' => '/{_locale}/streaming-{codeName}-{subRadioCodeName}/{date?}',
                'ar' => '/{_locale}/البث-{codeName}-{subRadioCodeName}/{date?}',
                'tr' => '/{_locale}/dinlemek-{codeName}-{subRadioCodeName}/{date?}',
            ],
            name: 'radio_subradio_legacy',
        )
    ]
    public function radioSubRadioLegacy(
        string $codeName,
        string $subRadioCodeName,
        EntityManagerInterface $em,
        ScheduleManager $scheduleManager,
        Host $host,
        RouterInterface $router,
        Request $request,
        \DateTime $date=null): Response
    {
        // we moved from this to the current url to maybe help Google choose the right canonical url

        // redirect to progradio if not (for seo)
        if ($host->isProgRadio($request) === false) {
            $router->getContext()->setHost('www.' . Host::DATA['progradio']['domain']);

            $routeParams = [
                '_locale' => $request->getLocale(),
                'codeName' => $codeName,
                'subRadioCodeName' => $subRadioCodeName
            ];

            if ($date !== null) {
                $routeParams['date'] = $date->format('Y-m-d');
            }

            $redirectUrl = $router->generate('radio_subradio', $routeParams, UrlGeneratorInterface::ABSOLUTE_URL);

            return $this->redirect($redirectUrl, 301);
        }

        $routeParams = [
            '_locale' => $request->getLocale(),
            'codeName' => $codeName,
            'subRadioCodeName' => $subRadioCodeName
        ];

        if ($date !== null) {
            $routeParams['date'] = $date->format('Y-m-d');
        }

        return $this->redirectToRoute('radio_subradio', $routeParams, 301);
    }

    /**
     * @throws \Exception
     */
    #[
        Route(
            path: [
                'en' => '/{_locale}/schedule-streaming-{codeName}/schedule-of-day/{date?}',
                'fr' => '/{_locale}/grille-ecouter-{codeName}/programmes-du-jour/{date?}',
                'es' => '/{_locale}/escuchar-{codeName}/programas de día/{date?}',
                'de' => '/{_locale}/zuhören-{codeName}/tagesprogramme/{date?}',
                'pt' => '/{_locale}/ouvir-{codeName}/programas-diurnos/{date?}',
                'it' => '/{_locale}/ascolti-{codeName}/programmi-diurni/{date?}',
                'pl' => '/{_locale}/streaming-{codeName}/programy-dzienne/{date?}',
                'el' => '/{_locale}/streaming-{codeName}/προγράμματα-ημέρας/{date?}',
                'ro' => '/{_locale}/streaming-{codeName}/programe-de-zi/{date?}',
                'hu' => '/{_locale}/streaming-{codeName}/programok/{date?}',
                'ar' => '/{_locale}/البث-{codeName}/برامج-اليوم/{date?}',
                'tr' => '/{_locale}/dinlemek-{codeName}/programlı/{date?}',
            ],
            name: 'radio',
            defaults: [
                'priority' => '0.8',
                'changefreq' => 'daily'
            ]
        )
    ]
    public function radio(
        string $codeName,
        EntityManagerInterface $em,
        ScheduleManager $scheduleManager,
        Host $host,
        RouterInterface $router,
        Request $request,
        \DateTime $date=null
    ): Response
    {
        // redirect to progradio if not (for seo)
        if ($host->isProgRadio($request) === false) {
            $router->getContext()->setHost('www.' . Host::DATA['progradio']['domain']);

            $routeParams = [
                '_locale' => $request->getLocale(),
                'codeName' => $codeName
            ];

            if ($date !== null) {
                $routeParams['date'] = $date->format('Y-m-d');
            }

            $redirectUrl = $router->generate('radio', $routeParams, UrlGeneratorInterface::ABSOLUTE_URL);

            return $this->redirect($redirectUrl, 301);
        }

        /** @var Radio|null $radio */
        $radio = $em->getRepository(Radio::class)->findOneBy(['codeName' => $codeName, 'active' => true]);
        if (!$radio) {
            throw new NotFoundHttpException('Radio not found');
        }

        /** @var SubRadio|null $subRadio */
        $subRadio = $em->getRepository(SubRadio::class)->findOneBy(['radio' => $radio, 'main' => true, 'enabled' => true]);
        if (!$subRadio) {
            throw new NotFoundHttpException('Radio not found');
        }

        // We don't do a redirect to keep the url clean without the default subradio.
        return $this->radioSubRadio(
            $codeName,
            $subRadio->getCodeName(),
            $em,
            $scheduleManager,
            $host,
            $router,
            $request,
            $date
        );
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
                'ro' => '/{_locale}/streaming-{codeName}/{date?}',
                'hu' => '/{_locale}/streaming-{codeName}/{date?}',
                'ar' => '/{_locale}/البث-{codeName}/{date?}',
                'tr' => '/{_locale}/dinlemek-{codeName}/{date?}',
            ],
            name: 'radio_legacy',
        )
    ]
    public function radioLegacy(
        string $codeName,
        EntityManagerInterface $em,
        ScheduleManager $scheduleManager,
        Host $host,
        RouterInterface $router,
        Request $request,
        \DateTime $date=null
    ): Response
    {
        // we moved from this to the current url to maybe help Google choose the right canonical url

        // redirect to progradio if not (for seo)
        if ($host->isProgRadio($request) === false) {
            $router->getContext()->setHost('www.' . Host::DATA['progradio']['domain']);

            $routeParams = [
                '_locale' => $request->getLocale(),
                'codeName' => $codeName
            ];

            if ($date !== null) {
                $routeParams['date'] = $date->format('Y-m-d');
            }

            $redirectUrl = $router->generate('radio', $routeParams, UrlGeneratorInterface::ABSOLUTE_URL);

            return $this->redirect($redirectUrl, 301);
        }

        $routeParams = [
            '_locale' => $request->getLocale(),
            'codeName' => $codeName
        ];

        if ($date !== null) {
            $routeParams['date'] = $date->format('Y-m-d');
        }
        return $this->redirectToRoute('radio', $routeParams, 301);
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
                'ro' => '/{_locale}/stream-{shortId}/asculta-{codename}',
                'hu' => '/{_locale}/stream-{shortId}/hallgat-{codename}',
                'ar' => '/{_locale}/stream-{shortId}/استمع-{codename}',
                'tr' => '/{_locale}/stream-{shortId}/dinlemek-{codename}',
            ],
            name: 'streams_one_short',
            defaults: [
                'priority' => '0.7',
                'changefreq' => 'monthly'
            ]
        )
    ]
    #[Cache(maxage: 60, public: true, mustRevalidate: true)]
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
            $router->getContext()->setHost('www.' . Host::DATA['radioaddict']['domain']);
            $redirectUrl = $router->generate('streams_one_short', [
                '_locale' => $request->getLocale(),
                'shortId' => $shortener->reduce($stream->getId()->toRfc4122()),
                'codename' => $codename
            ], UrlGeneratorInterface::ABSOLUTE_URL);

            return $this->redirect($redirectUrl, 301);
        }

        if ($stream->getRedirectToStream() !== null) {
            $slugger = new AsciiSlugger();

            $shortId = $shortener->reduce($stream->getRedirectToStream()->getId()->toRfc4122());

            $redirectUrl = $router->generate('streams_one_short', [
                '_locale' => $request->getLocale(),
                'shortId' => $shortId,
                'codename' => $slugger->slug($stream->getRedirectToStream()->getName())
            ], UrlGeneratorInterface::ABSOLUTE_URL);

            return $this->redirect($redirectUrl, 301);
        }

        $moreStreams = $em->getRepository(Stream::class)->getMoreStreams($stream);
        // $moreStreams = [];

        return $this->render('default/stream.html.twig', [
            'stream' => $stream,
            'more_streams' => $moreStreams
        ]);
    }

    #[
        Route('/{_locale}/stream-popup/{stream}',
            name: 'streams_one_popup_short',
            schemes:['http']
        )
    ]
    public function onePopupShort(Stream $stream): Response
    {
        return $this->render('default/stream_popup.html.twig', [
            'stream' => $stream,
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
                'ro' => '/{_locale}/stream/{id}/asculta-{codename}',
                'hu' => '/{_locale}/stream/{id}/hallgat-{codename}',
                'ar' => '/{_locale}/stream/{id}/استمع-{codename}',
                'tr' => '/{_locale}/stream/{id}/dinlemek-{codename}',
            ],
            name: 'streams_one',
            defaults: [
                'priority' => '0.6',
                'changefreq' => 'monthly'
            ]
        )
    ]
    #[Cache(maxage: 60, public: true, mustRevalidate: true)]
    public function one(Stream $stream, string $codename, RouterInterface $router, Host $host, Request $request): Response
    {
        $shortener = Shortener::make(
            Dictionary::createUnmistakable() // or pass your own characters set
        );

        // redirect non-fr stream seo pages to new host
        if ($host->isProgRadio($request) === true && $request->getLocale() !== 'fr') {
            $router->getContext()->setHost('www.' . Host::DATA['radioaddict']['domain']);
            $redirectUrl = $router->generate('streams_one_short', [
                '_locale' => $request->getLocale(),
                'shortId' => $shortener->reduce($stream->getId()->toRfc4122()),
                'codename' => $codename
            ], UrlGeneratorInterface::ABSOLUTE_URL);

            return $this->redirect($redirectUrl, 301);
        }

        $slugger = new AsciiSlugger();

        $name = $stream->getRedirectToStream() !== null ? $stream->getRedirectToStream()->getName() : $stream->getName();
        $shortId = $stream->getRedirectToStream() !== null ? $stream->getRedirectToStream()->getId() : $stream->getId();

        $redirectUrl = $router->generate('streams_one_short', [
            '_locale' => $request->getLocale(),
            'shortId' =>  $shortener->reduce($shortId->toRfc4122()),
            'codename' => $slugger->slug($name)
        ], UrlGeneratorInterface::ABSOLUTE_URL);

        return $this->redirect($redirectUrl, 301);
    }

    #[Route('/{_locale}/top/{countryCode}',
        name: 'streams_top',
        requirements: ['_locale' => 'en|fr|es|de|pt|it|pl|el|ar|ro|hu|tr'],
        defaults: [
            'priority' => '0.5',
            'changefreq' => 'weekly'
        ]
    )
    ]
    #[Cache(maxage: ScheduleManager::CACHE_SCHEDULE_TTL, public: true, mustRevalidate: true)]
    public function top(string $countryCode, Host $host, RouterInterface $router, EntityManagerInterface $em, Request $request): Response
    {
        // redirect non-fr stream seo pages to new host
        if ($host->isProgRadio($request) === true && $request->getLocale() !== 'fr') {
            $router->getContext()->setHost('www.' . Host::DATA['radioaddict']['domain']);
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
            'country' => Countries::getName(strtoupper($countryCode), $request->getLocale()),
            'country_code' => $countryCode
        ]);
    }

    #[Route('/{_locale}/last/{countryCode}',
        name: 'streams_last',
        requirements: ['_locale' => 'en|fr|es|de|pt|it|pl|el|ar|ro|hu|tr'],
        defaults: [
            'priority' => '0.5',
            'changefreq' => 'daily'
        ]
    )
    ]
    #[Cache(maxage: 60, public: true, mustRevalidate: true)]
    public function last(string $countryCode, Host $host, RouterInterface $router, EntityManagerInterface $em, Request $request): Response
    {
        // redirect non-fr stream seo pages to new host
        if ($host->isProgRadio($request) === true && $request->getLocale() !== 'fr') {
            $router->getContext()->setHost('www.' . Host::DATA['radioaddict']['domain']);
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
            'country' => Countries::getName(strtoupper($countryCode), $request->getLocale()),
            'country_code' => $countryCode
        ]);
    }

    #[Route('/user', name: 'user_config')]
    public function user(Request $request, AuthorizationCheckerInterface $authChecker): Response
    {
        /** @var User|null $user */
        $user = $this->getUser();

        if ($user !== null) {
            $favorites = $user->getFavoriteRadios()->map(
                fn($radio) => $radio->getCodeName()
            )->toArray();

            $favoritesStream = $user->getFavoriteStreams()->map(
                fn($stream) => $stream->getId()->toRfc4122()
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
                'storeHistory' => $user !== null && $user->getStoreHistory(),
                'isAdmin' => $user !== null && $authChecker->isGranted('ROLE_ADMIN')
            ]
        ]);
    }

    #[Route('/radios/favorite/{codeName}', name: 'favorite_toggle')]
    #[IsGranted('ROLE_USER')]
    public function toggleFavorite(string $codeName, EntityManagerInterface $em): Response
    {
        $radio = $em->getRepository(Radio::class)->findOneBy(['codeName' => $codeName]);
        
        if (!$radio) {
            throw new NotFoundHttpException('radio not found');
        }

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
    public function now(EntityManagerInterface $em): Response
    {
        $dateTime = new \DateTime();

        $schedule = $em->getRepository(ScheduleEntry::class)->getTimeSpecificSchedule($dateTime);

        $collections = $em->getRepository(Collection::class)->getCollections();
        $collections = array_filter($collections, fn($collection) => $collection['code_name'] !== Radio::FAVORITES);

        return $this->render('default/now.html.twig', [
            'schedule' => $schedule,
            'collections' => $collections,
            'date' => $dateTime,
        ])
            ->expire();
    }

    #[Route('/{_locale}/streams/suggestion/{id}', name: 'streams_suggestion')]
    public function suggestion(Stream $stream, Request $request, EntityManagerInterface $em, TranslatorInterface $translator): Response
    {
        $streamSuggestion = new StreamSuggestion();
        $streamSuggestion->setStream($stream);

        $form = $this->createForm(StreamSuggestionType::class, $streamSuggestion);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $em->persist($streamSuggestion);
            $em->flush();

            $this->addFlash(
                'success',
                $translator->trans('page.stream.modification.success')
            );

            $streamSuggestion = new StreamSuggestion();
            $streamSuggestion->setStream($stream);
            $form = $this->createForm(StreamSuggestionType::class, $streamSuggestion);
        }

        return $this->render('default/stream_suggestion.html.twig',
            [
                'stream' => $stream,
                'stream_suggestion' => $streamSuggestion,
                'form' => $form->createView()
            ]
        );
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
        Route('/locale-switch/to/{locale}',
            name: 'locale_switch',
            requirements: [
                'locale' => 'en|fr|es|de|pt|it|pl|el|ar|ro|hu|tr'
            ]
        )
    ]
    public function localSwitch(Request $request, string $locale): Response
    {
        $redirect = $request->query->get('redirect', '/');
        $toUrl = urldecode($redirect);

        // noticed some weird urls sometimes so we check
        $whitelist = ['localhost'];
        foreach (Host::DATA as $host) {
            $whitelist[] = $host['domain'];
            $whitelist[] = 'www.'. $host['domain'];
        }

        if (!in_array(parse_url($toUrl)['host'], $whitelist)) {
            return $this->redirectToRoute('index_radio_addict', [], 301);
        }

        $cookie = new Cookie(
            self::COOKIE_LOCALE,
            $locale,
            time() + (2 * 365 * 24 * 60 * 60) // 2 years
        );

        $response = new RedirectResponse(urldecode($redirect));
        $response->headers->setCookie($cookie);

        return $response;
    }

    #[
        Route('/',
            name: 'index_radio_addict',
            requirements: ['subdomain' => 'www|local'],
            defaults: [ 'subdomain' => 'www'],
            host: '{subdomain}.radio-addict.com',
            priority: 2
        )
    ]
    public function indexRadioAddict(Host $host, Request $request): Response
    {
        $locale = $request->cookies->get(self::COOKIE_LOCALE, null);

        if (!$locale && $request->getPreferredLanguage() !== null && in_array(substr($request->getPreferredLanguage(), 0, 2), SiteController::LANG)) {
            $locale = substr($request->getPreferredLanguage(), 0, 2);
        } elseif (!$locale) {
            $locale = $host->getDefaultLocale($request);
        }

        return $this->redirectToRoute('streaming_spa', ['_locale' => $locale], 301);
    }

    #[
        Route('/{_locale}/',
            name: 'index_radio_addict_locale',
            requirements: [
                'subdomain' => 'www|local',
                '_locale' => 'en|fr|es|de|pt|it|pl|el|ar|ro|hu|tr'
            ],
            defaults: [ 'subdomain' => 'www'],
            host: '{subdomain}.radio-addict.com',
            priority: 1
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
            requirements: [
                '_locale' => 'en|fr|es|de|pt|it|pl|el|ar|ro|hu|tr'
            ],
            defaults: [
                'priority' => '1.0',
                'changefreq' => 'daily'
            ]
        )
    ]
    public function index(string $collection=null): Response
    {
        return $this->render('default/index.html.twig', []);
    }

    #[Route('/', name: 'app_legacy')]
    public function indexLegacy(Host $host, Request $request): RedirectResponse
    {
        $locale = $request->cookies->get(self::COOKIE_LOCALE, null);

        if (!$locale && $request->getPreferredLanguage() !== null && in_array(substr($request->getPreferredLanguage(), 0, 2), SiteController::LANG)) {
            $locale = substr($request->getPreferredLanguage(), 0, 2);
        } elseif (!$locale) {
            $locale = $host->getDefaultLocale($request);
        }

        $routeName = $host->isProgRadio($request) ? 'app' : 'streaming_spa';

        return $this->redirectToRoute($routeName, ['_locale' => $locale], 301);
    }
}
