<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20261101102236 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $prefix = 'dkl';
        $name = 'DKL';
        $radioId = (int) $this->connection->fetchOne('SELECT COALESCE(MAX(id), 0) + 1 FROM radio');
        $subRadioId = (int) $this->connection->fetchOne('SELECT COALESCE(MAX(id), 0) + 1 FROM sub_radio');
        $website = 'https://www.radiodkl.com';
        $streamSongId = (int) $this->connection->fetchOne('SELECT COALESCE(MAX(id), 0) + 1 FROM stream_song');

        $radios = [
            [
                'code_name' => $prefix,
                'name' => $name,
                'category' => 2,
                'collection' => 3,
                'share' => 0,
                'country' => 'FR',
                'timezone' => 'Europe/Paris'
            ],
        ];

        $subRadios = [
            [
                'code_name' => 'mulhouse_altkirch',
                'name' => $name . ' Mulhouse-Altkirch',
                'main' => 'true',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://stream.rcs.revma.com/aguwyw7fkzzuv',
                'id' => 'aad59c73-b220-4577-9b0f-83892959cdd9',
            ],
            [
                'code_name' => 'strasbourg',
                'name' => $name . ' Strasbourg-Saverne-Obernai',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://stream.rcs.revma.com/1vm371agkzzuv',
            ],
            [
                'code_name' => 'selestat',
                'name' => $name . ' Sélestat',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://stream.rcs.revma.com/wcrk7f9fkzzuv',
                'id' => '16c73d3e-1a54-4e24-98db-d394777fc890',
            ],
            [
                'code_name' => 'haguenau_wissembourg',
                'name' => $name . ' Haguenau-Wissembourg',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://stream.rcs.revma.com/a10a84kyt4zuv',
                'id' => 'ca516fab-267a-4d2e-8844-75b486b34734',
            ],
            [
                'code_name' => 'flashback80',
                'name' => $name . ' Flashback 80',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://stream.rcs.revma.com/rqv7dpybn72vv',
            ],
            [
                'code_name' => 'noel',
                'name' => $name . ' Noël',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://stream.rcs.revma.com/6pwqeben0k0uv',
            ],
            [
                'code_name' => 'centpourcent_francais',
                'name' => $name . ' 100% Chansons françaises',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://stream.rcs.revma.com/y28hq7qddhuvv',
            ],
            [
                'code_name' => 'annees60',
                'name' => $name . ' Années 60',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://stream.rcs.revma.com/g0bebf19dhuvv',
            ],
            [
                'code_name' => 'annees70',
                'name' => $name . ' Années 70',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://stream.rcs.revma.com/30e92v19dhuvv',
            ],
            [
                'code_name' => 'disco',
                'name' => $name . ' Disco',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://stream.rcs.revma.com/7um34uqddhuvv',
            ],
            [
                'code_name' => 'tonton_robby',
                'name' => $name . ' Tonton Robby',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://stream.rcs.revma.com/x81sb1uvszzuv',
            ],
            [
                'code_name' => 'generations',
                'name' => 'Générations ' . $name,
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://stream.rcs.revma.com/x2etn9pddhuvv',
            ],
            [
                'code_name' => 'chansons_allemandes',
                'name' => $name . ' Chansons allemandes',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://stream.rcs.revma.com/x9xzxehcfwzuv',
                'id' => 'e25fe824-4fa6-4786-9ff9-9aac28028daa',
            ],
            [
                'code_name' => 'vos_plus_belles_chansons',
                'name' => $name . ' Vos plus belles chansons',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://stream.rcs.revma.com/cvcrbdtzmwzuv',
                'id' => 'e41b4517-8856-444f-9109-c979ecdf865d',
            ],
            [
                'code_name' => 'apres_ski',
                'name' => $name . ' Après-ski',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://stream.rcs.revma.com/bdptknzunwzuv',
            ],
            [
                'code_name' => 'crooner',
                'name' => $name . ' Crooner',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://stream.rcs.revma.com/20396bhcfwzuv',
                'id' => '29334efa-1e54-4809-b6e3-c2c9c72ad743',
            ],
            [
                'code_name' => 'elsass_music',
                'name' => $name . ' Elsass Music',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://stream.rcs.revma.com/8kcgcyeu87zuv',
            ],
            [
                'code_name' => 'radio_liberte',
                'name' => 'Radio Liberté la Webradio',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://stream.rcs.revma.com/5h4db19t87zuv',
            ],
        ];

        for ($i = 0; $i < count($radios); $i++) {
            $this->connection->executeQuery(
                'INSERT INTO radio (id, category_id, code_name, name, country_code, timezone, share, collection_id, website) VALUES ('
                . ($i + $radioId) . ',' . $radios[$i]['category'] . ",'" . $radios[$i]['code_name'] . "','" . $radios[$i]['name'] . "','" . $radios[$i]['country'] . "','" . $radios[$i]['timezone'] . "'," . $radios[$i]['share'] . "," . $radios[$i]['collection'] . ",'" . $website . "');"
            );

            $this->connection->executeStatement(
                'INSERT INTO api_key_radio (api_key_id, radio_id) VALUES (?, ?) ON CONFLICT DO NOTHING',
                [(string) $_SERVER['DEFAULT_RADIO_API_KEY'], ($i + $radioId)]);
            $this->connection->executeStatement(
                'INSERT INTO api_user_radio (api_user_id, radio_id) VALUES (?, ?) ON CONFLICT DO NOTHING',
                [(int) $_SERVER['DEFAULT_RADIO_API_USER'], ($i + $radioId)]
            );
        }

        // song
        if ($streamSongId) {
            $this->connection->executeQuery(
                'INSERT INTO stream_song (id, code_name, enabled) VALUES (' . $streamSongId . ",'" . $prefix . "', true);"
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
                    "UPDATE stream SET name = '"  . $mainSubRadios[$i]['name'] . "', stream_url = '" . $mainSubRadios[$i]['url'] . "', internal_use_img = false, radio_id = " . $radioId . ", is_main_radio = " . $mainSubRadios[$i]['main'] . ", is_sub_radio = TRUE, sub_radio_id = " . ($i + $subRadioId) . ", radio_stream_code_name = '" . $prefix . '_' . $mainSubRadios[$i]['code_name'] ."', own_logo = " . ($mainSubRadios[$i]['main'] ? 'FALSE' : 'TRUE') . ", stream_song_id = " . ($streamSongId ?? 'NULL') . ", stream_song_code_name = '"  . ($streamSongId ? $mainSubRadios[$i]['code_name'] : 'NULL') . "', website = '" . $website . "' WHERE id = '" . $mainSubRadios[$i]['id'] . "';"
                );
            } else {
                $streamId = \Symfony\Component\Uid\Uuid::v4()->toRfc4122();

                $this->connection->executeQuery(
                    "INSERT INTO stream (id, name, country_code, language, own_logo, stream_url, original_stream_url, internal_use_img, radio_id, is_main_radio, is_sub_radio, sub_radio_id, radio_stream_code_name, stream_song_id, stream_song_code_name, website) VALUES ('"
                    . $streamId . "','" . $mainSubRadios[$i]['name'] . "','FR','french',FALSE,'" . $mainSubRadios[$i]['url'] . "','" . $mainSubRadios[$i]['url'] . "', false, " . $radioId . ',' . $mainSubRadios[$i]['main'] . ", TRUE, " . ($i + $subRadioId) . ", '" . $prefix . '_' . $mainSubRadios[$i]['code_name'] . "'," . ($streamSongId ?? 'NULL') . "," . ($streamSongId ? "'" . $mainSubRadios[$i]['code_name'] . "'" : 'NULL') . ", '" . $website . "');"
                );
            }
        }

        for ($i = 0; $i < count($otherSubRadios); $i++) {
            if (!empty($otherSubRadios[$i]['id'])) {
                $this->connection->executeQuery(
                    "UPDATE stream SET name = '"  . $otherSubRadios[$i]['name'] . "', stream_url = '" . $otherSubRadios[$i]['url'] . "', internal_use_img = false, radio_id = " . $radioId . ", is_main_radio = " . $otherSubRadios[$i]['main'] . ", is_sub_radio = FALSE, sub_radio_id = NULL, radio_stream_code_name = '" . $prefix . '_' . $otherSubRadios[$i]['code_name'] ."', own_logo = TRUE, stream_song_id = " . ($streamSongId ?? 'NULL') . ", stream_song_code_name = "  . ($streamSongId ? "'" . $otherSubRadios[$i]['code_name'] . "'" : 'NULL') . " WHERE id = '" . $otherSubRadios[$i]['id'] . "';"
                );
            } else {
                $streamId = \Symfony\Component\Uid\Uuid::v4()->toRfc4122();

                $this->connection->executeQuery(
                    "INSERT INTO stream (id, name, country_code, language, own_logo, stream_url, original_stream_url, internal_use_img, radio_id, is_main_radio, is_sub_radio, sub_radio_id, radio_stream_code_name, stream_song_id, stream_song_code_name) VALUES ('"
                    . $streamId . "','" . $otherSubRadios[$i]['name'] . "','FR','french',TRUE,'" . $otherSubRadios[$i]['url'] . "','" . $otherSubRadios[$i]['url'] . "', false, " . $radioId . ',' . $otherSubRadios[$i]['main'] . ", FALSE, null, '" . $prefix . '_' . $otherSubRadios[$i]['code_name'] . "'," . ($streamSongId ?? 'NULL') . "," . ($streamSongId ? "'" . $otherSubRadios[$i]['code_name'] . "'" : 'NULL') . ");"
                );
            }
        }
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
