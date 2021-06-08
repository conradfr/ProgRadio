<?php

declare(strict_types=1);

namespace App\Form;

use App\Entity\User;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\RepeatedType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\Length;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Contracts\Translation\TranslatorInterface;

class UpdatePasswordType extends AbstractType
{
    public function __construct(protected TranslatorInterface $translator) { }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('plainPassword', RepeatedType::class, [
                // instead of being set onto the object directly,
                // this is read and encoded in the controller
                'type' => PasswordType::class,
                'required' => true,
                'first_options'  => ['label' => $this->translator->trans('updatePasswordForm.new')],
                'second_options' => ['label' => $this->translator->trans('updatePasswordForm.new_confirm')],
                'invalid_message' => $this->translator->trans('updatePasswordForm.error_not_same'),
                'mapped' => false,
                'constraints' => [
                    new NotBlank([
                        'message' => $this->translator->trans('updatePasswordForm.error_not_empty'),
                    ]),
                    new Length([
                        'min' => 8,
                        'minMessage' => $this->translator->trans('updatePasswordForm.error_length'),
                        // max length allowed by Symfony for security reasons
                        'max' => 4096,
                    ]),
                ],
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => User::class,
        ]);
    }
}
