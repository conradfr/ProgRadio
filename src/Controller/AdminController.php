<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Collection;
use App\Entity\ListeningSession;
use App\Entity\Radio;
use App\Entity\RadioStream;
use App\Entity\Stream;
use App\Entity\StreamCheck;
use App\Entity\StreamOverloading;
use App\Entity\StreamSong;
use App\Entity\ScheduleEntry;
use App\Entity\StreamSuggestion;
use App\Entity\User;
use App\Entity\UserStream;
use App\Form\SharesType;
use App\Form\StreamOverloadingType;
use App\Service\ApiClient;
use App\Service\DateUtils;
use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Output\NullOutput;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\Routing\Attribute\Route;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[IsGranted('ROLE_ADMIN')]
class AdminController extends AbstractBaseController
{
    protected const STREAM_CHECK_PER_PAGE = 25;

    #[Route('/{_locale}/admin', name: 'admin')]
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

    #[Route('/{_locale}/admin/api/cache', name: 'admin_cache')]
    public function apiCacheAction(): Response
    {
        return $this->render('default/admin/api.html.twig', []);
    }

    #[Route('/{_locale}/admin/api/cache/streams', name: 'admin_cache_clear')]
    public function apiCacheClearAction(ApiClient $apiClient): Response
    {
        $cleared = $apiClient->clearStreams();

        if ($cleared) {
            $this->addFlash(
                'success',
                'Action has been completed.'
            );
        } else {
            $this->addFlash(
                'error',
                'An error occurred.'
            );
        }

        return $this->redirectToRoute('admin_cache', [], 301);
    }

    #[Route('/admin/listening/webcount', name: 'admin_listening_webcount')]
    public function listeningWebCount(EntityManagerInterface $em): Response
    {
        $count = $em->getRepository(ListeningSession::class)->getCurrent();

        return $this->jsonResponse([
            'count' => $count
        ]);
    }

