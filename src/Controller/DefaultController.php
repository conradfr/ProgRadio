<?php

declare(strict_types=1);

namespace App\Controller;

use App\Service\ScheduleManager;
use App\Entity\Radio;
use App\Entity\Category;
use App\Entity\Collection;
use App\Entity\ScheduleEntry;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;

class DefaultController extends AbstractBaseController
{
    /**
     * @Route(
     *     "/",
     *     name="app",
     *     defaults={
     *      "priority": "1.0",
     *      "changefreq": "daily",
     *      "bangs": "schedule,streaming"
     *     },
     * )
     */
    public function index(): Response
    {
        return $this->render('default/index.html.twig', []);
    }

    /**
     * @Route(
     *     "/schedule/{date}",
     *     name="schedule"
     * )
     *
     * @ParamConverter("date", options={"format": "Y-m-d"})
     */
    public function schedule(\DateTime $date, ScheduleManager $scheduleManager): Response
    {
        $schedule = $scheduleManager->getDaySchedule($date, true);

        return $this->jsonResponse([
            'schedule' => $schedule
        ]);
    }

    /**
     * @Route(
     *     "/radios",
     *     name="radios"
     * )
     */
    public function radios(EntityManagerInterface $em, Request $request): Response
    {
        $favorites = $request->attributes->get('favorites', []);
        $radios = $em->getRepository(Radio::class)->getActiveRadios($favorites);
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
     *     "/radio/{codename}",
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

        $schedule = $scheduleManager->getRadioDaySchedule($dateTime, $codename);

        return $this->render('default/radio.html.twig', [
            'schedule' => $schedule,
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
     *     "/now",
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
}
