<?php

namespace AppBundle\Controller;

use AppBundle\Service\ScheduleManager;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

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
    public function indexAction(Request $request)
    {
        $em = $this->get('doctrine')->getManager();

        $radios = $em->getRepository('AppBundle:Radio')->getActiveRadios();

        $scheduleManager = $this->get(ScheduleManager::class);
        $schedule = $scheduleManager->getDaySchedule(new \DateTime());

        return $this->render('default/index.html.twig', [
            'schedule' => $schedule,
            'radios' => $radios
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
     */
    public function radioAction($codename, Request $request)
    {
        $em = $this->get('doctrine')->getManager();
        $dateTime = new \DateTime();

        // @todo check cache
        $radio = $em->getRepository('AppBundle:Radio')->findOneBy(['codeName' => $codename, 'active' => true]);
        if (!$radio) {
            throw new NotFoundHttpException('Radio not found');
        }

        $scheduleManager = $this->get(ScheduleManager::class);
        $schedule = $scheduleManager->getRadioDaySchedule($dateTime, $codename);

        return $this->render('default/radio.html.twig', [
            'schedule' => $schedule,
            'radio' => $radio,
            'date' => $dateTime
        ]);
    }
}
