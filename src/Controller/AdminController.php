<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Collection;
use App\Entity\ListeningSession;
use App\Entity\Radio;
use App\Entity\RadioStream;
use App\Entity\Stream;
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
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[IsGranted('ROLE_ADMIN')]
class AdminController extends AbstractBaseController
{
    #[Route('/admin', name: 'admin')]
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

    #[Route('/admin/listening/webcount', name: 'admin_listening_webcount')]
    public function listeningWebCount(EntityManagerInterface $em): Response
    {
        $count = $em->getRepository(ListeningSession::class)->getCurrent();

        return $this->jsonResponse([
            'count' => $count
        ]);
    }

    #[Route('/admin/listening/{dateRange}/{countryCode}', name: 'admin_listening', requirements: ['dateRange' => '\w+'])]
    public function listeningAction(DateUtils $dateUtils, EntityManagerInterface $em, Request $request, string $dateRange='today', ?string $countryCode=null): Response
    {
        $dates = $dateUtils->getDatesFromRelativeFormat($dateRange);

        if ($dates === null) {
            throw new BadRequestHttpException('Invalid data');
        }

        // RADIOS

        $radioListening = $em->getRepository(ListeningSession::class)->getRadiosData($dates[0], $dates[1], $countryCode);
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

        $streamListening = $em->getRepository(ListeningSession::class)->getStreamsData($dates[0], $dates[1], $countryCode);
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
        $stream = $em->getRepository(Stream::class)->find($streamId);

        if (!$streamOverloading) {
            $streamOverloading = new StreamOverloading();
            $streamOverloading->setId($streamId);
        }

        $form = $this->createForm(StreamOverloadingType::class, $streamOverloading);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $em->persist($form->getData());
            $em->flush();

            $streamOverloading = $em->getRepository(StreamOverloading::class)->find($streamId);

            $stream->setPlayingError(0);

            // push change now instead of waiting for the stream import cron
            // omit picture as it can't be done in the Symfony app

            if ($streamOverloading->getStreamUrl() !== null) {
                $stream->setStreamUrl($streamOverloading->getStreamUrl());
            }

            if ($streamOverloading->getCountryCode() !== null) {
                $stream->setCountryCode($streamOverloading->getCountryCode());
            }

            if ($streamOverloading->getName() !== null) {
                $stream->setName($streamOverloading->getName());
            }

            if ($streamOverloading->getWebsite() !== null) {
                $stream->setWebsite($streamOverloading->getWebsite());
            }

            $stream->setEnabled($streamOverloading->getEnabled());

            $em->flush();

            $this->addFlash(
                'success',
                "Stream overload has been updated."
            );
        }

        return $this->render('default/admin/stream_overloading.html.twig',
            [
                'stream' => $stream,
                'form' => $form->createView()
            ]
        );
    }

    #[Route('/admin/playing_errors', name: 'admin_playing_errors')]
    public function playingErrorsAction(EntityManagerInterface $em): Response
    {
        $errors = $em->getRepository(Stream::class)->getStreamsWithPlayingError();

        return $this->render('default/admin/playing_error.html.twig', [
            'errors' => $errors,
        ]);
    }

    #[Route('/admin/shares', name: 'admin_shares')]
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
            $q = $em->createQuery('select r from ' . Radio::class .' r');
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

    #[Route('/admin/goaccess', name: 'admin_goaccess')]
    public function goaccess(): Response
    {
        return $this->render('default/admin/goaccess.html.twig');
    }

    #[Route('/admin/goaccessiframe', name: 'admin_goaccess_iframe')]
    public function goaccessiframe(): Response
    {
        return $this->render('default/admin/goaccessiframe.html.twig');
    }

    #[Route('/reset_stream_playing_error/{id}', name: 'admin_reset_stream_paying_error')]
    public function resetStreamPlayingErrors(Stream $stream, EntityManagerInterface $em): Response
    {
        $stream->setPlayingError(0);

        $em->persist($stream);
        $em->flush();

        return $this->redirectToRoute('admin_playing_errors', [], 301);
    }

    #[Route('/reset_all_stream_playing_errors', name: 'admin_reset_all_stream_paying_errors')]
    public function resetAllStreamPlayingErrors(EntityManagerInterface $em): Response
    {
        $em->getRepository(Stream::class)->resetAllPlayingErrors();

        return $this->redirectToRoute('admin_playing_errors', [], 301);
    }

    #[Route('/reset_stream/{id}', name: 'admin_reset_stream_retries')]
    public function resetStreamRetries(RadioStream $radioStream, EntityManagerInterface $em): Response
    {
        $radioStream->setRetries(0);
        $radioStream->setStatus(true);

        $em->persist($radioStream);
        $em->flush();

        return $this->redirectToRoute('admin', [], 301);
    }

    #[Route('/reset_current_song/{id}', name: 'admin_reset_current_song_retries')]
    public function resetCurrentSongRetries(RadioStream $radioStream, EntityManagerInterface $em): Response
    {
        $radioStream->setCurrentSongRetries(0);
//        $radioStream->setCurrentSong(true);

        $em->persist($radioStream);
        $em->flush();

        return $this->redirectToRoute('admin', [], 301);
    }

    #[Route('/reset_current_song_all', name: 'admin_reset_current_song_retries_all')]
    public function resetCurrentSongRetriesAll(EntityManagerInterface $em): Response
    {
        $em->getRepository(RadioStream::class)->resetAllLiveSongErrors();

        return $this->redirectToRoute('admin', [], 301);
    }

    #[Route('/delete_picture/{id}', name: 'admin_delete_stream_picture')]
    public function deletePicture(Stream $stream, EntityManagerInterface $em, Request $request): Response
    {
        $streamOverloading = new StreamOverloading();
        $streamOverloading->setId($stream->getId());

        $form = $this->createForm(StreamOverloadingType::class, $streamOverloading);
        $form->handleRequest($request);

        if (!empty($stream->getImg())) {
            $filename = getcwd() . '/media/stream/' . $stream->getImg();

            if (file_exists($filename)) {
                unlink($filename);
            }

            $stream->setImg(null);

            $em->persist($stream);
            $em->flush();

            $this->addFlash(
                'success',
                'Stream picture has been deleted.'
            );
        } else {
            $this->addFlash(
                'error',
                'No picture to delete.'
            );
        }

        return $this->redirectToRoute('admin_overloading', ['streamId' => $stream->getId()], 301);
    }
}
