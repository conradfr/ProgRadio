<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Stream;
use App\Entity\User;
use App\Service\RadioBrowser;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;

/**
 * @Route("/streams")
 */
class StreamsController  extends AbstractBaseController
{
    protected const DEFAULT_RESULTS = 35;

    /**
     * @Route(
     *     "/list",
     *     name="streams_radios",
     * )
     */
    public function list(EntityManagerInterface $em, Request $request): Response
    {
        $favorites = $request->attributes->get('favoritesStream', []);
        $howMany = (int) $request->query->get('limit', self::DEFAULT_RESULTS);
        $offset = (int) $request->query->get('offset', 0);
        $country = $request->query->get('country', null);
        $sort = $request->query->get('sort', null);

        $streams = $em->getRepository(Stream::class)->getStreams($howMany, $offset, $country, $sort, $favorites);
        $totalCount = $em->getRepository(Stream::class)->countStreams($country, null, $favorites);

        return $this->jsonResponse([
                'streams' => $streams,
                'total'   => $totalCount,
            ]
        );
    }

    /**
     * @Route(
     *     "/config",
     *     name="streams_config",
     * )
     */
    public function config(RadioBrowser $radioBrowser): Response
    {
        $radioBrowserUrl = 'https://' . $radioBrowser->getOneRandomServer();

        return $this->jsonResponse([
                'radio_browser_url' => $radioBrowserUrl
            ]
        );
    }

    /**
     * @Route(
     *     "/random",
     *     name="streams_random",
     * )
     */
    public function random(EntityManagerInterface $em, Request $request): Response
    {
        $favorites = $request->attributes->get('favoritesStream', []);
        $country = $request->query->get('country', null);
        $language = $request->query->get('language', null);

        $stream = $em->getRepository(Stream::class)->getOneRandomStream($country, $language, $favorites);

        if ($stream === null) {
            throw new NotFoundHttpException('No stream');
        }

        return $this->jsonResponse([
                'stream' => $stream,
            ]
        );
    }

    /**
     * @Route(
     *     "/countries",
     *     name="streams_countries",
     * )
     */
    public function countries(RadioBrowser $radioBrowser): Response
    {
        $countries = $radioBrowser->getCountries();

        return $this->jsonResponse([
                'countries' => $countries,
            ]
        );
    }

    /**
     * @Route(
     *     "/favorites",
     *     name="streams_favorites",
     * )
     */
    public function favorites(Request $request): Response
    {
        /** @var User $user */
        $user = $this->getUser();

        $favorites = null;
        if ($user === null) {
            $favorites = $request->attributes->get('favoritesStream', []);
        }
        else {
            $favorites = $user->getFavoriteStreams()->map(
                function ($stream) {
                    return $stream->getId();
                }
            )->toArray();
        }

        return $this->jsonResponse([
                'favorites' => $favorites,
            ]
        );
    }

    /**
     * @Route(
     *     "/favorite/{id}",
     *     name="favorite_toggle"
     * )
     *
     * @IsGranted("ROLE_USER")
     */
    public function toggleFavorite(Stream $stream, EntityManagerInterface $em): Response
    {
        /** @var User $user */
        $user = $this->getUser();

        if ($user->getFavoriteStreams()->contains($stream)) {
            $user->removeFavoriteStream($stream);
        } else {
            $user->addFavoriteStream($stream);
        }

        $em->persist($user);
        $em->flush();

        return $this->jsonResponse([
            'count' => $user->getFavoriteStreams()->count()
        ]);
    }
}
