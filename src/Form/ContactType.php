<?php

declare(strict_types=1);

namespace App\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Contracts\Translation\TranslatorInterface;
use Karser\Recaptcha3Bundle\Form\Recaptcha3Type;
use Karser\Recaptcha3Bundle\Validator\Constraints\Recaptcha3;

class ContactType extends AbstractType
{
    public function __construct(protected TranslatorInterface $translator) { }

    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('name', TextType::class, ['label'=> 'page.contact.name', 'attr' => ['class' => 'form-control']])
            ->add('email', TextType::class, ['label'=> 'page.contact.email','attr' => ['class' => 'form-control'], 'required' => false])
            ->add('message', TextareaType::class, ['label'=> 'page.contact.message','attr' => ['class' => 'form-control']])
            ->add('captcha', Recaptcha3Type::class, [
                'constraints' => new Recaptcha3([
                    'message' => 'karser_recaptcha3.message',
                    'messageMissingValue' => 'karser_recaptcha3.message_missing_value'
                ]),
                'action_name' => 'contact',
                //'script_nonce_csp' => $nonceCSP,
            ])
            ->add('Save', SubmitType::class, ['label'=> 'page.contact.send', 'attr' => ['class' => 'btn btn-primary']])
        ;
    }
}
