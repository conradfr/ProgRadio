<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Radio;
use App\Entity\Stream;
use App\Entity\User;
use App\Service\DateUtils;
use App\Service\RadioBrowser;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/streams')]
class StreamsController  extends AbstractBaseController
{
    public const int DEFAULT_RESULTS = 48;

    #[Route('/list', name: 'streams_radios')]
    public function list(EntityManagerInterface $em, Request $request): Response
    {
        $favorites = $request->attributes->get('favoritesStream', []);
        $radioId = $request->query->get('radio', null);
        $howMany = (int) $request->query->get('limit', (string) self::DEFAULT_RESULTS);
        $offset = (int) $request->query->get('offset', "0");
        $country = $request->query->get('country', null);
        $sort = $request->query->get('sort', null);

        if ($radioId !== null) {
            $streams = [$em->getRepository(Stream::class)->getOneSpecificStream($radioId)];
            $totalCount = 0;
        } else {
            $streams = $em->getRepository(Stream::class)->getStreams($howMany, $offset, $country, $sort, $favorites);
            $totalCount = $em->getRepository(Stream::class)->countStreams($country, null, $favorites);
        }

        return $this->jsonResponse([
                'streams' => $streams,
                'total'   => $totalCount,
            ]
        );
    }

    #[Route('/search', name: 'streams_radios_search')]
    public function search(EntityManagerInterface $em, Request $request): Response
    {
        $text = $request->query->get('text');

        if ($text === null || !is_string($text)) {
            throw new BadRequestHttpException('no text');
        }

        $favorites = $request->attributes->get('favoritesStream', []);
        $howMany = (int) $request->query->get('limit', (string) self::DEFAULT_RESULTS);
        $offset = (int) $request->query->get('offset',"0");
        $country = $request->query->get('country', null);
        $sort = $request->query->get('sort', null);

        $streams = $em->getRepository(Stream::class)->searchStreams(trim($text), $howMany, $offset, $country, $sort, $favorites);
        $totalCount = $em->getRepository(Stream::class)->countSearchStreams(trim($text), $country, null, $favorites);

        return $this->jsonResponse([
                'streams' => $streams,
                'total'   => $totalCount,
                'timestamp' => DateUtils::getMicroTime()
            ]
        );
    }

    #[Route('/bestradio/{codeName}', name: 'streams_best_radio')]
    public function bestRadio(string $codeName, EntityManagerInterface $em): Response
    {
        $radio = $em->getRepository(Radio::class)->findOneBy(['codeName' => $codeName]);

        if (!$radio) {
            throw new NotFoundHttpException('radio not found');
        }

        $stream =  $em->getRepository(Stream::class)->getBestStreamForRadio($radio);
        $streamToReturn = null;

        if ($stream !== null) {
            $streamToReturn = $em->getRepository(Stream::class)->getOneSpecificStream($stream->getId()->toRfc4122());
        }

        return $this->jsonResponse([
                'stream' => $streamToReturn
            ]
        );
    }

    // LEGACY
    #[Route('/config', name: 'streams_config')]
    public function config(RadioBrowser $radioBrowser): Response
    {
        $radioBrowserUrl = 'https://' . $radioBrowser->getOneRandomServer();

        return $this->jsonResponse([
                'radio_browser_url' => $radioBrowserUrl
            ]
        );
    }

    // LEGACY
    #[Route('/countries', name: 'streams_countries')]
    public function countries(RadioBrowser $radioBrowser, Request $request): Response
    {
        $locale = $request->query->get('locale', $this->getParameter('kernel.default_locale'));
        $countries = $radioBrowser->getCountries($locale);

        return $this->jsonResponse([
                'countries' => $countries,
            ]
        );
    }

    #[Route('/favorites', name: 'streams_favorites')]
    public function favorites(Request $request): Response
    {
        /** @var User|null $user */
        $user = $this->getUser();

        if ($user === null) {
            $favorites = $request->attributes->get('favoritesStream', []);
        }
        else {
            $favorites = $user->getFavoriteStreams()->map(
                function ($stream) {
                    return $stream->getId()->toRfc4122();
                }
            )->toArray();
        }

        return $this->jsonResponse([
                'favorites' => $favorites,
            ]
        );
    }

    #[Route('/favorite/{id}', name: 'streams_favorite_toggle')]
    #[IsGranted('ROLE_USER')]
    public function toggleFavorite(Stream $stream, EntityManagerInterface $em): Response
    {
        /** @var User $user */
        $user = $this->getUser();

        // Note: we link this stream to a radio if it's attached to a main radioStream

        if ($user->getFavoriteStreams()->contains($stream)) {
            $user->removeFavoriteStream($stream);

            if ($stream->hasMainRadioStream()) {
                $user->removeFavoriteRadio($stream->getRadioStream()->getRadio());
            }
        } else {
            $user->addFavoriteStream($stream);

            if ($stream->hasMainRadioStream()) {
                $user->addFavoriteRadio($stream->getRadioStream()->getRadio());
            }
        }

        $em->persist($user);
        $em->flush();

        return $this->jsonResponse([
            'count' => $user->getFavoriteStreams()->count()
        ]);
    }

    #[Route('/listened/{id}', name: 'streams_update_last_listened')]
    #[IsGranted('ROLE_USER')]
    public function updateLastListened(Stream $stream, EntityManagerInterface $em): Response
    {
        /** @var User $user */
        $user = $this->getUser();

        $em->getRepository(Stream::class)->insertOrUpdateStreamListening($user, $stream);

        return $this->jsonResponse([
            'status' => 'OK'
        ]);
    }
}