    #[Route('/{_locale}/admin/listening/{dateRange}/{countryCode}', name: 'admin_listening', requirements: ['dateRange' => '\w+'])]
    public function listeningAction(EntityManagerInterface $em, Request $request, string $dateRange='today', ?string $countryCode=null): Response
    {
        $dates = DateUtils::getDatesFromRelativeFormat($dateRange);

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

    #[Route('/{_locale}/admin/overloading/{streamId}', name: 'admin_overloading')]
    public function streamOverloading(string $streamId, EntityManagerInterface $em, Request $request): Response
    {
        $streamOverloading = $em->getRepository(StreamOverloading::class)->find($streamId);
        $stream = $em->getRepository(Stream::class)->find($streamId);

        if (!$streamOverloading) {
            $streamOverloading = new StreamOverloading();
            $streamOverloading->setId($stream->getId());
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

            if ($streamOverloading->getTags() !== null) {
                $tags = $streamOverloading->getTags();
                $tags = strtolower($tags);
                $tags = str_replace(', ', ',', $tags);
                $stream->setTags($tags);
            }

            $stream->setEnabled($streamOverloading->getEnabled());
            $stream->setBanned($streamOverloading->getBanned());

            $stream->setForceHls($streamOverloading->getForceHls());
            $stream->setForceMpd($streamOverloading->getForceMpd());
            $stream->setPopup($streamOverloading->isPopup());

            if (!empty($form->get('redirect')->getData())) {
                $streamRedirect = $em->getRepository(Stream::class)->find($form->get('redirect')->getData());

                if ($streamRedirect) {
                    $userStreams = $em->getRepository(UserStream::class)->findBy(['stream' => $stream]);

                    // transfer the favorite to the correct stream, except if already exists
                    foreach ($userStreams as $userStream) {
                        $fav = $em->getRepository(UserStream::class)->findOneBy(['user' => $userStream->getUser(), 'stream' => $streamRedirect]);

                        if (!$fav) {
                            $user = $userStream->getUser();
                            $user->addStream($streamRedirect);

                            $em->persist($user);
                            $em->flush();
                        }

                        $em->remove($userStream);
                    }

                    $stream->setRedirectToStream($streamRedirect);
                }
            }

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

    #[Route('/{_locale}/admin/playing_errors/{threshold<\d+>?4}', name: 'admin_playing_errors')]
    #[Route('/{_locale}/admin/playing_errors/{threshold<\d+>?4}/{ceiling<\d+>?}', name: 'admin_playing_errors_ceiling')]
    public function playingErrorsAction(int $threshold, ?int $ceiling, EntityManagerInterface $em): Response
    {
        $errors = $em->getRepository(Stream::class)->getStreamsWithPlayingError($threshold, $ceiling);

        return $this->render('default/admin/playing_error.html.twig', [
            'errors' => $errors,
        ]);
    }

    #[Route('/{_locale}/admin/stream_suggestions/{id?}', name: 'admin_stream_suggestions')]
    #[Route('/{_locale}/admin/stream_suggestions/{id}/{field}',
        name: 'admin_stream_suggestions_commit',
        requirements: [
            'field' => 'name|img|streamUrl|website|tags'
        ])]
    public function streamSuggestionsAction(?StreamSuggestion $streamSuggestion, ?string $field, EntityManagerInterface $em): Response
    {
        $suggestions = $em->getRepository(StreamSuggestion::class)->getSuggestions();

        if (!$streamSuggestion && count($suggestions) > 0) {
            $streamSuggestion = $em->getRepository(StreamSuggestion::class)->find($suggestions[0]['id']);
        }

        if ($streamSuggestion && $field && call_user_func([$streamSuggestion, 'get' . ucfirst($field)], []) !== null) {
            $value = call_user_func([$streamSuggestion, 'get' . ucfirst($field)], []);

            $stream = $streamSuggestion->getStream();

            $streamOverloading = $em->getRepository(StreamOverloading::class)->find($stream->getId());
            if (!$streamOverloading) {
                $streamOverloading = new StreamOverloading();
                $streamOverloading->setId($stream->getId());
                $streamOverloading->setEnabled(true);
            }

            // img are not directly updated
            if ($field === 'img') {
                $streamOverloading->setImg($value);
            } else {
                call_user_func([$stream, 'set' . ucfirst($field)], $value);
                call_user_func([$streamOverloading, 'set' . ucfirst($field)], $value);

                $em->persist($stream);
            }

            $em->persist($streamOverloading);

            call_user_func([$streamSuggestion, 'set' . ucfirst($field)], null);

            $em->persist($streamSuggestion);

            // all empty: delete
            $removed = false;
            if ($streamSuggestion->getName() === null
            && $streamSuggestion->getImg() === null
            && $streamSuggestion->getStreamUrl() === null
            && $streamSuggestion->getWebsite() === null) {
                $em->remove($streamSuggestion);
                $removed = true;
            }

            $em->flush();

            if ($removed) {
                $streamSuggestion = null;
                return $this->redirectToRoute('admin_stream_suggestions', [], 301);
            } else {
                return $this->redirectToRoute('admin_stream_suggestions', ['id' => $streamSuggestion->getId()], 301);
            }
        }

        return $this->render('default/admin/stream_suggestions.html.twig', [
            'suggestions' => $suggestions,
            'stream_suggestion' => $streamSuggestion
        ]);
    }

    #[Route('/{_locale}/admin/delete_stream_suggestion/{id}', name: 'admin_stream_suggestion_delete')]
    public function deleteStreamSuggestionAction(StreamSuggestion $streamSuggestion, EntityManagerInterface $em): Response
    {
        $em->remove($streamSuggestion);
        $em->flush();

        return $this->redirectToRoute('admin_stream_suggestions', [], 301);
    }

    #[Route('/{_locale}/admin/stream_check', name: 'admin_stream_check')]
    public function playingStreamCheckAction(Request $request, EntityManagerInterface $em): Response
    {
        $pagination = $em->getRepository(Stream::class)->getStreamCheckListPagination(
            $request->query->getInt('page', 1),
            self::STREAM_CHECK_PER_PAGE,
        );

        return $this->render('default/admin/stream_check.html.twig', [
            'pagination' => $pagination
        ]);
    }

    #[Route('/{_locale}/admin/stream_check_commit_ssl/{id}', name: 'admin_stream_check_commit_ssl')]
    public function streamCheckCommitSsl(Stream $stream, EntityManagerInterface $em): Response
    {
        $streamOverloading = $stream->getStreamOverloading();

        if (!$streamOverloading) {
            $streamOverloading = new StreamOverloading();
            $streamOverloading->setId($stream->getId());
            $streamOverloading->setEnabled(true);

            $em->persist($streamOverloading);
            $em->flush();
        }

        $url = str_replace( 'http://', 'https://', $stream->getWebsite());

        $stream->setWebsite($url);
        $streamOverloading->setWebsite($url);

        $em->persist($stream);
        $em->persist($streamOverloading);

        $em->flush();

        return $this->jsonResponse([
                'stream_id' => $stream->getId(),
                'status'   => 'OK',
            ]
        );
    }

    #[Route('/{_locale}/admin/shares', name: 'admin_shares')]
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

    #[Route('/{_locale}/reset_stream_redirect/{id}', name: 'admin_reset_redirect')]
    public function resetStreamRedirect(Stream $stream, EntityManagerInterface $em): Response
    {
        $stream->setRedirectToStream(null);

        $em->persist($stream);
        $em->flush();

        return $this->redirectToRoute('admin_overloading', ['streamId' => $stream->getId()], 301);
    }

    #[Route('/{_locale}/reset_stream_playing_error/{id}', name: 'admin_reset_stream_paying_error')]
    public function resetStreamPlayingErrors(Stream $stream, EntityManagerInterface $em, Request $request): Response
    {
        $stream->setPlayingError(0);

        $em->persist($stream);
        $em->flush();

        if ($request->isXmlHttpRequest()) {
            return $this->jsonResponse([
                    'stream_id' => $stream->getId(),
                    'status'   => 'OK',
                ]
            );
        }

        return $this->redirectToRoute('admin_playing_errors', [], 301);
    }

    #[Route('/{_locale}/reset_all_stream_playing_errors', name: 'admin_reset_all_stream_paying_errors')]
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

    #[Route('/{_locale}/delete_picture/{id}', name: 'admin_delete_stream_picture')]
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
