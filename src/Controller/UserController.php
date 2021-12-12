<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\UserEmailChange;
use App\Form\UpdateEmailType;
use App\Form\UpdatePasswordType;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Response;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * @Route("/my-account")
 *
 * @IsGranted("ROLE_USER")
 */
class UserController extends AbstractBaseController
{
    protected const SESSION_DELETE_ATTR = 'delete-id';

    public function __construct(private RequestStack $requestStack) { }

    /**
     * @Route(
     *     "/{_locale}/",
     *     name="user_page",
     * )
     */
    public function index(Request $request): Response
    {
        return $this->redirectToRoute('user_page_email');
    }

    /**
     * @Route(
     *     "/{_locale}/email",
     *     name="user_page_email",
     * )
     */
    public function emailChange(Request $request, EntityManagerInterface $em, MailerInterface  $mailer): Response
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

                $from = $this->getParameter('email_from');

                // to new address
                $email = (new TemplatedEmail())
                    ->from($from)
                    ->to($user->getEmail())
                    ->subject("Programmes-Radio.com - Modification de l'adresse email")
                    ->htmlTemplate('emails/user_email_change_new.html.twig')
                    ->context(
                        [
                            'token' => $userEmailChange->getToken(),
                            'new_email' => $user->getEmail()
                        ]
                    );

                $mailer->send($email);

                // to old address
                $email = (new TemplatedEmail())
                    ->from($from)
                    ->to($userEmailChange->getEmail())
                    ->subject("Programmes-Radio.com - Modification de l'adresse email")
                    ->htmlTemplate('emails/user_email_change.html.twig')
                    ->context(
                        [
                            'token' => $userEmailChange->getToken(),
                            'old_email' => $userEmailChange->getEmail(),
                            'new_email' => $user->getEmail()
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

    /**
     * @Route(
     *     "/{_locale}/password",
     *     name="user_page_password",
     * )
     */
    public function passwordUpdate(
        Request $request,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $passwordHasher,
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

            $from = $this->getParameter('email_from');
            $email = (new TemplatedEmail())
                ->from($from)
                ->to($user->getEmail())
                ->subject("Programmes-Radio.com - Modification du mot de passe")
                ->htmlTemplate('emails/user_password_update.html.twig')
                ->context(
                    [
                        'token' => $user->getPasswordResetToken()
                    ]
                );

            $mailer->send($email);
        }

        return $this->render('default/user/password.html.twig', [
            'form' => $form->createView(),
            'success' => $success
        ]);
    }

    /**
     * @Route(
     *     "/{_locale}/delete",
     *     name="user_page_delete",
     * )
     */
    public function delete(): Response
    {
        $token = uniqid();
        $session = $this->requestStack->getSession();
        $session->set(self::SESSION_DELETE_ATTR, $token);

        return $this->render('default/user/delete.html.twig', [
            'token' => $token
        ]);
    }

    /**
     * @Route(
     *     "/{_locale}/delete/confirm/{token}",
     *     name="user_page_delete_confirm",
     * )
     */
    public function deleteConfirm(string $token, Request $request, EntityManagerInterface $em): Response
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
