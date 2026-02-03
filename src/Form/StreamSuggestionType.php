<?php

declare(strict_types=1);

namespace App\Form;

use App\Entity\StreamSuggestion;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Exception\TransformationFailedException;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Karser\Recaptcha3Bundle\Form\Recaptcha3Type;
use Karser\Recaptcha3Bundle\Validator\Constraints\Recaptcha3;
use Symfony\Contracts\Translation\TranslatorInterface;

class StreamSuggestionType extends AbstractType implements EventSubscriberInterface
{
    public function __construct(protected TranslatorInterface $translator) { }

    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('name', TextType::class, ['label' => $this->translator->trans('page.stream.modification.name'), 'required' => false])
            ->add('img', TextType::class, ['label' => $this->translator->trans('page.stream.modification.img'), 'required' => false])
            ->add('streamUrl', TextType::class, ['label' => $this->translator->trans('page.stream.modification.stream_url'), 'required' => false])
            ->add('website', TextType::class, ['label' => $this->translator->trans('page.stream.modification.website'), 'required' => false])
            ->add('tags', TextType::class, ['label' => $this->translator->trans('page.stream.submission.tags'), 'required' => false])
            ->add('slogan', TextType::class, ['label' => $this->translator->trans('page.stream.submission.slogan'), 'required' => false])
            ->add('description', TextareaType::class, ['label' => $this->translator->trans('page.stream.submission.description'), 'required' => false])
            ->add('message', TextareaType::class, ['label'=> 'page.stream.modification.comment','attr' => ['class' => 'form-control']])
            ->add('captcha', Recaptcha3Type::class, [
                'constraints' => new Recaptcha3([
                    'message' => 'karser_recaptcha3.message',
                    'messageMissingValue' => 'karser_recaptcha3.message_missing_value'
                ]),
                'action_name' => 'stream_suggest',
                //'script_nonce_csp' => $nonceCSP,
            ])
            ->add('Save', SubmitType::class, ['label'=> 'Submit', 'attr' => ['class' => 'mt-3 btn btn-primary', 'required' => false]])
        ;

        $builder->addEventSubscriber($this);
    }

    public static function getSubscribedEvents(): array
    {
        return [
            FormEvents::SUBMIT => 'ensureOneFieldIsSubmitted',
        ];
    }

    public function ensureOneFieldIsSubmitted(FormEvent $event)
    {
        /** @var StreamSuggestion $submittedData */
        $submittedData = $event->getData();

        // just checking for `null` here, but you may want to check for an empty string or something like that
        if (
            $submittedData->getName() === null
            && $submittedData->getImg() === null
            && $submittedData->getStreamUrl() === null
            && $submittedData->getWebsite() === null
            && $submittedData->getTags() === null
            && $submittedData->getSlogan() === null
            && $submittedData->getDescription() === null
        ) {
            throw new TransformationFailedException(
                'at_least_one',
                0,
                null,
                $this->translator->trans('page.stream.modification.at_least_one'),
                [] // message context for the translater
            );
        }
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => StreamSuggestion::class,
        ]);
    }
}
