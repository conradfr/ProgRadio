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
final class Version20210903160300 extends AbstractMigration implements ContainerAwareInterface
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
                'codename'   => 'hitfm',
                'name'       => 'Hit FM',
                'category'   => 2,
                'collection' => 6,
                'share'      => 0.0,
                'country'    => 'FR',
                'timezone'   => 'Indian/Reunion'
            ],
            [
                'codename'   => 'rts',
                'name'       => 'RTS',
                'category'   => 2,
                'collection' => 3,
                'share'      => 0.0,
                'country'    => 'FR',
                'timezone'   => 'Europe/Paris'
            ]
        ];

        $stream = [
            [
                'code_name'    => 'hitfm_main',
                'name'         => 'Hit FM',
                'radio_id'     => 112,
                'url'          => 'https://hitfm.ice.infomaniak.ch/hitfm-192.mp3?flux=24938',
                'current_song' => 'false',
                'main'         => 'true',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'rts_main',
                'name'         => 'RTS',
                'radio_id'     => 113,
                'url'          => 'http://stream.rtsfm.com/rts-national.mp3',
                'current_song' => 'false',
                'main'         => 'true',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'rts_avignon',
                'name'         => 'RTS Avignon',
                'radio_id'     => 113,
                'url'          => 'http://stream.rtsfm.com/rts-avignon',
                'current_song' => 'false',
                'main'         => 'false',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'rts_nimes',
                'name'         => 'RTS Nîmes',
                'radio_id'     => 113,
                'url'          => 'http://stream.rtsfm.com/rts-nimes',
                'current_song' => 'false',
                'main'         => 'false',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'rts_montpellier',
                'name'         => 'RTS',
                'radio_id'     => 113,
                'url'          => 'http://stream.rtsfm.com/rts-montpellier',
                'current_song' => 'false',
                'main'         => 'false',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'rts_sete',
                'name'         => 'RTS Sète',
                'radio_id'     => 113,
                'url'          => 'http://stream.rtsfm.com/rts-sete',
                'current_song' => 'false',
                'main'         => 'false',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'rts_beziers',
                'name'         => 'RTS Béziers',
                'radio_id'     => 113,
                'url'          => 'http://stream.rtsfm.com/rts-beziers',
                'current_song' => 'false',
                'main'         => 'false',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'rts_narbonne',
                'name'         => 'RTS Narbonne',
                'radio_id'     => 113,
                'url'          => 'http://stream.rtsfm.com/rts-narbonne',
                'current_song' => 'false',
                'main'         => 'false',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'rts_perpignan',
                'name'         => 'RTS Perpignan',
                'radio_id'     => 113,
                'url'          => 'http://stream.rtsfm.com/rts-perpignan',
                'current_song' => 'false',
                'main'         => 'false',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'rts_toulouse',
                'name'         => 'RTS Toulouse',
                'radio_id'     => 113,
                'url'          => 'http://stream.rtsfm.com/rts-toulouse',
                'current_song' => 'false',
                'main'         => 'false',
                'enabled'      => 'true',
            ],
        ];

        for ($i = 0; $i < count($radios); $i++) {
            $connection->exec(
                'INSERT INTO radio (id, category_id, code_name, name, country_code, timezone, share, collection_id) VALUES ('
                .($i + 112).','.$radios[$i]['category'].",'".$radios[$i]['codename']."','".$radios[$i]['name']."','".$radios[$i]['country']."','".$radios[$i]['timezone']."',".$radios[$i]['share'].",".$radios[$i]['collection'].");"
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
