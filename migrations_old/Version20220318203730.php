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
final class Version20220318203730 extends AbstractMigration implements ContainerAwareInterface
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
                'codename'   => 'jazzradio',
                'name'       => 'Jazz Radio',
                'category'   => 2,
                'collection' => 1,
                'share'      => 0.60,
                'country'    => 'FR',
                'timezone'   => 'Europe/Paris'
            ]
        ];

        $stream = [
            [
                'code_name'    => 'jazzradio_main',
                'name'         => 'Jazz Radio',
                'radio_id'     => 116,
                'url'          => 'https://jazzradio.ice.infomaniak.ch/jazzradio-high.aac?i=11419',
                'current_song' => 'true',
                'main'         => 'true',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'jazzradio_blues',
                'name'         => 'Jazz Radio Blues',
                'radio_id'     => 116,
                'url'          => 'https://jazzblues.ice.infomaniak.ch/jazzblues-high.aac?i=69920',
                'current_song' => 'true',
                'main'         => 'false',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'jazzradio_funk',
                'name'         => 'Jazz Radio Funk',
                'radio_id'     => 116,
                'url'          => 'https://jazz-wr06.ice.infomaniak.ch/jazz-wr06-64.aac?i=72210',
                'current_song' => 'true',
                'main'         => 'false',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'jazzradio_nouveautesjazz',
                'name'         => 'Jazz Radio Nouveautés Jazz',
                'radio_id'     => 116,
                'url'          => 'https://jzr-wr99.ice.infomaniak.ch/jzr-wr99.aac?i=40623',
                'current_song' => 'true',
                'main'         => 'false',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'jazzradio_classicjazz',
                'name'         => 'Jazz Radio Classic Jazz',
                'radio_id'     => 116,
                'url'          => 'https://jazz-wr01.ice.infomaniak.ch/jazz-wr01-64.aac?i=35598',
                'current_song' => 'true',
                'main'         => 'false',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'jazzradio_manouche',
                'name'         => 'Jazz Radio Manouche',
                'radio_id'     => 116,
                'url'          => 'https://jazz-wr02.ice.infomaniak.ch/jazz-wr02-64.aac?i=79985',
                'current_song' => 'true',
                'main'         => 'false',
                'enabled'      => 'true',
            ],
        ];

        for ($i = 0; $i < count($radios); $i++) {
            $connection->exec(
                'INSERT INTO radio (id, category_id, code_name, name, country_code, timezone, share, collection_id) VALUES ('
                .($i + 116).','.$radios[$i]['category'].",'".$radios[$i]['codename']."','".$radios[$i]['name']."','".$radios[$i]['country']."','".$radios[$i]['timezone']."',".$radios[$i]['share'].",".$radios[$i]['collection'].");"
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
