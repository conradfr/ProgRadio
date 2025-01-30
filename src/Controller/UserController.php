<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Stream;
use App\Entity\UserEmailChange;
use App\Form\StoreHistoryType;
use App\Form\StreamSubmissionType;
use App\Form\UpdateEmailType;
use App\Form\UpdatePasswordType;
use App\Service\Host;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\Common\Collections\ArrayCollection;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Contracts\Translation\TranslatorInterface;
use Symfony\Component\Uid\Uuid;

#[Route('/my-account')]
#[IsGranted('ROLE_USER')]
class UserController extends AbstractBaseController
{
    protected const SESSION_DELETE_ATTR = 'delete-id';

    public function __construct(private RequestStack $requestStack) { }

    #[Route('/{_locale}/', name: 'user_page')]
    public function index(Request $request): Response
    {
        return $this->redirectToRoute('user_page_email');
    }

    #[Route('/{_locale}/email', name: 'user_page_email')]
    public function emailChange(Host $host, Request $request, EntityManagerInterface $em, MailerInterface $mailer, TranslatorInterface $translator): Response
    {
        /** @var \App\Entity\User $user */
        $user = $this->getUser();
        $userEmailChange = new UserEmailChange();
        $userEmailChange->setEmail($user->getEmail());
        $success = false;

        $form = $this->createForm(UpdateEmailType::class, $user);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $success = true;

            // only do all the work if emails are different
            if ($user->getEmail() !== $userEmailChange->getEmail()) {
                $userEmailChange->setUser($user);
                $userEmailChange->generateToken();
                $userEmailChange->setTokenExpiration();

                $em->persist($userEmailChange);
                $em->persist($user);
                $em->flush();

                // email

                $from = $host->getField('name_host', $request) . ' <noreply@' . $host->getRootDomain($request) . '>';

                // to new address
                $email = (new TemplatedEmail())
                    ->from($from)
                    ->to($user->getEmail())
                    ->subject($translator->trans('email_change.subject', ['%name%' => $host->getField('name_host', $request)], 'email'))
                    ->htmlTemplate('emails/user_email_change_new.html.twig')
                    ->context(
                        [
                            'token' => $userEmailChange->getToken(),
                            'new_email' => $user->getEmail(),
                            'name' => $host->getField('name_host', $request),
                            'url' => $host->getField('url', $request),
                            'user_locale' => $request->getLocale()
                        ]
                    );

                $mailer->send($email);

                // to old address
                $email = (new TemplatedEmail())
                    ->from($from)
                    ->to($userEmailChange->getEmail())
                    ->subject($translator->trans('email_change.subject', ['%name%' => $host->getField('name_host', $request)], 'email'))
                    ->htmlTemplate('emails/user_email_change.html.twig')
                    ->context(
                        [
                            'token' => $userEmailChange->getToken(),
                            'old_email' => $userEmailChange->getEmail(),
                            'new_email' => $user->getEmail(),
                            'name' => $host->getField('name_host', $request),
                            'url' => $host->getField('url', $request),
                            'user_locale' => $request->getLocale()
                        ]
                    );

                $mailer->send($email);
            }
        }

