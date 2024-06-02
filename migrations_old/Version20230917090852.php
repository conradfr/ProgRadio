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
final class Version20230917090852 extends AbstractMigration implements ContainerAwareInterface
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

        // this up() migration is auto-generated, please modify it to your needs

        $connection = $this->container->get('doctrine.orm.entity_manager')->getConnection();

        // RADIOS

        $radios = [
            [
                'code_name' => 'kreolfm',
                'name' => 'Kréol fm',
                'category' => 2,
                'collection' => 6,
                'share' => 1,
                'country' => 'FR',
                'timezone' => 'Indian/Reunion'
            ],
            [
                'code_name' => 'rslradio',
                'name' => 'RSL Radio',
                'category' => 2,
                'collection' => 6,
                'share' => 1,
                'country' => 'FR',
                'timezone' => 'Indian/Reunion'
            ],
            [
                'code_name' => 'freedom',
                'name' => 'Free Dom',
                'category' => 1,
                'collection' => 6,
                'share' => 1,
                'country' => 'FR',
                'timezone' => 'Indian/Reunion'
            ]
        ];

        $subRadios = [
            [
                'code_name' => 'kreolfm_main',
                'name' => 'Radio Verdon',
                'main' => 'true',
                'radio_id' => 132
            ],
            [
                'code_name' => 'rslradio_main',
                'name' => 'RSL Radio',
                'main' => 'true',
                'radio_id' => 133
            ],
            [
                'code_name' => 'freedom_main',
                'name' => 'Free Dom',
                'main' => 'true',
                'radio_id' => 134
            ]
        ];

        $stream = [
            [
                'code_name' => 'kreolfm_main',
                'name' => 'Kréol fm',
                'main' => 'true',
                'radio_id' => 132,
                'current_song' => 'false',
                'url' => 'http://kreolfm.ice.infomaniak.ch/kreolfm-96.aac',
                'enabled' => 'true',
                'sub_radio' => 203
            ],
            [
                'code_name' => 'rslradio_main',
                'name' => 'RSL Radio',
                'main' => 'true',
                'radio_id' => 133,
                'current_song' => 'true',
                'url' => 'http://rslradio.ice.infomaniak.ch/rslradio-128.mp3',
                'enabled' => 'true',
                'sub_radio' => 204
            ],
            [
                'code_name' => 'freedom_main',
                'name' => 'Free Dom',
                'main' => 'true',
                'radio_id' => 134,
                'current_song' => 'false',
                'url' => 'https://freedomice.streamakaci.com/freedom.mp3',
                'enabled' => 'true',
                'sub_radio' => 205
            ],
            [
                'code_name' => 'freedom_2',
                'name' => 'Free Dom 2',
                'main' => 'true',
                'radio_id' => 134,
                'current_song' => 'false',
                'url' => 'https://freedomice.streamakaci.com/freedom2.mp3',
                'enabled' => 'true',
                'sub_radio' => 'null'
            ],
        ];

        for ($i = 0; $i < count($radios); $i++) {
            $connection->exec(
                'INSERT INTO radio (id, category_id, code_name, name, country_code, timezone, share, collection_id) VALUES ('
                . ($i + 132) . ',' . $radios[$i]['category'] . ",'" . $radios[$i]['code_name'] . "','" . $radios[$i]['name'] . "','" . $radios[$i]['country'] . "','" . $radios[$i]['timezone'] . "'," . $radios[$i]['share'] . "," . $radios[$i]['collection'] . ");"
            );
        }

        for ($i = 0; $i < count($subRadios); $i++) {
            $connection->exec(
                'INSERT INTO sub_radio (id, radio_id, code_name, name, main, enabled) VALUES ('
                . ($i + 203) . ',' . $subRadios[$i]['radio_id'] . ",'" . $subRadios[$i]['code_name'] . "','" . $subRadios[$i]['name'] . "'," . $subRadios[$i]['main'] . ', true);'
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
