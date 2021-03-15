<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Collection;
use App\Entity\ListeningSession;
use App\Entity\Radio;
use App\Entity\RadioStream;
use App\Entity\ScheduleEntry;
use App\Entity\User;
use App\Form\SharesType;
use App\Service\DateUtils;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Doctrine\ORM\EntityManagerInterface;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;

/**
 * @IsGranted("ROLE_ADMIN")
 */
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
        $radios = $em->getRepository(Radio::class)->getActiveRadiosFull();
        $stats = $em->getRepository(ScheduleEntry::class)->getStatsByDayAndRadio();
        $radioStreamsStatus = $em->getRepository(RadioStream::class)->getStreamsStatus();
        $users = $em->getRepository(User::class)->lastNAccounts();
        $userCount = $em->getRepository(User::class)->count([]);

        return $this->render('default/admin/dashboard.html.twig', [
            'radios' => $radios,
            'stats' => $stats,
            'users' => $users,
            'radio_streams_status' => $radioStreamsStatus,
            'userCount' => $userCount
        ]);
    }

    /**
     * @Route(
     *     "/admin/listening/radios/{dateRange}",
     *     requirements={"dateRange"="\w+"},
     *     name="admin_listening_radios"
     * )
     */
    public function listeningRadiosAction(DateUtils $dateUtils, EntityManagerInterface $em, string $dateRange='yesterday'): Response
    {
        $dates = $dateUtils->getDatesFromRelativeFormat($dateRange);

        if ($dates === null) {
            throw new BadRequestHttpException('Invalid data');
        }

        $radioListening = $em->getRepository(ListeningSession::class)->getRadiosData($dates[0], $dates[1]);
        $radioListeningDevices = $em->getRepository(ListeningSession::class)->getPerDeviceRadiosData($dates[0], $dates[1]);
        $collections = $em->getRepository(Collection::class)->getCollections();
        $collections = array_filter($collections, function($collection) {
            return $collection['code_name'] !== Radio::FAVORITES;
        });

        // format data for easy displaying (should be done elsewhere but lazy)

        $radioListeningInCollections = [];
        foreach ($radioListening as $rl) {
            $radioListeningInCollections[$rl['c_codeName']][] = $rl;
        }

        $collectionsSessions = [];
        $i = 0;
        $t = 0;
        do {
            foreach ($collections as $collection) {
                if (isset($radioListeningInCollections[$collection['code_name']][$i])) {
                    $collectionsSessions[$i][] = $radioListeningInCollections[$collection['code_name']][$i];
                    $t++;
                } else {
                    $collectionsSessions[$i][] = 'empty';
                }
            }
            $i++;
        } while ($t < count($radioListening));

        // sums

        $sessionsSum = array_map(function ($collection) {
            return array_reduce($collection, function($acc, $radio) {
                $acc['total_seconds'] += $radio['total_seconds'];
                $acc['total_sessions'] += $radio['total_sessions'];
                return $acc;
            }, ['total_seconds' => 0, 'total_sessions' => 0]);
        } , $radioListeningInCollections);

        $sessionsTotal =  array_reduce($sessionsSum, function($acc, $collection) {
            $acc['total_seconds'] += $collection['total_seconds'];
            $acc['total_sessions'] += $collection['total_sessions'];
            return $acc;
        }, ['total_seconds' => 0, 'total_sessions' => 0]);

        return $this->render(
            'default/admin/listening_radios.html.twig', [
            'collections_admin' => $collections,
            'radio_listening' => $radioListening,
            'collections_sessions' => $collectionsSessions,
            'sessions_sum' => $sessionsSum,
            'sessions_device' => $radioListeningDevices,
            'sessions_total' => $sessionsTotal,
            'dateStart' => $dates[0],
            'dateEnd' => $dates[1],
            'dateRange' => $dateRange
        ]);
    }

    /**
     * @Route(
     *     "/admin/listening/streams/{dateRange}",
     *     requirements={"dateRange"="\w+"},
     *     name="admin_listening_streams"
     * )
     */
    public function listeningStreamsAction(DateUtils $dateUtils, EntityManagerInterface $em, string $dateRange='yesterday'): Response
    {
        $dates = $dateUtils->getDatesFromRelativeFormat($dateRange);

        if ($dates === null) {
            throw new BadRequestHttpException('Invalid data');
        }

        $streamListening = $em->getRepository(ListeningSession::class)->getStreamsData($dates[0], $dates[1]);

        return $this->render(
            'default/admin/listening_streams.html.twig', [
            'streams_listening' => $streamListening,
            'dateStart' => $dates[0],
            'dateEnd' => $dates[1],
            'dateRange' => $dateRange
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
