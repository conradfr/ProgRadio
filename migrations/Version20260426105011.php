<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260426105011 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        // this up() migration is auto-generated, please modify it to your needs
        $radios = [
            [
                'code_name' => 'banquisefm',
                'name' => 'Banquise FM',
                'category' => 2,
                'collection' => 7,
                'share' => 0,
                'country' => 'FR',
                'timezone' => 'Europe/Paris'
            ],
        ];

        $subRadios = [
            [
                'code_name' => 'banquisefm_main',
                'name' => 'Banquise FM',
                'main' => 'true',
                'radio_id' => 154
            ],
        ];

        $stream = [
            [
                'code_name' => 'banquisefm_main',
                'name' => 'Banquise FM',
                'main' => 'true',
                'radio_id' => 154,
                'current_song' => 'false',
                'url' => 'https://ecoute.banquisefm.com/listen.mp3',
                'enabled' => 'true',
                'sub_radio' => 302
            ],
            [
                'code_name' => 'banquisefm_hits',
                'name' => 'Banquise FM',
                'main' => 'false',
                'radio_id' => 154,
                'current_song' => 'false',
                'url' => 'https://ecoute.banquisefm.com:2022/listen.mp3',
                'enabled' => 'true'
            ],
            [
                'code_name' => 'banquisefm_mix',
                'name' => 'Banquise FM',
                'main' => 'true',
                'radio_id' => 154,
                'current_song' => 'false',
                'url' => 'https://ecoute.banquisefm.com:2021/listen.mp3',
                'enabled' => 'true'
            ]
        ];

        for ($i = 0; $i < count($radios); $i++) {
            $this->connection->executeQuery(
                'INSERT INTO radio (id, category_id, code_name, name, country_code, timezone, share, collection_id) VALUES ('
                . ($i + 154) . ',' . $radios[$i]['category'] . ",'" . $radios[$i]['code_name'] . "','" . $radios[$i]['name'] . "','" . $radios[$i]['country'] . "','" . $radios[$i]['timezone'] . "'," . $radios[$i]['share'] . "," . $radios[$i]['collection'] . ");"
            );
        }

        for ($i = 0; $i < count($subRadios); $i++) {
            $this->connection->executeQuery(
                'INSERT INTO sub_radio (id, radio_id, code_name, name, main, enabled) VALUES ('
                . ($i + 302) . ',' . $subRadios[$i]['radio_id'] . ",'" . $subRadios[$i]['code_name'] . "','" . $subRadios[$i]['name'] . "'," . $subRadios[$i]['main'] . ',true);'
            );
        }

        echo 'lol';

        for ($i = 0; $i < count($stream); $i++) {
            $this->connection->executeQuery(
                "INSERT INTO radio_stream (code_name, name, url, radio_id, sub_radio_id, current_song,main,enabled) VALUES ('"
                . $stream[$i]['code_name'] . "','" . $stream[$i]['name'] . "','" . $stream[$i]['url'] . "'," . $stream[$i]['radio_id'] . (!empty($stream[$i]['sub_radio']) ? ',' . $stream[$i]['sub_radio'] . ',' : ',null,') . $stream[$i]['current_song'] . ',' . $stream[$i]['main'] . ',' . $stream[$i]['enabled'] . ')'
            );
        }
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
