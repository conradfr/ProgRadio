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
final class Version20210719105837 extends AbstractMigration implements ContainerAwareInterface
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
            'INSERT INTO collection (id, code_name, name, priority, sort_field, sort_order, short_name) VALUES (7, \'local_web\', \'Locales & Web\', 3, \'code_name\', \'asc\', \'Locales & Web\')'
        );

        $connection = $this->container->get('doctrine.orm.entity_manager')->getConnection();

        $connection->exec(
            "UPDATE collection SET priority = 4 WHERE code_name = 'domtom';"
        );
        $connection->exec(
            "UPDATE collection SET priority = 5 WHERE code_name = 'francebleu';"
        );
        $connection->exec(
            "UPDATE collection SET priority = 6 WHERE code_name = 'international';"
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
                'codename'   => 'goldfm',
                'name'       => 'Gold FM',
                'category'   => 2,
                'collection' => 3,
                'share'      => 0.0,
                'country'    => 'FR',
                'timezone'   => 'Europe/Paris'
            ],
            [
                'codename'   => 'bideetmusique',
                'name'       => 'Bide & Musique',
                'category'   => 2,
                'collection' => 7,
                'share'      => 0.0,
                'country'    => 'FR',
                'timezone'   => 'Europe/Paris'
            ],
            [
                'codename'   => 'blackbox',
                'name'       => 'BlackBox',
                'category'   => 2,
                'collection' => 7,
                'share'      => 0.0,
                'country'    => 'FR',
                'timezone'   => 'Europe/Paris'
            ],
        ];

        $stream = [
            [
                'code_name'    => 'goldfm_main',
                'name'         => 'Gold FM',
                'radio_id'     => 106,
                'url'          => 'https://mmradios.ice.infomaniak.ch/goldfm.mp3',
                'current_song' => 'false',
                'main'         => 'true',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'bideetmusique_main',
                'name'         => 'Bide & Musique',
                'radio_id'     => 107,
                'url'          => 'https://relay2.bide-et-musique.com:9300/bm.mp3?type=http&nocache=20',
                'current_song' => 'true',
                'main'         => 'true',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'blackbox_main',
                'name'         => 'BlackBox',
                'radio_id'     => 108,
                'url'          => 'https://start-blackbox.ice.infomaniak.ch/start-blackbox-high.mp3',
                'current_song' => 'true',
                'main'         => 'true',
                'enabled'      => 'true',
            ]
        ];

        for ($i = 0; $i < count($radios); $i++) {
            $connection->exec(
                'INSERT INTO radio (id, category_id, code_name, name, country_code, timezone, share, collection_id) VALUES ('
                .($i + 106).','.$radios[$i]['category'].",'".$radios[$i]['codename']."','".$radios[$i]['name']."','".$radios[$i]['country']."','".$radios[$i]['timezone']."',".$radios[$i]['share'].",".$radios[$i]['collection'].");"
            );
        }

        for ($i = 0; $i < count($stream); $i++) {
            $connection->exec(
                "INSERT INTO radio_stream (code_name, name, url, radio_id, current_song,main,enabled) VALUES ('"
                .$stream[$i]['code_name']."','".$stream[$i]['name']."','".$stream[$i]['url']."',".$stream[$i]['radio_id'].','.$stream[$i]['current_song'].','.$stream[$i]['main'].','.$stream[$i]['enabled'].')'
            );
        }

    }
}
