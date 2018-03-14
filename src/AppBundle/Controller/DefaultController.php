<?php

namespace AppBundle\Controller;

use AppBundle\Service\ScheduleManager;
use Doctrine\ORM\EntityManagerInterface;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

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
    public function indexAction(Request $request, EntityManagerInterface $em, ScheduleManager $scheduleManager)
    {
        $radios = $em->getRepository('AppBundle:Radio')->getActiveRadios();

        $schedule = $scheduleManager->getDaySchedule(new \DateTime());

        return $this->render('default/index.html.twig', [
            'schedule' => $schedule,
            'radios' => $radios
        ]);
    }

    /**
     * @Route(
     *     "/schedule",
     *     name="schedule"
     * )
     */
    public function scheduleAction(Request $request, ScheduleManager $scheduleManager)
    {
        $schedule = $scheduleManager->getDaySchedule(new \DateTime());

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
    public function radioAction($codename, Request $request, EntityManagerInterface $em, ScheduleManager $scheduleManager)
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
}
