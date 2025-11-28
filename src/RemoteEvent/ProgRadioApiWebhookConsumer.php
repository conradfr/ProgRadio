<?php

namespace App\RemoteEvent;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\RemoteEvent\Attribute\AsRemoteEventConsumer;
use Symfony\Component\RemoteEvent\Consumer\ConsumerInterface;
use Symfony\Component\RemoteEvent\RemoteEvent;
use Symfony\Contracts\Translation\TranslatorInterface;
use Symfony\Component\Translation\LocaleSwitcher;

#[AsRemoteEventConsumer('progradio_api')]
final class ProgRadioApiWebhookConsumer implements ConsumerInterface
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly MailerInterface $mailer,
        private readonly TranslatorInterface $translator,
        private readonly LocaleSwitcher $localeSwitcher,
        private readonly LoggerInterface $logger,
    ) {
    }

    public function consume(RemoteEvent $event): void
    {
        $payload = $event->getPayload();

        switch ($payload['event']) {
            case 'send_user_stream_stats':
                $this->handleSendUserStreamStats($payload);
                break;
        }
    }

    protected function handleSendUserStreamStats(array $payload): void
    {
        /** @var User $user */
        $user = $this->entityManager->getRepository(User::class)->find($payload['user_id']);
        if (!$user) {
            $this->logger->error('Error sending stats email from webhook, user not found: ' . $payload['user_id']);
            return;
        }

        $this->logger->info('Sending stats email from webhook, user: ' . $user->getId());

        $this->localeSwitcher->runWithLocale($user->getLocale() ?? 'en', function() use ($user, $payload) {
            $email = (new TemplatedEmail())
                ->from($_ENV['EMAIL_FROM'])
                ->to($user->getEmail())
                ->subject($this->translator->trans('stream_stats.subject', [], 'email'))
                ->htmlTemplate('emails/user_stream_stats.html.twig')
                ->context(
                    [
                        'stats' => $payload['stats'],
                        'user_email' => $user->getEmail(),
                        'user_locale' => $user->getLocale() ?? 'en',
                    ]
                );

            $this->mailer->send($email);
        });
    }
}
