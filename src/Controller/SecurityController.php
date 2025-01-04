<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Radio;
use App\Entity\Stream;
use App\Entity\User;
use App\Entity\UserEmailChange;
use App\Form\ForgottenPasswordType;
use App\Form\RegistrationFormType;
use App\Form\UpdatePasswordType;
use App\Service\Host;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;
use Doctrine\Common\Collections\ArrayCollection;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class SecurityController extends AbstractController
{
    #[Route('/{_locale}/login', name: 'app_login')]
    public function login(AuthenticationUtils $authenticationUtils): Response
    {
        // if ($this->getUser()) {
        //     return $this->redirectToRoute('target_path');
        // }

        // get the login error if there is one
        $error = $authenticationUtils->getLastAuthenticationError();
        // last username entered by the user
        $lastUsername = $authenticationUtils->getLastUsername();

        return $this->render('security/login.html.twig', ['last_username' => $lastUsername, 'error' => $error]);
    }

    #[Route('/{_locale}/signup', name: 'app_register')]
    public function register(Host $host, Request $request, EntityManagerInterface $em, UserPasswordHasherInterface $passwordHasher, MailerInterface $mailer, TranslatorInterface $translator): Response
    {
        $user = new User();
        $form = $this->createForm(RegistrationFormType::class, $user);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $plaintextPassword = $form->get('plainPassword')->getData();
            // encode the plain password
            $hashedPassword = $passwordHasher->hashPassword(
                $user,
                $plaintextPassword
            );
            $user->setPassword($hashedPassword);

            $user->setRoles(['ROLE_USER']);

            // save radio favorites
            $favoritesFromCookies = $request->attributes->get('favorites', []);
            $favoriteRadios = $em->getRepository(Radio::class)->findBy(['codeName' => $favoritesFromCookies]);

            $user->setFavoriteRadios(new ArrayCollection($favoriteRadios));

            // save streaming favorites
            $favoritesFromCookies = $request->attributes->get('favoritesStream', []);
            $favoriteStreams = $em->getRepository(Stream::class)->findBy(['id' => $favoritesFromCookies]);

            $user->setFavoriteStreams(new ArrayCollection($favoriteStreams));

            $em->persist($user);
            $em->flush();

            // email
            $from = (string) $host->getField('name_host', $request) . ' <noreply@' . $host->getRootDomain($request) . '>';
            $email = (new TemplatedEmail())
                ->from($from)
                ->to($user->getEmail())
                ->subject($translator->trans('signup.subject', ['%name%' => $host->getField('name_host', $request)], 'email'))
                ->htmlTemplate('emails/signup.html.twig')
                ->context([
                    'url' => $host->getField('url', $request),
                    'name' => $host->getField('name_host', $request),
                    'user_locale' => $request->getLocale()
                ]);

            $mailer->send($email);

            //return $this->redirectToRoute('app');
            return $this->redirectToRoute('signup_success');
        }

        return $this->render('security/register.html.twig', [
            'registrationForm' => $form->createView(),
        ]);
    }

    #[Route('/{_locale}/forgotten-password', name: 'forgotten_password')]
    public function forgottenPassword(Host $host, Request $request, EntityManagerInterface $em, MailerInterface $mailer, TranslatorInterface $translator): Response
    {
        $userEmail = null;
        $form = $this->createForm(ForgottenPasswordType::class);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $userEmail = $form->get('email')->getData();
            /** @var User $user */
            $user = $em->getRepository(User::class)->loadUserByIdentifier($userEmail);

            if ($user !== null) {
                $user->generatePasswordResetToken();
                $user->setPasswordResetExpiration();

                $em->persist($user);
                $em->flush();

                // email
                $from = (string) $host->getField('name_host', $request) . ' <noreply@' . $host->getRootDomain($request) . '>';
                $email = (new TemplatedEmail())
                    ->from($from)
                    ->to($user->getEmail())
                    ->subject($translator->trans('reset.subject', ['%name%' => $host->getField('name_host', $request)], 'email'))
                    ->htmlTemplate('emails/reset.html.twig')
                    ->context([
                        'token' => $user->getPasswordResetToken(),
                        'name' => $host->getField('name_host', $request),
                        'url' => $host->getField('url', $request),
                        'user_locale' => $request->getLocale()
                    ]);

                $mailer->send($email);
            }
        }

        return $this->render('security/forgotten.html.twig', [
            'form' => $form->createView(),
            'email' => $userEmail
        ]);
    }

    #[Route('/{_locale}/reset-password/{token}', name: 'reset_password')]
    public function resetPassword(string $token, Request $request, EntityManagerInterface $em, UserPasswordHasherInterface $passwordHasher): Response
    {
        /** @var \App\Entity\User|null $user */
        $user = $em->getRepository(User::class)->findFromToken($token);

        if ($user === null) {
            return $this->render('security/reset_invalid.html.twig', []);
        }

        $success = false;

        $form = $this->createForm(UpdatePasswordType::class, $user);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $success = true;

            $plaintextPassword = $form->get('plainPassword')->getData();
            // encode the plain password
            $hashedPassword = $passwordHasher->hashPassword(
                $user,
                $plaintextPassword
            );
            $user->setPassword($hashedPassword);

            $user->setPasswordResetToken(null);

            $em->persist($user);
            $em->flush();
        }

        return $this->render('security/reset.html.twig', [
            'form' => $form->createView(),
            'token' => $token,
            'success' => $success
        ]);
    }

    #[Route('/{_locale}/revert-email/{token}', name: 'revert_email')]
    public function revertEmailChange(string $token, Request $request, EntityManagerInterface $em): Response
    {
        $userEmailChange = $em->getRepository(UserEmailChange::class)->findFromToken($token);

        if ($userEmailChange === null) {
            return $this->render('security/user_email_change.html.twig', [
                'success' => false
            ]);
        }

        $user = $userEmailChange->getUser();
        $user->setEmail($userEmailChange->getEmail());

        $em->remove($userEmailChange);
        $em->persist($user);
        $em->flush();


        return $this->render('security/user_email_change.html.twig', [
            'success'=> true
        ]);
    }

    #[Route('/{_locale}/signup-success', name: 'signup_success')]
    public function registerConfirmation(): Response
    {
        return $this->render('security/confirmation.html.twig', []);
    }

    #[Route('/{_locale}/deleted', name: 'user_deleted')]
    public function delete(): Response
    {
        return $this->render('default/user/delete_confirm.html.twig', []);
    }
}
