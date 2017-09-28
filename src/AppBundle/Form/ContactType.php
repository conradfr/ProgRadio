<?php

namespace AppBundle\Form;

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
            ->add('name', TextType::class, ['label'=> 'Nom *', 'attr' => ['class' => 'form-control']])
            ->add('email', TextType::class, ['label'=> 'Email','attr' => ['class' => 'form-control'], 'required' => false])
            ->add('message', TextareaType::class, ['label'=> 'Message *','attr' => ['class' => 'form-control']])
            ->add('Save', SubmitType::class, ['label'=> 'Envoyer', 'attr' => ['class' => 'btn btn-primary']])
        ;
    }
}
