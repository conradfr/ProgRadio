<?php

namespace DoctrineMigrations;

use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Doctrine\Migrations\AbstractMigration;
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
        $connection = $this->container->get('doctrine.orm.entity_manager')->getConnection();

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
            $connection->exec(
                'INSERT INTO category (id, code_name, name) VALUES ('.($i+1).",'".$categories[$i]['codename']."','".$categories[$i]['name']."');"
            );
        }

        // RADIOS

        $radios = [
            [
                'codename' => 'rtl',
                'name' => 'RTL',
                'category' => 1
            ],
            [
                'codename' => 'europe1',
                'name' => 'Europe 1',
                'category' => 1
            ],
            [
                'codename' => 'rtl2',
                'name' => 'RTL2',
                'category' => 2
            ],
            [
                'codename' => 'funradio',
                'name' => 'Fun Radio',
                'category' => 2
            ]/*,
            [
                'codename' => 'test',
                'name' => 'Test',
                'category' => 'music'
            ]*/
        ];

        for ($i=0;$i<count($radios);$i++) {
            $connection->exec(
                'INSERT INTO radio (id, category_id, code_name, name) VALUES ('
                    .($i+1).','.$radios[$i]['category'].",'".$radios[$i]['codename']."','".$radios[$i]['name']."');"
            );
        }
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
