<?php

namespace App\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Doctrine\ORM\EntityManagerInterface;

class AdminController extends Controller
{
    /**
     * @Route(
     *     "/admin",
     *     name="admin"
     * )
     */
    public function indexAction(EntityManagerInterface $em)
    {
        $stats = $em->getRepository('App:ScheduleEntry')->getStatsByDayAndRadio();

        return $this->render('default/admin.html.twig', ['stats' => $stats]
        );
    }
}
