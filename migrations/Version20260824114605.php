<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260824114605 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $prefix = 'radiostar';
        $radioId = 177;
        $subRadioId = 357;
        $streamSongId = 151;
        $website = 'https://www.radiostarsud.fr';

        $radios = [
            [
                'code_name' => $prefix,
                'name' => 'Radio Star',
                'category' => 2,
                'collection' => 9,
                'share' => 0,
                'country' => 'FR',
                'timezone' => 'Europe/Paris'
            ],
        ];

        $subRadios = [
            [
                'code_name' => 'toulon',
                'name' => 'Radio Star Toulon',
                'main' => 'true',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://stream.rcs.revma.com/vmnc89du7ucwv',
            ],
            [
                'code_name' => 'marseille',
                'name' => 'Radio Star Marseille',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://stream.rcs.revma.com/b4yrpwdu7ucwv',
                'id' => '1a70db8d-197d-48ca-909d-4d17e8af6d57'
            ],
            [
                'code_name' => 'star8090',
                'name' => 'Radio Star 80-90',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://stream.rcs.revma.com/m22rmw2t7ucwv',
                'id' => 'd4f705f4-4e1b-4d42-b935-89ecd03e752c'
            ],
            [
                'code_name' => 'love',
                'name' => 'Radio Star Love',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://stream.rcs.revma.com/4rw9y7au7ucwv',
                'id' => '6d927ad8-d6dd-4c37-8e64-acd20ab9c3e3'
            ],
            [
                'code_name' => 'autravail',
                'name' => 'Radio Star Au Travail',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://stream.rcs.revma.com/axg3fbau7ucwv',
                'id' => '11456c18-0567-4eee-bc7b-66af2e87d93a'
            ],
            [
                'code_name' => 'dance',
                'name' => 'Radio Star Dance',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://stream.rcs.revma.com/8uc5ab6t7ucwv',
            ],
            [
                'code_name' => 'nouveautes',
                'name' => 'Radio Star Nouveautés',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://stream.rcs.revma.com/t3wsk8mhcucwv',
                'id' => '272ed9d6-234e-48bd-b349-9542ee2b3114'
            ],
            [
                'code_name' => 'planete',
                'name' => 'Planète Radio Star',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://stream.rcs.revma.com/bz97zrbu7ucwv',
                'id' => 'f3121f1d-224d-4838-937f-8ed04a054b32'
            ],
            [
                'code_name' => 'france',
                'name' => 'Radio Star France',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://stream.rcs.revma.com/714c9zau7ucwv',
                'id' => 'aab75dbc-c614-477e-9cbc-b038aed34025'
            ],
            [
                'code_name' => 'tactic',
                'name' => 'Tac Tic Radio',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://stream.rcs.revma.com/y9dfrzbu7ucwv',
                'id' => '461ad395-36f7-4cfd-8748-0b22fe6201d6'
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

        $mainSubRadios = array_values(array_filter($subRadios, fn($subRadio) => $subRadio['sub_radio'] === true));
        $otherSubRadios = array_values(array_filter($subRadios, fn($subRadio) => $subRadio['sub_radio'] === false));

        for ($i = 0; $i < count($mainSubRadios); $i++) {
            $this->connection->executeQuery(
                'INSERT INTO sub_radio (id, radio_id, code_name, name, main, enabled) VALUES ('
                . ($i + $subRadioId) . ',' . $mainSubRadios[$i]['radio_id'] . ",'" . $prefix . '_' . $mainSubRadios[$i]['code_name'] . "','" . $mainSubRadios[$i]['name'] . "'," . $mainSubRadios[$i]['main'] . ',true);'
            );

            if (!empty($mainSubRadios[$i]['id'])) {
                $this->connection->executeQuery(
                    "UPDATE stream SET name = '"  . $mainSubRadios[$i]['name'] . "', stream_url = '" . $mainSubRadios[$i]['url'] . "', internal_use_img = false, radio_id = " . $radioId . ", is_main_radio = " . $mainSubRadios[$i]['main'] . ", is_sub_radio = TRUE, sub_radio_id = " . ($i + $subRadioId) . ", radio_stream_code_name = '" . $prefix . '_' . $mainSubRadios[$i]['code_name'] ."', own_logo = " . ($mainSubRadios[$i]['main'] ? 'FALSE' : 'TRUE') . ", stream_song_id = " . $streamSongId . ", stream_song_code_name = '"  . $mainSubRadios[$i]['code_name'] . "' WHERE id = '" . $mainSubRadios[$i]['id'] . "';"
                );
            } else {
                $streamId = \Symfony\Component\Uid\Uuid::v4()->toRfc4122();

                $this->connection->executeQuery(
                    "INSERT INTO stream (id, name, country_code, language, own_logo, stream_url, original_stream_url, internal_use_img, radio_id, is_main_radio, is_sub_radio, sub_radio_id, radio_stream_code_name, stream_song_id, stream_song_code_name) VALUES ('"
                    . $streamId . "','" . $mainSubRadios[$i]['name'] . "','FR','french',FALSE,'" . $mainSubRadios[$i]['url'] . "','" . $mainSubRadios[$i]['url'] . "', false, " . $radioId . ',' . $mainSubRadios[$i]['main'] . ", TRUE, " . ($i + $subRadioId) . ", '" . $prefix . '_' . $mainSubRadios[$i]['code_name'] . "'," . $streamSongId . ",'" . $mainSubRadios[$i]['code_name'] . "');"
                );
            }
        }

        for ($i = 0; $i < count($otherSubRadios); $i++) {
            if (!empty($otherSubRadios[$i]['id'])) {
                $this->connection->executeQuery(
                    "UPDATE stream SET name = '"  . $otherSubRadios[$i]['name'] . "', stream_url = '" . $otherSubRadios[$i]['url'] . "', internal_use_img = false, radio_id = " . $radioId . ", is_main_radio = " . $otherSubRadios[$i]['main'] . ", is_sub_radio = FALSE, sub_radio_id = NULL, radio_stream_code_name = '" . $prefix . '_' . $otherSubRadios[$i]['code_name'] ."', own_logo = TRUE, stream_song_id = " . $streamSongId . ", stream_song_code_name = '"  . $otherSubRadios[$i]['code_name'] . "' WHERE id = '" . $otherSubRadios[$i]['id'] . "';"
                );
            } else {
                $streamId = \Symfony\Component\Uid\Uuid::v4()->toRfc4122();

                $this->connection->executeQuery(
                    "INSERT INTO stream (id, name, country_code, language, own_logo, stream_url, original_stream_url, internal_use_img, radio_id, is_main_radio, is_sub_radio, sub_radio_id, radio_stream_code_name, stream_song_id, stream_song_code_name) VALUES ('"
                    . $streamId . "','" . $otherSubRadios[$i]['name'] . "','FR','french',TRUE,'" . $otherSubRadios[$i]['url'] . "','" . $otherSubRadios[$i]['url'] . "', false, " . $radioId . ',' . $otherSubRadios[$i]['main'] . ", FALSE, null, '" . $prefix . '_' . $otherSubRadios[$i]['code_name'] . "'," . $streamSongId . ",'" . $otherSubRadios[$i]['code_name'] . "');"
                );
            }
        }
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
