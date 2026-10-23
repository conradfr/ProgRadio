<?php

declare(strict_types=1);

namespace App\Form;

use App\Entity\StreamSuggestion;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Separate from StreamSuggestionType: only signals the stream as a duplicate,
 * the duplicate flag is set by the controller.
 */
class StreamSuggestionDuplicateType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('Save', SubmitType::class, ['label'=> 'page.stream.modification.duplicate', 'attr' => ['class' => 'btn btn-primary']])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => StreamSuggestion::class,
        ]);
    }
}
