<?php

declare(strict_types=1);

namespace App\Form;

use App\Entity\Stream;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CountryType;
use Symfony\Component\Form\Extension\Core\Type\LanguageType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Contracts\Translation\TranslatorInterface;

class StreamSubmissionType extends AbstractType
{
    public function __construct(protected TranslatorInterface $translator) { }

    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('name', TextType::class, ['label' => $this->translator->trans('page.stream.submission.name'), 'required' => true])
            ->add('originalImg', TextType::class, ['label' => $this->translator->trans('page.stream.submission.img'), 'required' => false])
            ->add('streamUrl', TextType::class, ['label' => $this->translator->trans('page.stream.submission.stream_url'), 'required' => true])
            ->add('website', TextType::class, ['label' => $this->translator->trans('page.stream.submission.website'), 'required' => false])
            ->add('countryCode', CountryType::class, ['label' => $this->translator->trans('page.stream.submission.country'), 'required' => true])
            ->add('language', LanguageType::class, ['label' => $this->translator->trans('page.stream.submission.language'), 'required' => false])
            ->add('Save', SubmitType::class, ['label'=> $this->translator->trans('page.stream.submission.submit'), 'attr' => ['class' => 'mt-3 btn btn-primary', 'required' => false]])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Stream::class,
        ]);
    }
}
