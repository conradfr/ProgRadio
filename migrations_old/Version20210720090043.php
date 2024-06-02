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
final class Version20210720090043 extends AbstractMigration implements ContainerAwareInterface
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
                'codename'   => 'bergerac95',
                'name'       => 'Bergerac 95',
                'category'   => 2,
                'collection' => 7,
                'share'      => 0.0,
                'country'    => 'FR',
                'timezone'   => 'Europe/Paris'
            ],
            [
                'codename'   => 'virageradio',
                'name'       => 'Virage Radio',
                'category'   => 2,
                'collection' => 7,
                'share'      => 0.0,
                'country'    => 'FR',
                'timezone'   => 'Europe/Paris'
            ],
            [
                'codename'   => 'tropiquesfm',
                'name'       => 'Tropiques FM',
                'category'   => 2,
                'collection' => 7,
                'share'      => 0.0,
                'country'    => 'FR',
                'timezone'   => 'Europe/Paris'
            ],
        ];

        $stream = [
            [
                'code_name'    => 'bergerac95_main',
                'name'         => 'Bergerac 95',
                'radio_id'     => 109,
                'url'          => 'https://hosting2.studioradiomedia.com:8045/stream.mp3',
                'current_song' => 'true',
                'main'         => 'true',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'virageradio_main',
                'name'         => 'Virage Radio',
                'radio_id'     => 110,
                'url'          => 'https://virageradio.ice.infomaniak.ch/virageradio-high.mp3',
                'current_song' => 'true',
                'main'         => 'true',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'tropiquesfm_main',
                'name'         => 'Tropiques FM',
                'radio_id'     => 111,
                'url'          => 'https://listen.radioking.com/radio/8916/stream/19088',
                'current_song' => 'true',
                'main'         => 'true',
                'enabled'      => 'true',
            ],
        ];

        for ($i = 0; $i < count($radios); $i++) {
            $connection->exec(
                'INSERT INTO radio (id, category_id, code_name, name, country_code, timezone, share, collection_id) VALUES ('
                .($i + 109).','.$radios[$i]['category'].",'".$radios[$i]['codename']."','".$radios[$i]['name']."','".$radios[$i]['country']."','".$radios[$i]['timezone']."',".$radios[$i]['share'].",".$radios[$i]['collection'].");"
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
