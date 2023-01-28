<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Collection;
use App\Entity\ListeningSession;
use App\Entity\Radio;
use App\Entity\RadioStream;
use App\Entity\StreamOverloading;
use App\Entity\StreamSong;
use App\Entity\ScheduleEntry;
use App\Entity\User;
use App\Form\SharesType;
use App\Form\StreamOverloadingType;
use App\Service\DateUtils;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Routing\Annotation\Route;
use Doctrine\ORM\EntityManagerInterface;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;

/**
 * @IsGranted("ROLE_ADMIN")
 */
class AdminController extends AbstractBaseController
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
        $currentSongStatus = $em->getRepository(RadioStream::class)->getCurrentSongStatus();
        $streamSongStatus = $em->getRepository(StreamSong::class)->getCurrentSongStatus();
        $users = $em->getRepository(User::class)->lastNAccounts();
        $userCount = $em->getRepository(User::class)->count([]);

        return $this->render('default/admin/dashboard.html.twig', [
            'radios' => $radios,
            'stats' => $stats,
            'users' => $users,
            'radio_streams_status' => $radioStreamsStatus,
            'current_song_status' => $currentSongStatus,
            'stream_song_status' => $streamSongStatus,
            'userCount' => $userCount
        ]);
    }

    /**
     * @Route(
     *     "/admin/listening/webcount",
     *     name="admin_listening_webcount"
     * )
     */
    public function listeningWebCount(EntityManagerInterface $em): Response
    {
        $count = $em->getRepository(ListeningSession::class)->getCurrentWeb();

        return $this->jsonResponse([
            'count' => $count
        ]);
    }

    /**
     * @Route(
     *     "/admin/listening/{dateRange}",
     *     requirements={"dateRange"="\w+"},
     *     name="admin_listening"
     * )
     */
    public function listeningAction(DateUtils $dateUtils, EntityManagerInterface $em, Request $request, string $dateRange='today'): Response
    {
        $dates = $dateUtils->getDatesFromRelativeFormat($dateRange);

        if ($dates === null) {
            throw new BadRequestHttpException('Invalid data');
        }

        // RADIOS

        $radioListening = $em->getRepository(ListeningSession::class)->getRadiosData($dates[0], $dates[1]);
        $radioListeningDevices = $em->getRepository(ListeningSession::class)->getPerDeviceData($dates[0], $dates[1]);
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

        $sessionsRadiosSum = array_map(function ($collection) {
            return array_reduce($collection, function($acc, $radio) {
                $acc['total_seconds'] += $radio['total_seconds'];
                $acc['total_sessions'] += $radio['total_sessions'];
                return $acc;
            }, ['total_seconds' => 0, 'total_sessions' => 0]);
        } , $radioListeningInCollections);

        $sessionsRadiosTotal =  array_reduce($sessionsRadiosSum, function($acc, $collection) {
            $acc['total_seconds'] += $collection['total_seconds'];
            $acc['total_sessions'] += $collection['total_sessions'];
            return $acc;
        }, ['total_seconds' => 0, 'total_sessions' => 0]);

        // STREAMS

        $streamListening = $em->getRepository(ListeningSession::class)->getStreamsData($dates[0], $dates[1]);
        $streamListeningDevices = $em->getRepository(ListeningSession::class)->getPerDeviceData($dates[0], $dates[1], 'stream');

        $sessionsStreamsTotal =  array_reduce($streamListening, function($acc, $ls) {
            $acc['total_seconds'] += $ls['total_seconds'];
            $acc['total_sessions'] += $ls['total_sessions'];
            return $acc;
        }, ['total_seconds' => 0, 'total_sessions' => 0]);

        return $this->render(
            'default/admin/listening.html.twig', [
            'collections_admin' => $collections,
            'radio_listening' => $radioListening,
            'radio_collections_listening' => $radioListeningInCollections,
            'streams_listening' => $streamListening,
            'collections_sessions' => $collectionsSessions,
            'sessions_radios_sum' => $sessionsRadiosSum,
            'sessions_radios_device' => $radioListeningDevices,
            'sessions_radios_total' => $sessionsRadiosTotal,
            'sessions_streams_device' => $streamListeningDevices,
            'sessions_streams_total' => $sessionsStreamsTotal,
            'dateStart' => $dates[0],
            'dateEnd' => $dates[1],
            'dateRange' => $dateRange,
            'old_view' => $request->query->get('old', null) !== null
        ]);
    }

    #[Route('/admin/overloading/{streamId}', name: 'admin_overloading')]
    public function streamOverloading(string $streamId, EntityManagerInterface $em, Request $request): Response
    {
        $streamOverloading = $em->getRepository(StreamOverloading::class)->find($streamId);

        if (!$streamOverloading) {
            $streamOverloading = new StreamOverloading();
            $streamOverloading->setId($streamId);
        }

        $form = $this->createForm(StreamOverloadingType::class, $streamOverloading);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $em->persist($form->getData());
            $em->flush();

            $this->addFlash(
                'success',
                "Stream overload has been updated."
            );
        }

        return $this->render('default/admin/stream_overloading.html.twig',['form' => $form->createView()]);
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

    /**
     * @Route(
     *     "/admin/goaccess",
     *     name="admin_goaccess"
     * )
     */
    public function goaccess(): Response
    {
        return $this->render('default/admin/goaccess.html.twig');
    }

    /**
     * @Route(
     *     "/admin/goaccessiframe",
     *     name="admin_goaccess_iframe"
     * )
     */
    public function goaccessiframe(): Response
    {
        return $this->render('default/admin/goaccessiframe.html.twig');
    }
}
