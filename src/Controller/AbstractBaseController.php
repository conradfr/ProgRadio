<?php

declare(strict_types=1);

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

class AbstractBaseController extends AbstractController
{
    /**
     * @todo cache strategy
     */
    protected function jsonResponse(array $data): Response
    {
        $response = new Response();
        $response->headers->set('Content-Type', 'application/json');

        $response->setContent(json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_NUMERIC_CHECK));

        return $response;
    }

    /**
     * @throws HttpException
     */
    protected function getJson(Request $request): mixed
    {
        $data = json_decode($request->getContent(), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new HttpException(400, 'Invalid json');
        }

        return $data;
    }
}
