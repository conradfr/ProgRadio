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
final class Version20201228083340 extends AbstractMigration implements ContainerAwareInterface
{
    private $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(
            'INSERT INTO collection (id, code_name, name, priority, sort_field, sort_order, short_name) VALUES (6, \'domtom\', \'DOM-TOM\', 3, \'code_name\', \'asc\', \'DOM-TOM\')'
        );

        $connection = $this->container->get('doctrine.orm.entity_manager')->getConnection();

        $connection->exec(
            "UPDATE collection SET priority = 4 WHERE code_name = 'francebleu';"
        );
        $connection->exec(
            "UPDATE collection SET priority = 5 WHERE code_name = 'international';"
        );

        $connection->exec(
            "UPDATE collection SET code_name = 'regional', name = 'Régionales', short_name = 'Régionales' WHERE id = 3;"
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }

    public function postUp(Schema $schema): void
    {
        $connection = $this->container->get('doctrine.orm.entity_manager')->getConnection();

        // RADIOS

        $radios = [
            [
                'codename'   => 'martinique_la1ere',
                'name'       => 'Martinique La 1ere',
                'category'   => 1,
                'collection' => 6,
                'share'      => 20.0,
                'stream'     => 'https://martinique.ice.infomaniak.ch/martinique-128.mp3'
            ],
            [
                'codename'   => 'guadeloupe_la1ere',
                'name'       => 'Guadeloupe La 1ere',
                'category'   => 1,
                'collection' => 6,
                'share'      => 20.8,
                'stream'     => 'https://guadeloupe.ice.infomaniak.ch/guadeloupe-128.mp3'
            ],
            [
                'codename'   => 'reunion_la1ere',
                'name'       => 'Réunion La 1ere',
                'category'   => 1,
                'collection' => 6,
                'share'      => 9.6,
                'stream'     => 'https://reunion.ice.infomaniak.ch/reunion-128.mp3'
            ]
        ];

        for ($i = 0; $i < count($radios); $i++) {
            $connection->exec(
                'INSERT INTO radio (id, category_id, code_name, streaming_url, name, share, collection_id) VALUES ('
                .($i + 93).','.$radios[$i]['category'].",'".$radios[$i]['codename']."','".$radios[$i]['stream']."','".$radios[$i]['name']."',".$radios[$i]['share'].",".$radios[$i]['collection'].");"
            );
        }
    }
}
