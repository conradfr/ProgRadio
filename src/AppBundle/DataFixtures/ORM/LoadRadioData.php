<?php

namespace AppBundle\DataFixtures\ORM;

use Doctrine\Common\DataFixtures\FixtureInterface;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Doctrine\Common\Persistence\ObjectManager;
use AppBundle\Entity\Radio;

class LoadRadioData implements FixtureInterface, ContainerAwareInterface
{
    /**
     * @var ContainerInterface
     */
    private $container;

    /**
     * {@inheritDoc}
     */
    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    /**
     * {@inheritDoc}
     */
    public function load(ObjectManager $manager)
    {
        $radios = [
            'rtl'
        ];

        for ($i=0;$i<count($radios);$i++) {
            $radio = new Radio();

            $radio->setId($i+1);
            $radio->setName($radios[$i]);

            $manager->persist($radio);
        }

        $manager->flush();
    }
}
