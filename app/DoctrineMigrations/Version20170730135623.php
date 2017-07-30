<?php

namespace Application\Migrations;

use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

use AppBundle\Entity\Radio;
use AppBundle\Entity\Category;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20170730135623 extends AbstractMigration implements ContainerAwareInterface
{
    private $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs

    }

    public function postUp(Schema $schema)
    {
        $em = $this->container->get('doctrine.orm.entity_manager');

        // CATEGORIES

        $categories = [
            [
                'codename' => 'news_talk',
                'name' => 'Généraliste'
            ], [
                'codename' => 'music',
                'name' => 'Musicale'
            ]
        ];

        for ($i=0;$i<count($categories);$i++) {
            $category = new Category();

            $category->setId($i+1);
            $category->setCodeName($categories[$i]['codename']);
            $category->setName($categories[$i]['name']);

            $em->persist($category);

            unset($category);
        }

        $em->flush();

        // RADIOS

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
            ]/*,
            [
                'codename' => 'test',
                'name' => 'Test',
                'category' => 'music'
            ]*/
        ];

        for ($i=0;$i<count($radios);$i++) {
            $radio = new Radio();

            $radio->setId($i+1);
            $radio->setCodeName($radios[$i]['codename']);
            $radio->setName($radios[$i]['name']);
            $radio->setCategory($em->getRepository('AppBundle\Entity\Category')->findOneByCodeName($radios[$i]['category']));

            $em->persist($radio);

            unset($radio);
        }

        $em->flush();
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
