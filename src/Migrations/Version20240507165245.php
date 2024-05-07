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
final class Version20240507165245 extends AbstractMigration implements ContainerAwareInterface
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

        // RADIOS

        $radios = [
            [
                'code_name' => 'nostalgie_be',
                'name' => 'Nostalgie',
                'category' => 2,
                'collection' => 8,
                'share' => 15,
                'country' => 'BE',
                'timezone' => 'Europe/Brussels'
            ],
            [
                'code_name' => 'nostalgie_plus_be',
                'name' => 'Nostalgie+',
                'category' => 2,
                'collection' => 8,
                'share' => 1.5,
                'country' => 'BE',
                'timezone' => 'Europe/Brussels'
            ],
            [
                'code_name' => 'nrj_be',
                'name' => 'NRJ',
                'category' => 2,
                'collection' => 8,
                'share' => 4.79,
                'country' => 'BE',
                'timezone' => 'Europe/Brussels'
            ],
            [
                'code_name' => 'nrj_plus_be',
                'name' => 'NRJ+',
                'category' => 2,
                'collection' => 8,
                'share' => 0.38,
                'country' => 'BE',
                'timezone' => 'Europe/Brussels'
            ],
            [
                'code_name' => 'cherie_be',
                'name' => 'Chérie',
                'category' => 2,
                'collection' => 8,
                'share' => 0.35,
                'country' => 'BE',
                'timezone' => 'Europe/Brussels'
            ],
            [
                'code_name' => 'funradio_be',
                'name' => 'Fun Radio',
                'category' => 2,
                'collection' => 8,
                'share' => 1.73,
                'country' => 'BE',
                'timezone' => 'Europe/Brussels'
            ],
            [
                'code_name' => 'sudradio_be',
                'name' => 'Sud Radio',
                'category' => 1,
                'collection' => 8,
                'share' => 0.48,
                'country' => 'BE',
                'timezone' => 'Europe/Brussels'
            ],
        ];

        $subRadios = [
            [
                'code_name' => 'nostalgie_be_main',
                'name' => 'Nostalgie',
                'main' => 'true',
                'radio_id' => 139
            ],
            [
                'code_name' => 'nostalgie_plus_be_main',
                'name' => 'Nostalgie+',
                'main' => 'true',
                'radio_id' => 140
            ],
            [
                'code_name' => 'nrj_be_main',
                'name' => 'NRJ',
                'main' => 'true',
                'radio_id' => 141
            ],
            [
                'code_name' => 'nrj_plus_be_main',
                'name' => 'NRJ+',
                'main' => 'true',
                'radio_id' => 142
            ],
            [
                'code_name' => 'cherie_be_main',
                'name' => 'Chérie',
                'main' => 'true',
                'radio_id' => 143
            ],
            [
                'code_name' => 'funradio_be_main',
                'name' => 'NRJ+',
                'main' => 'true',
                'radio_id' => 144
            ],
            [
                'code_name' => 'sudradio_be_main',
                'name' => 'Sud Radio',
                'main' => 'true',
                'radio_id' => 145
            ],
        ];

        $stream = [
            [
                'code_name' => 'nostalgie_be_main',
                'name' => 'Nostalgie',
                'main' => 'true',
                'radio_id' => 139,
                'current_song' => 'false',
                'url' => 'https://scdn.nrjaudio.fm/audio1/fr/30601/mp3_128.mp3',
                'enabled' => 'true',
                'sub_radio' => 216
            ],
            [
                'code_name' => 'nostalgie_plus_be_main',
                'name' => 'Nostalgie+',
                'main' => 'true',
                'radio_id' => 140,
                'current_song' => 'false',
                'url' => 'https://stream.rcs.revma.com/s9mkgtsqtg0uv',
                'enabled' => 'true',
                'sub_radio' => 217
            ],
            [
                'code_name' => 'nrj_be_main',
                'name' => 'NRJ',
                'main' => 'true',
                'radio_id' => 141,
                'current_song' => 'false',
                'url' => 'https://n07a-eu.rcs.revma.com/xh00fwuptg0uv',
                'enabled' => 'true',
                'sub_radio' => 218
            ],
            [
                'code_name' => 'nrj_plus_be_main',
                'name' => 'NRJ+',
                'main' => 'true',
                'radio_id' => 142,
                'current_song' => 'false',
                'url' => 'https://n34a-eu.rcs.revma.com/1a6hdnzbebuvv',
                'enabled' => 'true',
                'sub_radio' => 219
            ],
            [
                'code_name' => 'cherie_be_main',
                'name' => 'Chérie',
                'main' => 'true',
                'radio_id' => 143,
                'current_song' => 'false',
                'url' => 'https://stream.rcs.revma.com/r3cprzsqtg0uv',
                'enabled' => 'true',
                'sub_radio' => 220
            ],
            [
                'code_name' => 'funradio_be_main',
                'name' => 'Fun Radio',
                'main' => 'true',
                'radio_id' => 144,
                'current_song' => 'false',
                'url' => 'https://funradiobe.ice.infomaniak.ch/funradiobe-high.mp3',
                'enabled' => 'true',
                'sub_radio' => 221
            ],
            [
                'code_name' => 'sudradio_be_main',
                'name' => 'Sud Radio',
                'main' => 'true',
                'radio_id' => 145,
                'current_song' => 'true',
                'url' => 'https://stream.ceit.be/sudradio-hainaut',
                'enabled' => 'true',
                'sub_radio' => 222
            ]
        ];

        for ($i = 0; $i < count($radios); $i++) {
            $connection->exec(
                'INSERT INTO radio (id, category_id, code_name, name, country_code, timezone, share, collection_id) VALUES ('
                . ($i + 139) . ',' . $radios[$i]['category'] . ",'" . $radios[$i]['code_name'] . "','" . $radios[$i]['name'] . "','" . $radios[$i]['country'] . "','" . $radios[$i]['timezone'] . "'," . $radios[$i]['share'] . "," . $radios[$i]['collection'] . ");"
            );
        }

        for ($i = 0; $i < count($subRadios); $i++) {
            $connection->exec(
                'INSERT INTO sub_radio (id, radio_id, code_name, name, main, enabled) VALUES ('
                . ($i + 216) . ',' . $subRadios[$i]['radio_id'] . ",'" . $subRadios[$i]['code_name'] . "','" . $subRadios[$i]['name'] . "'," . $subRadios[$i]['main'] . ',true);'
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
