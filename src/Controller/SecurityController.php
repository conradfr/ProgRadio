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
use App\Security\LoginFormAuthenticator;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Symfony\Component\Security\Guard\GuardAuthenticatorHandler;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;
use Doctrine\Common\Collections\ArrayCollection;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;

class SecurityController extends AbstractController
{
    /**
     * @Route("/login", name="app_login")
     */
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

    /**
     * @Route("/logout", name="app_logout")
     */
    public function logout()
    {
        throw new \LogicException('This method can be blank - it will be intercepted by the logout key on your firewall.');
    }

    /**
     * @Route("/signup", name="app_register")
     */
    public function register(Request $request, EntityManagerInterface $em, UserPasswordEncoderInterface $passwordEncoder, GuardAuthenticatorHandler $guardHandler, LoginFormAuthenticator $authenticator, MailerInterface $mailer): Response
    {
        $user = new User();
        $form = $this->createForm(RegistrationFormType::class, $user);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            // encode the plain password
            $user->setPassword(
                $passwordEncoder->encodePassword(
                    $user,
                    $form->get('plainPassword')->getData()
                )
            );

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
            $from = $this->getParameter('email_from');
            $email = (new TemplatedEmail())
                ->from(Address::fromString($from))
                ->to($user->getEmail())
                ->subject('Programmes-Radio.io - Inscription')
                ->htmlTemplate('emails/signup.html.twig')
                ->context([]);

            $mailer->send($email);

            $guardHandler->authenticateUserAndHandleSuccess(
                $user,
                $request,
                $authenticator,
                'main' // firewall name in security.yaml
            );

            return $this->redirectToRoute('signup_success');
        }

        return $this->render('security/register.html.twig', [
            'registrationForm' => $form->createView(),
        ]);
    }

    /**
     * @Route("/forgotten-password", name="forgotten_password")
     */
    public function forgottenPassword(Request $request, EntityManagerInterface $em, MailerInterface  $mailer): Response
    {
        $userEmail = null;
        $form = $this->createForm(ForgottenPasswordType::class);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $userEmail = $form->get('email')->getData();
            $user = $em->getRepository(User::class)->loadUserByUsername($userEmail);

            if ($user !== null) {
                $user->generatePasswordResetToken();
                $user->setPasswordResetExpiration();

                $em->persist($user);
                $em->flush();

                // email
                $from = $this->getParameter('email_from');
                $email = (new TemplatedEmail())
                    ->from(Address::fromString($from))
                    ->to($user->getEmail())
                    ->subject('Programmes-Radio.io - Réinitialisation du mot de passe')
                    ->htmlTemplate('emails/reset.html.twig')
                    ->context(['token' => $user->getPasswordResetToken()]);

                $mailer->send($email);
            }
        }

        return $this->render('security/forgotten.html.twig', [
            'form' => $form->createView(),
            'email' => $userEmail
        ]);
    }

    /**
     * @Route(
     *     "/reset-password/{token}",
     *     name="reset_password"
     * )
     */
    public function resetPassword(string $token, Request $request, EntityManagerInterface $em, UserPasswordEncoderInterface $passwordEncoder): Response
    {
        /** @var \App\Entity\User $user */
        $user = $em->getRepository(User::class)->findFromToken($token);

        if ($user === null) {
            return $this->render('security/reset_invalid.html.twig', []);
        }

        $success = false;

        $form = $this->createForm(UpdatePasswordType::class, $user);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $success = true;

            // encode the plain password
            $user->setPassword(
                $passwordEncoder->encodePassword(
                    $user,
                    $form->get('plainPassword')->getData()
                )
            );

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

    /**
     * @Route(
     *     "/revert-email/{token}",
     *     name="revert_email"
     * )
     */
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

    /**
     * @Route("/signup-success", name="signup_success")
     */
    public function registerConfirmation(): Response
    {
        return $this->render('security/confirmation.html.twig', []);
    }

    /**
     * @Route("/deleted", name="user_deleted")
     */
    public function delete(): Response
    {
        return $this->render('default/user/delete_confirm.html.twig', []);
    }
}