        return $this->render('default/user/email.html.twig', [
            'form' => $form->createView(),
            'success' => $success
        ]);
    }

    #[Route('/{_locale}/password', name: 'user_page_password')]
    public function passwordUpdate(
        Host $host,
        Request $request,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $passwordHasher,
        TranslatorInterface $translator,
        MailerInterface  $mailer): Response
    {
        /** @var \App\Entity\User $user */
        $user = $this->getUser();
        $success = false;

        $form = $this->createForm(UpdatePasswordType::class, $user);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $plaintextPassword = $form->get('plainPassword')->getData();
            // encode the plain password
            $hashedPassword = $passwordHasher->hashPassword(
                $user,
                $plaintextPassword
            );
            $user->setPassword($hashedPassword);

            $user->generatePasswordResetToken();
            $user->setPasswordResetExpiration();

            $em->persist($user);
            $em->flush();

            $success = true;

            // email

            $from = $host->getField('name_host', $request) . ' <noreply@' . $host->getRootDomain($request) . '>';
            $email = (new TemplatedEmail())
                ->from($from)
                ->to($user->getEmail())
                ->subject($translator->trans('password_update.subject', ['%name%' => $host->getField('name_host', $request)], 'email'))
                ->htmlTemplate('emails/user_password_update.html.twig')
                ->context(
                    [
                        'token' => $user->getPasswordResetToken(),
                        'name' => $host->getField('name_host', $request),
                        'url' => $host->getField('url', $request),
                        'user_locale' => $request->getLocale()
                    ]
                );

            $mailer->send($email);
        }

        return $this->render('default/user/password.html.twig', [
            'form' => $form->createView(),
            'success' => $success
        ]);
    }

    #[Route('/{_locale}/preferences', name: 'user_page_preferences')]
    public function preferences(Request $request, EntityManagerInterface $em,): Response
    {
        /** @var \App\Entity\User $user */
        $user = $this->getUser();

        $form = $this->createForm( StoreHistoryType::class, $user);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $user->setStreamsHistory(new ArrayCollection());

            $em->persist($user);
            $em->flush();
        }
        return $this->render('default/user/preferences.html.twig', [
            'form' => $form
        ]);
    }

    #[Route('/{_locale}/reset-history', name: 'user_page_reset_history')]
    public function resetHistory(EntityManagerInterface $em, TranslatorInterface $translator): Response
    {
        /** @var \App\Entity\User $user */
        $user = $this->getUser();

        $user->setStreamsHistory(new ArrayCollection());

        $em->persist($user);
        $em->flush();

        $this->addFlash(
            'success',
            $translator->trans('page.account.preferences.reset_confirmed')
        );

        return $this->redirectToRoute('user_page_preferences');
    }

    #[Route('/{_locale}/radios/{id?}', name: 'user_page_streams')]
    public function submission(Request $request, EntityManagerInterface $em, TranslatorInterface $translator, Stream $stream = null): Response
    {
        $edit = true;

        if (!$stream) {
            $stream = new Stream();
            $edit = false;
        }

        $form = $this->createForm(StreamSubmissionType::class, $stream);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $stream = $form->getData();

            if ($edit === false) {
                $uuid = Uuid::v4();
                $stream->setId($uuid);
            }

            $stream->setSource(Stream::SOURCE_PROGRADIO);

            /** @var \App\Entity\User $user */
            $user = $this->getUser();

            $stream->setUser($user);

            // For some reason stream id is set to null if we flush with $em->flush() on insert;
            // So let's do it manually
            // (lost too many hours on this)

            if ($edit === true) {
                $em->persist($stream);
                $em->flush();
            } else {
                $em->getRepository(Stream::class)->insertNewStream($stream);
            }

            $this->addFlash(
                'success',
                $edit ? $translator->trans('page.stream.submission.success_edit') : $translator->trans('page.stream.submission.success_new')
            );

            return $this->redirectToRoute('user_page_streams', ['id' => $stream->getId()]);
        }

        return $this->render('default/user/stream.html.twig',
            [
                'edit' => $edit,
                'stream' => $stream,
                'form' => $form->createView()
            ]
        );
    }

    #[Route('/{_locale}/radios_delete/{id}', name: 'user_page_streams_delete')]
    public function submissionDelete(Request $request, EntityManagerInterface $em, TranslatorInterface $translator, Stream $stream): Response
    {
        /** @var \App\Entity\User $user */
        $user = $this->getUser();

        $user->removeStream($stream);

        $em->remove($stream);
        $em->persist($user);
        $em->flush();

        $this->addFlash(
            'success',
            $translator->trans('page.stream.submission.success_delete')
        );

        return $this->redirectToRoute('user_page_streams', []);
    }

    #[Route('/{_locale}/delete', name: 'user_page_delete')]
    public function delete(): Response
    {
        $token = uniqid();
        $session = $this->requestStack->getSession();
        $session->set(self::SESSION_DELETE_ATTR, $token);

        return $this->render('default/user/delete.html.twig', [
            'token' => $token
        ]);
    }

    #[Route('/{_locale}/delete/confirm/{token}', name: 'user_page_delete_confirm')]
    public function deleteConfirm(string $token, EntityManagerInterface $em): Response
    {
        $session = $this->requestStack->getSession();
        if ($token !== $session->get(self::SESSION_DELETE_ATTR)) {
            throw new \Exception('Error');
        }

        $session->remove(self::SESSION_DELETE_ATTR);

        /** @var \App\Entity\User $user */
        $user = $this->getUser();

        $em->remove($user);
        $em->flush();

        $session->clear();
        $session->invalidate();

        return $this->redirectToRoute('user_deleted');
    }
}
