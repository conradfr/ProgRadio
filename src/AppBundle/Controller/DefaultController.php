<?php

namespace AppBundle\Controller;

use AppBundle\Service\ScheduleManager;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

class DefaultController extends Controller
{
    /**
     * @Route("/", name="homepage")
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
}
