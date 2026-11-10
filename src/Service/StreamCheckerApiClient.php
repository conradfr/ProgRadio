<?php

declare(strict_types=1);

namespace App\Service;

use Psr\Log\LoggerInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\ResponseInterface;

class StreamCheckerApiClient
{
    protected const string BASE_URL_STRING = '%s/api';

    public function __construct(
        private HttpClientInterface $httpClient,
        protected LoggerInterface $logger,
        protected string $kernelEnvironment,
        private string $streamCheckerApiDomain,
        private string $streamCheckerApiKey,
    ) {
    }

    public function checkUrl(string $url): ?array
    {
        $data = [
            'url' => $url,
        ];

        try {
            $response = $this->request('/check', 'POST', $data);

            if ($response->getStatusCode() !== 200) {
                return null;
            }

            return $response->toArray();
        } catch (\Exception $e) {
            $this->logger->warning('StreamChecker client error', ['exception' => $e]);
        }

        return null;
    }

    // ------------------------- REQUEST -------------------------

    protected function request(string $path, string $method, mixed $data = null): ResponseInterface
    {
        return $this->httpClient->request(
            $method,
            $this->getBaseUrl().$path, [
                'headers' => [
                    'x-api-key' => $this->streamCheckerApiKey,
                    'Accept' => 'application/json',
                ],
                'json' => $data ?? null,
                // for self-signed certificates in dev
                'verify_peer' => $this->kernelEnvironment !== 'dev',
                'verify_host' => $this->kernelEnvironment !== 'dev',
            ]
        );
    }

    protected function getBaseUrl(): string
    {
        return sprintf(self::BASE_URL_STRING, $this->streamCheckerApiDomain);
    }
}
