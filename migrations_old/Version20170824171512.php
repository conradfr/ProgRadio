<?php

namespace DoctrineMigrations;

use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20170824171512 extends AbstractMigration implements ContainerAwareInterface
{
    private $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    /**
     * @param Schema $schema
     */
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs

    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }

    public function postUp(Schema $schema): void
    {
        $connection = $this->container->get('doctrine.orm.entity_manager')->getConnection();

        // CATEGORIES

        $categories = [
            [
                'codename' => 'culture',
                'name' => 'Culture'
            ]
        ];

        for ($i=0;$i<count($categories);$i++) {
            $connection->exec(
                'INSERT INTO category (id, code_name, name) VALUES ('.($i+3).",'".$categories[$i]['codename']."','".$categories[$i]['name']."');"
            );
        }

        // RADIOS

        $radios = [
            [
                'codename' => 'franceculture',
                'name' => 'France Culture',
                'category' => 3,
                'share' => 1.8
            ]
        ];

        for ($i=0;$i<count($radios);$i++) {
            $connection->exec(
                'INSERT INTO radio (id, category_id, code_name, name, share) VALUES ('
                .($i+13).','.$radios[$i]['category'].",'".$radios[$i]['codename']."','".$radios[$i]['name']."',".$radios[$i]['share'].");"
            );
        }
    }
}
