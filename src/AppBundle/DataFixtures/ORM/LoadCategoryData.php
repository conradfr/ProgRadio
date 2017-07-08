<?php

namespace AppBundle\DataFixtures\ORM;

use Doctrine\Common\DataFixtures\FixtureInterface;
use Doctrine\Common\DataFixtures\AbstractFixture;
use Doctrine\Common\DataFixtures\OrderedFixtureInterface;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Doctrine\Common\Persistence\ObjectManager;
use AppBundle\Entity\Radio;
use AppBundle\Entity\Category;

class LoadCategoryData extends AbstractFixture implements FixtureInterface, ContainerAwareInterface, OrderedFixtureInterface
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
        $categories = [
            [
                'codename' => 'generaliste',
                'name' => 'Généraliste'
            ]
        ];

        for ($i=0;$i<count($categories);$i++) {
            $category = new Category();

            $category->setId($i+1);
            $category->setCodeName($categories[$i]['codename']);
            $category->setName($categories[$i]['name']);

            $manager->persist($category);

            $this->addReference($categories[$i]['codename'], $category);

            unset($category);
        }

        $manager->flush();
    }

    /**
     * {@inheritDoc}
     */
    public function getOrder()
    {
        return 1;
    }
}
