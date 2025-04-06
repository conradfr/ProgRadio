<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250406163840 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $radios = [
            [
                'code_name' => 'bfm_radio',
                'name' => 'BFM Radio',
                'category' => 1,
                'collection' => 1,
                'share' => 1.15,
                'country' => 'FR',
                'timezone' => 'Europe/Paris'
            ],
        ];

        $subRadios = [
            [
                'code_name' => 'bfm_radio_main',
                'name' => 'BFM Radio',
                'main' => 'true',
                'radio_id' => 150
            ],
        ];

        $stream = [
            [
                'code_name' => 'bfm_radio_main',
                'name' => 'BFM Radio',
                'main' => 'true',
                'radio_id' => 150,
                'current_song' => 'false',
                'url' => 'https://audio.bfmtv.com/bfmradio_128.mp3',
                'enabled' => 'true',
                'sub_radio' => 273
            ],
        ];

        for ($i = 0; $i < count($radios); $i++) {
            $this->connection->exec(
                'INSERT INTO radio (id, category_id, code_name, name, country_code, timezone, share, collection_id) VALUES ('
                . ($i + 150) . ',' . $radios[$i]['category'] . ",'" . $radios[$i]['code_name'] . "','" . $radios[$i]['name'] . "','" . $radios[$i]['country'] . "','" . $radios[$i]['timezone'] . "'," . $radios[$i]['share'] . "," . $radios[$i]['collection'] . ");"
            );
        }

        for ($i = 0; $i < count($subRadios); $i++) {
            $this->connection->exec(
                'INSERT INTO sub_radio (id, radio_id, code_name, name, main, enabled) VALUES ('
                . ($i + 273) . ',' . $subRadios[$i]['radio_id'] . ",'" . $subRadios[$i]['code_name'] . "','" . $subRadios[$i]['name'] . "'," . $subRadios[$i]['main'] . ',true);'
            );
        }

        for ($i = 0; $i < count($stream); $i++) {
            $this->connection->exec(
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
