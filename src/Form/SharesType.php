<?php

namespace App\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\NumberType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\OptionsResolver\OptionsResolver;

class SharesType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        foreach ($options['data'] as $key => $share) {
            $builder
                ->add($key,
                    NumberType::class, [
                        'label' => $options['labels'][$key],
                        'attr' => ['class' => 'form-control'],
                    // 'constraints' => new Length(['min' => 3]),
                ]);
        }

        $builder->add('save', SubmitType::class,
            ['label'=> 'Save', 'attr' => ['class' => 'btn btn-primary']])
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setRequired('labels');
    }
}
