<?php

declare(strict_types=1);

namespace App\EventListener;

use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class KernelExceptionListener
{
    public function onKernelException(ExceptionEvent $event): void
    {
        // only check master request
        if (!$event->isMasterRequest()) {
            return;
        }

        // get variables
        $exception = $event->getThrowable();
        $request = $event->getRequest();

        // replace Security Bundle 403 with Symfony 403
        if($exception instanceof AccessDeniedException && $request->isXmlHttpRequest()) {
            throw new AccessDeniedHttpException('Security error');
        }
    }
}
