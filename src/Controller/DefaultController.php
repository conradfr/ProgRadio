<?php

namespace App\Controller;

use App\Service\ScheduleManager;
use Doctrine\ORM\EntityManagerInterface;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;

class DefaultController extends AbstractController
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
    public function indexAction(EntityManagerInterface $em)
    {
        $radios = $em->getRepository('App:Radio')->getActiveRadios();
        $categories = $em->getRepository('App:Category')->getCategories();
        $collections = $em->getRepository('App:Collection')->getCollections();

        return $this->render('default/index.html.twig', [
            'radios' => $radios,
            'categories' => $categories,
            'collections' => $collections
        ]);
    }

    /**
     * @todo cache strategy
     *
     * @param array $data
     *
     * @return Response
     */
    protected function jsonResponse(array $data): Response {
        $response = new Response();
        $response->headers->set('Content-Type', 'application/json');

        $response->setContent(json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_NUMERIC_CHECK));

        return $response;
    }

    /**
     * @Route(
     *     "/schedule/{date}",
     *     name="schedule"
     * )
     * @ParamConverter("date", options={"format": "Y-m-d"})
     */
    public function scheduleAction(\DateTime $date, ScheduleManager $scheduleManager): Response
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
    public function radiosAction(EntityManagerInterface $em): response
    {
        $radios = $em->getRepository('App:Radio')->getActiveRadios();

        return $this->jsonResponse([
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
    public function radioAction($codename, EntityManagerInterface $em, ScheduleManager $scheduleManager)
    {
        $dateTime = new \DateTime();

        // @todo check cache
        $radio = $em->getRepository('App:Radio')->findOneBy(['codeName' => $codename, 'active' => true]);
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

        $schedule = $em->getRepository('App:ScheduleEntry')->getTimeSpecificSchedule($dateTime);
        $collections = $em->getRepository('App:Collection')->getCollections();

        return $this->render('default/now.html.twig', [
            'schedule' => $schedule,
            'collections' => $collections,
            'date' => $dateTime,
        ]);
    }
}
