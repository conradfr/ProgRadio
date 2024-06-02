<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20210516151500 extends AbstractMigration implements ContainerAwareInterface
{
    private $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs

    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }

    public function postUp(Schema $schema): void
    {
        $connection = $this->container->get('doctrine.orm.entity_manager')->getConnection();

        // RADIOS

        $radios = [
            [
                'codename'   => 'tipik',
                'name'       => 'Tipik',
                'category'   => 2,
                'collection' => 4,
                'share'      => 0.0
            ]
        ];

        $stream = [
            [
                'code_name'  => 'tipik_main',
                'name'       => 'Tipik',
                'radio_id'   => 100,
                'url'        =>  'https://radios.rtbf.be/pure-64.aac',
                'current_song' => 'true',
                'main' => 'true'
            ]
        ];

        for ($i = 0; $i < count($radios); $i++) {
            $connection->exec(
                'INSERT INTO radio (id, category_id, code_name, name, share, collection_id) VALUES ('
                .($i + 100).','.$radios[$i]['category'].",'".$radios[$i]['codename']."','".$radios[$i]['name']."',".$radios[$i]['share'].",".$radios[$i]['collection'].");"
            );
        }

        for ($i = 0; $i < count($stream); $i++) {
            $connection->exec("INSERT INTO radio_stream (code_name, name, url, radio_id, current_song,main) VALUES ('"
                . $stream[$i]['code_name']."','".$stream[$i]['name']."','".$stream[$i]['url']."',".$stream[$i]['radio_id']. ','. $stream[$i]['current_song']. ','. $stream[$i]['main'].')');
        }
    }
}
