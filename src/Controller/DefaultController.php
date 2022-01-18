<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\RadioStream;
use App\Entity\Stream;
use App\Service\Host;
use App\Service\ScheduleManager;
use App\Entity\Radio;
use App\Entity\Category;
use App\Entity\Collection;
use App\Entity\ScheduleEntry;
use App\Entity\User;
use Darsyn\IP\Version\Multi;
use Doctrine\ORM\EntityManagerInterface;
use Ramsey\Uuid\Uuid;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use App\Entity\ListeningSession;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class DefaultController extends AbstractBaseController
{
    protected const MIN_DATE = '2017-08-19';

    /**
     * LEGACY
     *
     * @Route(
     *     "/schedule/{date}",
     *     name="schedule"
     * )
     *
     * @ParamConverter("date", options={"format": "Y-m-d"})
     */
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

    /**
     * LEGACY
     *
     * @Route(
     *     "/radios",
     *     name="api_radios"
     * )
     */
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
     * @Route({
     *     "en": "/{_locale}/schedule-streaming-{codename}/{date}",
     *     "fr": "/{_locale}/grille-ecouter-{codename}/{date}",
     *     "es": "/{_locale}/escuchar-{codename}/{date}",
     * },
     *     name="radio",
     *     defaults={
     *      "priority": "0.8",
     *      "changefreq": "daily"
     *      }
     * )
     *
     * @ParamConverter("date", options={"format": "Y-m-d"})
     * @throws \Exception
     */
    public function radio(string $codename, \DateTime $date=null, EntityManagerInterface $em, ScheduleManager $scheduleManager): Response
    {
        if ($date === null) {
            $date = new \DateTime();
        }

        /** @var Radio $radio */
        $radio = $em->getRepository(Radio::class)->findOneBy(['codeName' => $codename, 'active' => true]);
        if (!$radio) {
            throw new NotFoundHttpException('Radio not found');
        }

        $stream = $em->getRepository(RadioStream::class)->getMainStreamOfRadio($radio->getId());
        $moreRadios = $em->getRepository(Radio::class)->getMoreRadiosFrom($radio);
        $moreRadios2 = $em->getRepository(Radio::class)->getMoreRadiosFrom($radio, true);

        $schedule = $scheduleManager->getDayScheduleOfRadio($date, $codename);
        $scheduleRadio = [];

        if (isset($schedule[$codename])) {
            $scheduleRadio = $schedule[$codename];
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
            $prevSchedule = $scheduleManager->getDayScheduleOfRadio($prevDate, $codename);
        }

        // don't go after tomorrow, we don't have the data
        $tomorrow = new \DateTime('tomorrow');
        if ($date->format('Y-m-d') === $tomorrow->format('Y-m-d')) {
            $nextSchedule = null;
        } else {
            $nextSchedule = $scheduleManager->getDayScheduleOfRadio($nextDate, $codename);
        }

        return $this->render('default/radio.html.twig', [
            'schedule' => $scheduleRadio,
            'radio' => $radio,
            'stream_url' => $stream !== null ? $stream['url'] : null,
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
     * @Route(
     *     "/listen",
     *     name="listen",
     *     methods={"POST"}
     * )
     */
    public function listen(EntityManagerInterface $em, Request $request): Response
    {
        /**
         * @todo move to new api
         * edit: we did it ;)
         *
         * 01/09/2021 Code restored as it seems there's still access to it (IE, old Android app ?)
         *
         * LEGACY
         * This route is kept for now for the non-updated mobile app
         *
         * 12/05/2021 Not seeing calls from the old app for some days now,
         * This code will be probably removed next month then.
         *
         *-----
         *
         * Code is not great but it's just temporary (famous last word)
         *
         */

        //$json = $this->getJson($request);
        $data = $this->getJson($request);

        $now = new \DateTime('UTC');

        $listeningSession = new ListeningSession();

        $dateTimeStart = new \DateTime($data['date_time_start']);
        $dateTimeStart->setTimezone(new \DateTimeZone('UTC'));

        $dateTimeEnd = new \DateTime($data['date_time_end']);
        $dateTimeEnd->setTimezone(new \DateTimeZone('UTC'));

        $listeningSession->setDateTimeStart($dateTimeStart);
        $listeningSession->setDateTimeEnd($dateTimeEnd);

        $listeningSession->setSource($data['source'] ?: null);

        try {
            $ip = Multi::factory($request->getClientIp());
            $listeningSession->setIpAddress($ip);

            if ($listeningSession->getDateTimeEnd()->getTimestamp() - $listeningSession->getDateTimeStart()->getTimestamp() < ListeningSession::MINIMUM_SECONDS
                || abs($now->getTimestamp() - $listeningSession->getDateTimeEnd()->getTimestamp()) > ListeningSession::MAX_DIFFERENCE_WITH_CURRENT_SECONDS) {
                return $this->jsonResponse([
                    'status' => 'Ignored',
                ]);
            }
        } catch (\Exception $e) {
            throw new BadRequestHttpException($e->getMessage());
        }

        if(
            (!isset($data['id']) || !is_string($data['id']))
            && (!isset($data['radio_stream_id']) || !is_string($data['radio_stream_id']))
            && (!isset($data['stream_id']) || !is_string($data['stream_id']))
        )
        {
            throw new BadRequestHttpException('Invalid data');
        }

        $id = null;
        $isStream = false;

        if (isset($data['id']) && is_string($data['id'])) {
            $id = $data['id'];
            if (Uuid::isValid($id)) {
                $isStream = true;
            }
        } elseif (isset($data['radio_stream_id']) && is_string($data['radio_stream_id'])) {
            $id = $data['radio_stream_id'];
        } else {
            $id = $data['stream_id'];
            $isStream = true;
        }

        if ($isStream === true) {
            $stream = $em->getRepository(Stream::class)->findOneBy(['id' => $id]);
            if (!$stream) {
                throw new NotFoundHttpException('Stream not found');
            }

            $listeningSession->setStream($stream);
        } else {
            $radioStream = $em->getRepository(RadioStream::class)->findOneBy(['codeName' => $id]);
            if (!$radioStream) {
                $radio = $em->getRepository(Radio::class)->findOneBy(['codeName' => $id, 'active' => true]);
                if (!$radio) {
                    throw new NotFoundHttpException('Radio not found');
                }

                $radioStream = $em->getRepository(RadioStream::class)->findOneBy(['radio' => $radio]);
                if (!$radioStream) {
                    throw new NotFoundHttpException('Radio not found');
                }
            }

            $listeningSession->setRadioStream($radioStream);
        }

        $uuid = Uuid::uuid4();
        $listeningSession->setId($uuid->toString());

        $em->persist($listeningSession);
        $em->flush();

        return $this->jsonResponse([
            'status' => 'OK'
        ]);
    }

    /**
     * @Route({
     *     "en": "/{_locale}/stream/{id}/listen-{codename}",
     *     "fr": "/{_locale}/stream/{id}/ecouter-{codename}",
     *     "es": "/{_locale}/stream/{id}/escuchar-{codename}",
     * },
     *     name="streams_one",
     *     defaults={
     *      "priority": "0.7",
     *      "changefreq": "monthly"
     *      }
     * )
     */
    public function one(Stream $stream, string $codename, RouterInterface $router, Host $host, EntityManagerInterface $em, Request $request): Response
    {
        // redirect non-fr stream seo pages to new host
        if ($host->isProgRadio($request) === true && $request->getLocale() !== 'fr') {
            $router->getContext()->setHost('www.' . Host::DATA['radioaddict']['domain'][0]);
            $redirectUrl = $router->generate('streams_one', [
                '_locale' => $request->getLocale(),
                'id' => $stream->getId(),
                'codename' => $codename
            ], UrlGeneratorInterface::ABSOLUTE_URL);

            return $this->redirect($redirectUrl, 301);
        }

        $moreStreams = $em->getRepository(Stream::class)->getMoreStreams($stream);

        return $this->render('default/stream.html.twig', [
            'stream' => $stream,
            'more_streams' => $moreStreams
        ]);
    }

    /**
     * @Route(
     *     "/user",
     *     name="user_config",
     * )
     */
    public function user(Request $request): Response
    {
        $user = $this->getUser();

        if ($user !== null) {
            $favorites = $user->getFavoriteRadios()->map(
                function ($radio) {
                    return $radio->getCodeName();
                }
            )->toArray();

            $favoritesStream = $user->getFavoriteStreams()->map(
                function ($stream) {
                    return $stream->getId();
                }
            )->toArray();

        } else {
            $favorites = $request->attributes->get('favorites', []);
            $favoritesStream = $request->attributes->get('favoritesStream', []);
        }

        return $this->jsonResponse([
            'user' => [
                'favoritesRadio' => $favorites,
                'favoritesStream' => $favoritesStream,
                'logged' => $user !== null
            ]
        ]);
    }

    /**
     * @Route(
     *     "/radios/favorite/{codeName}",
     *     name="favorite_toggle"
     * )
     *
     * @IsGranted("ROLE_USER")
     */
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

    /**
     * @Route(
     *     "/{_locale}/now",
     *     name="now",
     *     defaults={
     *      "priority": "0.9",
     *      "changefreq": "hourly"
     *      }
     * )
     *
     * @throws \Exception
     */
    public function now(EntityManagerInterface $em, Request $request): Response
    {
        $dateTime = new \DateTime();

        $schedule = $em->getRepository(ScheduleEntry::class)->getTimeSpecificSchedule($dateTime);
        $collections = $em->getRepository(Collection::class)->getCollections();
        $collections = array_filter($collections, function($collection) {
            return $collection['code_name'] !== Radio::FAVORITES;
        });

        return $this->render('default/now.html.twig', [
            'schedule' => $schedule,
            'collections' => $collections,
            'date' => $dateTime,
        ]);
    }

    /**
     * @Route("/",
     *     name="index_radio_addict",
     *     host="{subdomain}.radio-addict.com",
     *     defaults={"subdomain"="www"},
     *     requirements={"subdomain"="www|local"}
     * )
     */
    public function indexRadioAddict(): Response
    {
        return $this->redirectToRoute('streaming_spa');
    }

    /**
     * @Route(
     *     "/{_locale}/",
     *     name="index_radio_addict_locale",
     *     host="{subdomain}.radio-addict.com",
     *     defaults={"subdomain"="www"},
     *     requirements={
     *       "subdomain"="www|local",
     *       "_locale": "en|fr|es"
     *     }
     * )
     */
    public function indexRadioAddictLocale(): Response
    {
        return $this->redirectToRoute('streaming_spa');
    }

    /**
     * This is the spa entry point,
     *   matching multiple urls that are then handled by the spa router
     *
     * @Route(
     *     "/{_locale}/",
     *     name="app",
     *     defaults={
     *      "priority": "1.0",
     *      "changefreq": "daily"
     *     },
     *     requirements={
     *      "_locale": "en|fr|es",
     *     }
     * )
     */
    public function index(string $collection=null, Request $request): Response
    {
        return $this->render('default/index.html.twig', []);
    }

    /**
     * @Route(
     *     "/",
     *     name="app_legacy"
     * )
     */
    public function indexLegacy(Host $host, Request $request): RedirectResponse
    {
        $locale = $host->getDefaultLocale($request);
        if ($request->getPreferredLanguage() !== null && in_array($request->getPreferredLanguage(), SiteController::LANG)) {
            $locale = $request->getPreferredLanguage();
        }

        return $this->redirectToRoute('app', ['_locale' => $locale], 301);
    }
}
