<?php

declare(strict_types=1);

namespace App\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;

class ContactType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('name', TextType::class, ['label'=> 'page.contact.name', 'attr' => ['class' => 'form-control']])
            ->add('email', TextType::class, ['label'=> 'page.contact.email','attr' => ['class' => 'form-control'], 'required' => false])
            ->add('message', TextareaType::class, ['label'=> 'page.contact.message','attr' => ['class' => 'form-control']])
            ->add('Save', SubmitType::class, ['label'=> 'page.contact.send', 'attr' => ['class' => 'btn btn-primary']])
        ;
    }
}
