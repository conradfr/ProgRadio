<?php

declare(strict_types=1);

namespace App\Form;

use App\Entity\User;
use Karser\Recaptcha3Bundle\Form\Recaptcha3Type;
use Karser\Recaptcha3Bundle\Validator\Constraints\Recaptcha3;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\RepeatedType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\Length;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Contracts\Translation\TranslatorInterface;

class RegistrationFormType extends AbstractType
{
    public function __construct(protected TranslatorInterface $translator) { }

    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('email', EmailType::class, [
                'label' => $this->translator->trans('registrationForm.email')
            ])
            ->add('plainPassword', RepeatedType::class, [
                // instead of being set onto the object directly,
                // this is read and encoded in the controller
                'type' => PasswordType::class,
                'required' => true,
                'first_options'  => ['label' => $this->translator->trans('registrationForm.password')],
                'second_options' => ['label' => $this->translator->trans('registrationForm.password_confirm')],
                'invalid_message' => $this->translator->trans('registrationForm.error.password'),
                'mapped' => false,
                'constraints' => [
                    new NotBlank([
                        'message' => $this->translator->trans('registrationForm.error.empty'),
                    ]),
                    new Length([
                        'min' => 8,
                        'minMessage' => $this->translator->trans('registrationForm.error.password_min'),
                        // max length allowed by Symfony for security reasons
                        'max' => 4096,
                    ]),
                ],
            ])
            ->add('captcha', Recaptcha3Type::class, [
                'constraints' => new Recaptcha3([
                    'message' => 'karser_recaptcha3.message',
                    'messageMissingValue' => 'karser_recaptcha3.message_missing_value'
                ]),
                'action_name' => 'contact',
                //'script_nonce_csp' => $nonceCSP,
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => User::class,
            'validation_groups' => ['Default', 'registration']
        ]);
    }
}
