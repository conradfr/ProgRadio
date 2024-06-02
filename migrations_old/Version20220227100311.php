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
final class Version20220227100311 extends AbstractMigration implements ContainerAwareInterface
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
            'INSERT INTO collection (id, code_name, name, priority, sort_field, sort_order, short_name) VALUES (8, \'belgium\', \'Belgique\', 6, \'share\', \'desc\', \'Belgique\')'
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
                'codename'   => 'bel_rtl',
                'name'       => 'Bel RTL',
                'category'   => 1,
                'collection' => 8,
                'share'      => 12.39,
                'country'    => 'BE',
                'timezone'   => 'Europe/Paris'
            ],
            [
                'codename'   => 'radio_contact',
                'name'       => 'Radio Contact',
                'category'   => 2,
                'collection' => 8,
                'share'      => 12.70,
                'country'    => 'BE',
                'timezone'   => 'Europe/Paris'
            ]
        ];

        $stream = [
            [
                'code_name'    => 'bel_rtl_main',
                'name'         => 'Bel RTL',
                'radio_id'     => 114,
                'url'          => 'https://belrtl.ice.infomaniak.ch/belrtl-mp3-192.mp3',
                'current_song' => 'false',
                'main'         => 'true',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'bel_rtl_musique',
                'name'         => 'Bel RTL Musique',
                'radio_id'     => 114,
                'url'          => 'https://belrtlmusique.ice.infomaniak.ch/belrtlmusique-128.mp3',
                'current_song' => 'false',
                'main'         => 'false',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'bel_rtl_comedy',
                'name'         => 'Bel RTL Comédie',
                'radio_id'     => 114,
                'url'          => 'https://belrtlcomedie.ice.infomaniak.ch/belrtlcomedie-192.mp3',
                'current_song' => 'false',
                'main'         => 'false',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'bel_rtl_90',
                'name'         => 'Bel RTL 90',
                'radio_id'     => 114,
                'url'          => 'https://belrtl90.ice.infomaniak.ch/belrtl90-128.mp3',
                'current_song' => 'false',
                'main'         => 'false',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'bel_rtl_80',
                'name'         => 'Bel RTL 80',
                'radio_id'     => 114,
                'url'          => 'https://belrtl80.ice.infomaniak.ch/belrtl80-128.mp3',
                'current_song' => 'false',
                'main'         => 'false',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'bel_rtl_70',
                'name'         => 'Bel RTL 70',
                'radio_id'     => 114,
                'url'          => 'https://belrtl70.ice.infomaniak.ch/belrtl70-128.mp3',
                'current_song' => 'false',
                'main'         => 'false',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'bel_rtl_60',
                'name'         => 'Bel RTL 60',
                'radio_id'     => 114,
                'url'          => 'https://belrtl60.ice.infomaniak.ch/belrtl60-128.mp3',
                'current_song' => 'false',
                'main'         => 'false',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'radio_contact_main',
                'name'         => 'Radio Contact',
                'radio_id'     => 115,
                'url'          => 'https://radiocontact.ice.infomaniak.ch/radiocontact-mp3-192.mp3',
                'current_song' => 'false',
                'main'         => 'true',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'radio_contact_fresh',
                'name'         => 'Radio Contact Fresh',
                'radio_id'     => 115,
                'url'          => 'https://contactplus.ice.infomaniak.ch/contactplus-192.mp3',
                'current_song' => 'false',
                'main'         => 'false',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'radio_contact_2000',
                'name'         => 'Radio Contact 2000',
                'radio_id'     => 115,
                'url'          => 'https://contact2.ice.infomaniak.ch/contact2-192.mp3',
                'current_song' => 'false',
                'main'         => 'false',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'radio_contact_90',
                'name'         => 'Radio Contact 90s',
                'radio_id'     => 115,
                'url'          => 'https://contact90s.ice.infomaniak.ch/contact90s-192.mp3',
                'current_song' => 'false',
                'main'         => 'false',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'radio_contact_80',
                'name'         => 'Radio Contact 80s',
                'radio_id'     => 115,
                'url'          => 'https://contact80s.ice.infomaniak.ch/contact80s-192.mp3',
                'current_song' => 'false',
                'main'         => 'false',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'radio_contact_kids',
                'name'         => 'Radio Contact Kids',
                'radio_id'     => 115,
                'url'          => 'https://contactkids.ice.infomaniak.ch/contactkids-192.mp3',
                'current_song' => 'false',
                'main'         => 'false',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'radio_contact_lounge',
                'name'         => 'Radio Contact Lounge',
                'radio_id'     => 115,
                'url'          => 'https://contactlounge.ice.infomaniak.ch/contactlounge-192.mp3',
                'current_song' => 'false',
                'main'         => 'false',
                'enabled'      => 'true',
            ],
        ];

        for ($i = 0; $i < count($radios); $i++) {
            $connection->exec(
                'INSERT INTO radio (id, category_id, code_name, name, country_code, timezone, share, collection_id) VALUES ('
                .($i + 114).','.$radios[$i]['category'].",'".$radios[$i]['codename']."','".$radios[$i]['name']."','".$radios[$i]['country']."','".$radios[$i]['timezone']."',".$radios[$i]['share'].",".$radios[$i]['collection'].");"
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
