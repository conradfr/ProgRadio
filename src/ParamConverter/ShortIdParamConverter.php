<?php

declare(strict_types=1);

namespace App\ParamConverter;

use Doctrine\DBAL\Types\ConversionException;
use Keiko\Uuid\Shortener\Exception\DictionaryException;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Sensio\Bundle\FrameworkExtraBundle\Request\ParamConverter\ParamConverterInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Keiko\Uuid\Shortener\Dictionary;
use Keiko\Uuid\Shortener\Shortener;

class ShortIdParamConverter implements ParamConverterInterface
{
    /**
     * {@inheritdoc}
     *
     * @throws \LogicException       When unable to guess how to get a Doctrine instance from the request information
     * @throws NotFoundHttpException When object not found
     */
    public function apply(Request $request, ParamConverter $configuration)
    {
        $name = $configuration->getName();
        $shortId = $request->attributes->get($name, null);

        if (!$shortId) {
            throw new ConversionException(sprintf('Invalid value for "%s".', $name));
        }

        $shortener = Shortener::make(
            Dictionary::createUnmistakable()
        );

        try {
            $uuid = $shortener->expand($shortId);
        }
        catch (DictionaryException $e) {
            throw new NotFoundHttpException('Stream not found');
        }

        $request->attributes->set('id', $uuid);

        return true;
    }

    public function supports(ParamConverter $configuration)
    {
        return $configuration->getName() === 'shortId';
    }

}
