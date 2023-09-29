<?php

declare(strict_types=1);

namespace App\Form;

use App\Entity\StreamOverloading;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class StreamOverloadingType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('name', TextType::class, ['label' => 'Name', 'required' => false])
            ->add('img', TextType::class, ['label' => 'Image', 'required' => false])
            ->add('streamUrl', TextType::class, ['label' => 'Stream Url', 'required' => false])
            ->add('countryCode', TextType::class, ['label' => 'Country Code', 'required' => false])
            ->add('website', TextType::class, ['label' => 'Website', 'required' => false])
            ->add('redirect', TextType::class, ['label' => 'Redirect', 'required' => false, 'mapped' => false])
            ->add('enabled', CheckboxType::class, ['label' => 'Enabled', 'required' => false])
            ->add('Save', SubmitType::class, ['label'=> 'Update', 'attr' => ['class' => 'mt-3 btn btn-primary', 'required' => false]])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => StreamOverloading::class,
        ]);
    }
}
