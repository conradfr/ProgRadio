<?php

namespace AppBundle\Controller;

use AppBundle\Service\ScheduleManager;
use Doctrine\ORM\EntityManagerInterface;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;

class DefaultController extends Controller
{
    /**
     * @Route(
     *     "/",
     *     name="homepage",
     *     defaults={
     *      "priority": "1.0",
     *      "changefreq": "daily"
     *      }
     * )
     */
    public function indexAction(EntityManagerInterface $em, ScheduleManager $scheduleManager)
    {
        $radios = $em->getRepository('AppBundle:Radio')->getActiveRadios();
        $categories = $em->getRepository('AppBundle:Category')->getCategories();

        return $this->render('default/index.html.twig', [
            'radios' => $radios,
            'categories' => $categories
        ]);
    }

    /**
     * @Route(
     *     "/schedule/{date}",
     *     name="schedule"
     * )
     * @ParamConverter("date", options={"format": "Y-m-d"})
     */
    public function scheduleAction(\DateTime $date, ScheduleManager $scheduleManager)
    {
        $schedule = $scheduleManager->getDaySchedule($date, true);

        $response = new Response();

        $response->setContent(json_encode([
            'schedule' => $schedule
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_NUMERIC_CHECK));

        $response->headers->set('Content-Type', 'application/json');

        return $response;
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
     */
    public function radioAction($codename, EntityManagerInterface $em, ScheduleManager $scheduleManager)
    {
        $dateTime = new \DateTime();

        // @todo check cache
        $radio = $em->getRepository('AppBundle:Radio')->findOneBy(['codeName' => $codename, 'active' => true]);
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
     *     "/now",
     *     name="now",
     *     defaults={
     *      "priority": "0.9",
     *      "changefreq": "hourly"
     *      }
     * )
     */
    public function nowAction(EntityManagerInterface $em)
    {
        $dateTime = new \DateTime();

        $schedule = $em->getRepository('AppBundle:ScheduleEntry')->getTimeSpecificSchedule($dateTime);

        return $this->render('default/now.html.twig', [
            'schedule' => $schedule,
            'date' => $dateTime
        ]);
    }
}
