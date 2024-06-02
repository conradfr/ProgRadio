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
final class Version20230813114054 extends AbstractMigration implements ContainerAwareInterface
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
                'code_name' => 'sanef_1077',
                'name' => 'Sanef 107.7',
                'category' => 1,
                'collection' => 3,
                'share' => 1,
                'country' => 'FR',
                'timezone' => 'Europe/Paris'
            ]
        ];

        $subRadios = [
            [
                'code_name' => 'sanef_1077_main',
                'name' => 'Sanef 107.7 Ile-de-France',
                'main' => 'true',
                'radio_id' => 126
            ],
            [
                'code_name' => 'sanef_1077_regions',
                'name' => 'Sanef 107.7 Régions',
                'main' => 'false',
                'radio_id' => 126
            ],
        ];

        $stream = [
            [
                'code_name' => 'sanef_1077_main',
                'name' => 'Sanef 107.7 Ile-de-France',
                'radio_id' => 126,
                'current_song' => 'true',
                'url' => 'https://sanef.ice.infomaniak.ch/sanef1077-idf.mp3',
                'main' => 'true',
                'enabled' => 'true',
                'sub_radio' => 196
            ],
            [
                'code_name' => 'sanef_1077_regions',
                'name' => 'Sanef 107.7 Régions',
                'radio_id' => 126,
                'current_song' => 'true',
                'url' => 'https://sanef.ice.infomaniak.ch/sanef1077-regions.mp3',
                'main' => 'true',
                'enabled' => 'true',
                'sub_radio' => 197
            ],
        ];

        for ($i = 0; $i < count($radios); $i++) {
            $connection->exec(
                'INSERT INTO radio (id, category_id, code_name, name, country_code, timezone, share, collection_id) VALUES ('
                . ($i + 126) . ',' . $radios[$i]['category'] . ",'" . $radios[$i]['code_name'] . "','" . $radios[$i]['name'] . "','" . $radios[$i]['country'] . "','" . $radios[$i]['timezone'] . "'," . $radios[$i]['share'] . "," . $radios[$i]['collection'] . ");"
            );
        }

        for ($i = 0; $i < count($subRadios); $i++) {
            $connection->exec(
                'INSERT INTO sub_radio (id, radio_id, code_name, name, main, enabled) VALUES ('
                . ($i + 196) . ',' . $subRadios[$i]['radio_id'] . ",'" . $subRadios[$i]['code_name'] . "','" . $subRadios[$i]['name'] . "'," . $subRadios[$i]['main'] . ',true);'
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
