<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260706152957 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

// this up() migration is auto-generated, please modify it to your needs
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs

        $prefix = 'impactfm';
        $radioId = 157;
        $subRadioId = 319;
        $streamSongId = 126;
        $website = 'https://www.impactfm.fr/';

        $radios = [
            [
                'code_name' => $prefix,
                'name' => 'Impact FM',
                'category' => 2,
                'collection' => 7,
                'share' => 0,
                'country' => 'FR',
                'timezone' => 'Europe/Paris'
            ],
        ];

        $subRadios = [
            [
                'code_name' => 'main',
                'name' => 'Impact FM',
                'main' => 'true',
                'radio_id' => $radioId,
                'url' => 'https://impactfm.ice.infomaniak.ch/impactfm-64.aac',
                'id' => '960959e6-0601-11e8-ae97-52543be04c81'
            ],
        ];

        // song
        $this->connection->executeQuery(
            'INSERT INTO stream_song (id, code_name, enabled) VALUES (' . $streamSongId . ",'" . $prefix . "', true);"
        );

        for ($i = 0; $i < count($radios); $i++) {
            $this->connection->executeQuery(
                'INSERT INTO radio (id, category_id, code_name, name, country_code, timezone, share, collection_id, website) VALUES ('
                . ($i + $radioId) . ',' . $radios[$i]['category'] . ",'" . $radios[$i]['code_name'] . "','" . $radios[$i]['name'] . "','" . $radios[$i]['country'] . "','" . $radios[$i]['timezone'] . "'," . $radios[$i]['share'] . "," . $radios[$i]['collection'] . ",'" . $website . "');"
            );
        }

        for ($i = 0; $i < count($subRadios); $i++) {
            $this->connection->executeQuery(
                'INSERT INTO sub_radio (id, radio_id, code_name, name, main, enabled) VALUES ('
                . ($i + $subRadioId) . ',' . $subRadios[$i]['radio_id'] . ",'" . $prefix . '_' . $subRadios[$i]['code_name'] . "','" . $subRadios[$i]['name'] . "'," . $subRadios[$i]['main'] . ',true);'
            );

            $this->connection->executeQuery(
                "UPDATE stream SET internal_use_img = false, radio_id = " . $radioId . ", is_main_radio = " . $subRadios[$i]['main'] . ", is_sub_radio = TRUE, sub_radio_id = " . ($i + $subRadioId) . ", radio_stream_code_name = '" . $prefix . '_' . $subRadios[$i]['code_name'] ."', stream_song_id = " . 125 . ", stream_song_code_name = '"  . $subRadios[$i]['code_name'] . "' WHERE id = '" . $subRadios[$i]['id'] . "';"
            );
        }
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
