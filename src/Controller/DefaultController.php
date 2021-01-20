<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Stream;
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

class DefaultController extends AbstractBaseController
{
    /**
     * @Route(
     *     "/schedule/{date}",
     *     name="schedule"
     * )
     *
     * @ParamConverter("date", options={"format": "Y-m-d"})
     */
    public function schedule(\DateTime $date, ScheduleManager $scheduleManager, Request $request): Response
    {
        $schedule = null;
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
     * @Route(
     *     "/{_locale}/radio/{codename}",
     *     name="radio_legacy"
     * )
     *
     * @throws \Exception
     */
    public function radio_legacy(string $codename, Request $request): Response
    {
        return $this->redirectToRoute('radio', ['_locale' => $request->getLocale(), 'codename' => $codename], 301);
    }

    /**
     * @Route({
     *     "en": "/{_locale}/schedule-streaming-{codename}",
     *     "fr": "/{_locale}/grille-ecouter-{codename}"
     * },
     *     name="radio",
     *     defaults={
     *      "priority": "0.8",
     *      "changefreq": "daily"
     *      }
     * )
     *
     * @throws \Exception
     */
    public function radio(string $codename, EntityManagerInterface $em, ScheduleManager $scheduleManager): Response
    {
        $dateTime = new \DateTime();

        // @todo check cache
        $radio = $em->getRepository(Radio::class)->findOneBy(['codeName' => $codename, 'active' => true]);
        if (!$radio) {
            throw new NotFoundHttpException('Radio not found');
        }

        $schedule = $scheduleManager->getDayScheduleOfRadio($dateTime, $codename);
        $scheduleRadio = [];

        if (isset($schedule[$codename])) {
            $scheduleRadio =$schedule[$codename];
        }

        //$schedule = $scheduleManager->getDayScheduleOfRadio($dateTime, $codename);

        return $this->render('default/radio.html.twig', [
            'schedule' => $scheduleRadio,
            'radio' => $radio,
            'date' => $dateTime
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

        if ( $user->getFavoriteRadios()->contains($radio)) {
            $user->removeFavoriteRadio($radio);
        } else {
            $user->addFavoriteRadio($radio);
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
         *
         * Code is not great but it's just temporary (famous last word)
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

        if(!isset($data['id']) || !is_string($data['id'])) {
            throw new BadRequestHttpException('Invalid data');
        }

        if (Uuid::isValid($data['id'])) {
            $stream = $em->getRepository(Stream::class)->findOneBy(['id' => $data['id']]);
            if (!$stream) {
                throw new NotFoundHttpException('Stream not found');
            }

            $listeningSession->setStream($stream);
        } else {
            $radio = $em->getRepository(Radio::class)->findOneBy(['codeName' => $data['id'], 'active' => true]);
            if (!$radio) {
                throw new NotFoundHttpException('Radio not found');
            }

            $listeningSession->setRadio($radio);
        }

        $em->persist($listeningSession);
        $em->flush();

        return $this->jsonResponse([
            'status' => 'OK'
        ]);
    }

    /**
     * @Route(
     *     "/{_locale}/",
     *     name="app",
     *     defaults={
     *      "priority": "1.0",
     *      "changefreq": "daily",
     *      "bangs": "schedule,streaming"
     *     },
     *     requirements={
     *      "_locale": "en|fr",
     *     }
     * )
     */
    public function index(): Response
    {
        return $this->render('default/index.html.twig', []);
    }

    /**
     * @Route(
     *     "/",
     *     name="app_legacy"
     * )
     */
    public function indexLegacy(): RedirectResponse
    {
        return $this->redirectToRoute('app', ['_locale' => 'fr'], 301);
    }
}
