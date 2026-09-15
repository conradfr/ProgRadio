<?php

declare(strict_types=1);

namespace App\EventListener;

use App\Entity\User;
use Doctrine\DBAL\Connection;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpKernel\Event\RequestEvent;

class UserActivityListener
{
    /*
     * As we have long connected sessions w/ remember me we update on activity rather than login.
     * But we only update it every n minutes
     * We don't need more granularity for now
     *
     * After some time we may switch to the less costly on login listener.
     */
    private const int THROTTLE_MINUTES = 60;

    public function __construct(
        private readonly Security $security,
        private readonly Connection $connection,
    ) {
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        // only check master request
        if (!$event->isMainRequest()) {
            return;
        }

        $user = $this->security->getUser();

        if (!$user instanceof User) {
            return;
        }

        $now = new \DateTime();
        $lastConnectedAt = $user->getLastConnectedAt();

        if ($lastConnectedAt !== null
            && $lastConnectedAt > (clone $now)->modify('-' . self::THROTTLE_MINUTES . ' minutes')) {
            return;
        }

        // Written straight through DBAL on purpose: flushing the entity would
        // trigger its Gedmo\Timestampable(on: 'update') and bump updated_at too.
        $this->connection->executeStatement(
            'UPDATE "user" SET last_connected_at = :now WHERE id = :id',
            ['now' => $now->format('Y-m-d H:i:s'), 'id' => $user->getId()]
        );

        $user->setLastConnectedAt($now);
    }
}
