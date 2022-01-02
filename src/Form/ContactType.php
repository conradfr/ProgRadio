<?php

declare(strict_types=1);

namespace App\Form;

use Captcha\Bundle\CaptchaBundle\Form\Type\CaptchaType;
use Captcha\Bundle\CaptchaBundle\Validator\Constraints\ValidCaptcha;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Contracts\Translation\TranslatorInterface;

class ContactType extends AbstractType
{
    public function __construct(protected TranslatorInterface $translator) { }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('name', TextType::class, ['label'=> 'page.contact.name', 'attr' => ['class' => 'form-control']])
            ->add('email', TextType::class, ['label'=> 'page.contact.email','attr' => ['class' => 'form-control'], 'required' => false])
            ->add('message', TextareaType::class, ['label'=> 'page.contact.message','attr' => ['class' => 'form-control']])
            ->add('captchaCode', CaptchaType::class, [
                'captchaConfig' => 'ExampleCaptcha',
                'label' => $this->translator->trans('registrationForm.captcha'),
                'mapped' => false,
                'constraints' => [
                    new ValidCaptcha([
                        'message' => $this->translator->trans('registrationForm.error.captcha'),
                    ]),
                ]
            ])
            ->add('Save', SubmitType::class, ['label'=> 'page.contact.send', 'attr' => ['class' => 'btn btn-primary']])
        ;
    }
}
