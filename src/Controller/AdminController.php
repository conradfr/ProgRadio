<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Radio;
use App\Entity\ScheduleEntry;
use App\Form\SharesType;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Doctrine\ORM\EntityManagerInterface;

class AdminController extends AbstractController
{
    /**
     * @Route(
     *     "/admin",
     *     name="admin"
     * )
     */
    public function indexAction(EntityManagerInterface $em): Response
    {
        $radios = $em->getRepository(Radio::class)->findBy(['active' => true], ['id' => 'ASC']);
        $stats = $em->getRepository(ScheduleEntry::class)->getStatsByDayAndRadio();

        return $this->render('default/admin/dashboard.html.twig', [
            'radios' => $radios,
            'stats' => $stats
        ]);
    }

    /**
     * @Route(
     *     "/admin/shares",
     *     name="admin_shares"
     * )
     */
    public function shares(EntityManagerInterface $em, Request $request): Response
    {
        $dbData = $em->getRepository(Radio::class)->getNameAndShares();

        $data = array_column($dbData, 'share', 'codeName');
        $labels = array_column($dbData, 'name', 'codeName');

        $form = $this->createForm(SharesType::class, $data, ['labels' => $labels]);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $data = $form->getData();

            $batchSize = 20;
            $i = 0;
            $q = $em->createQuery('select r from App:Radio r');
            $iterableResult = $q->iterate();
            foreach ($iterableResult as $row) {
                /** @var Radio $radio */
                $radio = $row[0];
                $radio->setShare($data[$radio->getCodeName()]);
                if (($i % $batchSize) === 0) {
                    $em->flush(); // Executes all updates.
                    $em->clear(); // Detaches all objects from Doctrine!
                }
                ++$i;
            }
            $em->flush();

            $this->addFlash(
                'success',
                "$i radios mises à jour."
            );
        }

        return $this->render('default/admin/shares.html.twig', ['form' => $form->createView()]);
    }
}
