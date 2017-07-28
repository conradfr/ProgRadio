<?php

namespace AppBundle\DataFixtures\ORM;

use Doctrine\Common\DataFixtures\FixtureInterface;
use Doctrine\Common\DataFixtures\AbstractFixture;
use Doctrine\Common\DataFixtures\OrderedFixtureInterface;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Doctrine\Common\Persistence\ObjectManager;
use AppBundle\Entity\Radio;

class LoadRadioData extends AbstractFixture implements FixtureInterface, ContainerAwareInterface, OrderedFixtureInterface
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
            [
                'codename' => 'rtl',
                'name' => 'RTL',
                'category' => 'news_talk'
            ],
            [
                'codename' => 'europe1',
                'name' => 'Europe 1',
                'category' => 'news_talk'
            ],
            [
                    'codename' => 'rtl2',
                    'name' => 'RTL2',
                    'category' => 'music'
            ],
            [
                'codename' => 'funradio',
                'name' => 'Fun Radio',
                'category' => 'music'
            ],
            [
                'codename' => 'test',
                'name' => 'Test',
                'category' => 'music'
            ]
        ];

        for ($i=0;$i<count($radios);$i++) {
            $radio = new Radio();

            $radio->setId($i+1);
            $radio->setCodeName($radios[$i]['codename']);
            $radio->setName($radios[$i]['name']);
            $radio->setCategory($this->getReference($radios[$i]['category']));

            $manager->persist($radio);

            unset($radio);
        }

        $manager->flush();
    }

    /**
     * {@inheritDoc}
     */
    public function getOrder()
    {
        return 2;
    }
}
