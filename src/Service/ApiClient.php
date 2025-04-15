<?php

declare(strict_types=1);

namespace App\Service;

use Psr\Log\LoggerInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\ResponseInterface;

class ApiClient
{
    public function __construct(
        protected HttpClientInterface $client,
        protected LoggerInterface $logger,
        protected string $apiUrl,
        protected string $apiKey
    ) { }

    public function clearStreams(): bool
    {
        try {
            $response = $this->request('/cache/streams', 'DELETE');

            if ($response->getStatusCode() === 200) {
                return true;
            }

            return false;
        } catch (\Exception $e) {
            $this->logger->warning('Api client error', ['error' => $e->getMessage()]);
        }

        return false;
    }

    public function searchIndex(): bool
    {
        try {
            $response = $this->request('/search/index', 'GET');

            if ($response->getStatusCode() === 200) {
                return true;
            }

            return false;
        } catch (\Exception $e) {
            $this->logger->warning('Api client error', ['error' => $e->getMessage()]);
        }

        return false;
    }

    protected function request(string $path, string $method = 'GET', mixed $data = null): ResponseInterface
    {
        return $this->client->request(
            $method,
            $this->getBaseUrl() . $path, [
                'headers' => [
                    'X-Api-Key' => $this->apiKey,
                    'Accept' => 'application/json',
                ],
                'json' => $data ?? null,
            ]
        );
    }

    protected function getBaseUrl(): string
    {
        return sprintf('%s/admin', $this->apiUrl);
    }
}
