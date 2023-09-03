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
final class Version20230903174159 extends AbstractMigration implements ContainerAwareInterface
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
        // this up() migration is auto-generated, please modify it to your needs

        $connection = $this->container->get('doctrine.orm.entity_manager')->getConnection();

        // COLLECTIONS

        $connection->exec(
            "UPDATE collection SET code_name = 'local', name = 'Radios locales', short_name = 'Locales', name_fr= 'Radios Locales', name_en = 'Local', name_es = 'Locales' WHERE id = 7"
        );

        $connection->exec(
            "UPDATE collection SET priority = priority + 1 WHERE priority > 4 and priority < 40"
        );

        $connection->exec(
            'INSERT INTO collection (id, code_name, name, priority, sort_field, sort_order, short_name, name_fr, name_en, name_es) VALUES (9, \'web\', \'Radios Web\', 5, \'code_name\', \'asc\', \'Web\', \'Radios Web\', \'Web radios\', \'Radios web\')'
        );

        $connection->exec(
            "UPDATE radio SET collection_id = 9 WHERE id = 107"
        );

        // RADIOS

        $radios = [
            [
                'code_name' => 'pulsradio_hits',
                'name' => 'PulsRadio Hits',
                'category' => 2,
                'collection' => 9,
                'share' => 1,
                'country' => 'FR',
                'timezone' => 'Europe/Paris'
            ],
            [
                'code_name' => 'pulsradio_dance',
                'name' => 'PulsRadio Dance',
                'category' => 2,
                'collection' => 9,
                'share' => 1,
                'country' => 'FR',
                'timezone' => 'Europe/Paris'
            ],
            [
                'code_name' => 'pulsradio_club',
                'name' => 'PulsRadio Club',
                'category' => 2,
                'collection' => 9,
                'share' => 1,
                'country' => 'FR',
                'timezone' => 'Europe/Paris'
            ],
            [
                'code_name' => 'pulsradio_trance',
                'name' => 'PulsRadio Trance',
                'category' => 2,
                'collection' => 9,
                'share' => 1,
                'country' => 'FR',
                'timezone' => 'Europe/Paris'
            ]
        ];

        $subRadios = [
            [
                'code_name' => 'pulsradio_hits_main',
                'name' => 'PulsRadio Hits',
                'main' => 'true',
                'radio_id' => 127
            ],
            [
                'code_name' => 'pulsradio_dance_main',
                'name' => 'PulsRadio Dance',
                'main' => 'true',
                'radio_id' => 128
            ],
            [
                'code_name' => 'pulsradio_club_main',
                'name' => 'PulsRadio Club',
                'main' => 'true',
                'radio_id' => 129
            ],
            [
                'code_name' => 'pulsradio_trance_main',
                'name' => 'PulsRadio Trance',
                'main' => 'true',
                'radio_id' => 130
            ]
        ];

        $stream = [
            [
                'code_name' => 'pulsradio_hits',
                'name' => 'PulsRadio Hits',
                'main' => 'true',
                'radio_id' => 127,
                'current_song' => 'true',
                'url' => 'https://icecast.pulsradio.com/hitpartyHD.mp3',
                'enabled' => 'true',
                'sub_radio' => 198
            ],
            [
                'code_name' => 'pulsradio_dance',
                'name' => 'PulsRadio Dance',
                'main' => 'true',
                'radio_id' => 128,
                'current_song' => 'true',
                'url' => 'https://icecast.pulsradio.com/pulsHD.mp3',
                'enabled' => 'true',
                'sub_radio' => 199
            ],
            [
                'code_name' => 'pulsradio_club',
                'name' => 'PulsRadio Club',
                'main' => 'true',
                'radio_id' => 129,
                'current_song' => 'true',
                'url' => 'https://icecast.pulsradio.com/mxHD.mp3',
                'enabled' => 'true',
                'sub_radio' => 200
            ],
            [
                'code_name' => 'pulsradio_80',
                'name' => 'PulsRadio 80',
                'main' => 'false',
                'radio_id' => 127,
                'current_song' => 'true',
                'url' => 'https://icecast.pulsradio.com/magicradioHD.mp3',
                'enabled' => 'true',
                'sub_radio' => 'null'
            ],
            [
                'code_name' => 'pulsradio_90',
                'name' => 'PulsRadio 90',
                'main' => 'false',
                'radio_id' => 127,
                'current_song' => 'true',
                'url' => 'https://icecast.pulsradio.com/puls90HD.mp3',
                'enabled' => 'true',
                'sub_radio' => 'null'
            ],
            [
                'code_name' => 'pulsradio_2000',
                'name' => 'PulsRadio 2000',
                'main' => 'false',
                'radio_id' => 127,
                'current_song' => 'true',
                'url' => 'https://icecast.pulsradio.com/puls00HD.mp3',
                'enabled' => 'true',
                'sub_radio' => 'null'
            ],
            [
                'code_name' => 'pulsradio_trance',
                'name' => 'PulsRadio Trance',
                'main' => 'true',
                'radio_id' => 130,
                'current_song' => 'true',
                'url' => 'https://icecast.pulsradio.com/pulstranceHD.mp3',
                'enabled' => 'true',
                'sub_radio' => 201
            ],
            [
                'code_name' => 'pulsradio_lounge',
                'name' => 'PulsRadio Lounge',
                'main' => 'false',
                'radio_id' => 127,
                'current_song' => 'true',
                'url' => 'https://icecast.pulsradio.com/relaxHD.mp3',
                'enabled' => 'true',
                'sub_radio' => 'null'
            ],
            [
                'code_name' => 'pulsradio_uk',
                'name' => 'PulsRadio UK',
                'main' => 'false',
                'radio_id' => 127,
                'current_song' => 'true',
                'url' => 'https://icecast.pulsradio.com/hitukHD.mp3',
                'enabled' => 'true',
                'sub_radio' => 'null'
            ]
        ];

        for ($i = 0; $i < count($radios); $i++) {
            $connection->exec(
                'INSERT INTO radio (id, category_id, code_name, name, country_code, timezone, share, collection_id) VALUES ('
                . ($i + 127) . ',' . $radios[$i]['category'] . ",'" . $radios[$i]['code_name'] . "','" . $radios[$i]['name'] . "','" . $radios[$i]['country'] . "','" . $radios[$i]['timezone'] . "'," . $radios[$i]['share'] . "," . $radios[$i]['collection'] . ");"
            );
        }

        for ($i = 0; $i < count($subRadios); $i++) {
            $connection->exec(
                'INSERT INTO sub_radio (id, radio_id, code_name, name, main, enabled) VALUES ('
                . ($i + 198) . ',' . $subRadios[$i]['radio_id'] . ",'" . $subRadios[$i]['code_name'] . "','" . $subRadios[$i]['name'] . "'," . $subRadios[$i]['main'] . ',true);'
            );
        }

        for ($i = 0; $i < count($stream); $i++) {
            $connection->exec(
                "INSERT INTO radio_stream (code_name, name, url, radio_id, sub_radio_id, current_song,main,enabled) VALUES ('"
                . $stream[$i]['code_name'] . "','" . $stream[$i]['name'] . "','" . $stream[$i]['url'] . "'," . $stream[$i]['radio_id'] . ',' . $stream[$i]['sub_radio'] . ',' . $stream[$i]['current_song'] . ',' . $stream[$i]['main'] . ',' . $stream[$i]['enabled'] . ')'
            );
        }
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
