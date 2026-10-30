<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20261029102800 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $prefix = 'radio_espace';
        $name = 'Radio Espace';
        $radioId = 195;
        $subRadioId = 508;
        $website = 'https://www.radioespace.com/';
        $streamSongId = 167;

        $radios = [
            [
                'code_name' => $prefix,
                'name' => $name,
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
                'name' => $name,
                'main' => 'true',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://radioespace.ice.infomaniak.ch/radioespace-high.mp3',
                'id' => '9616b635-0601-11e8-ae97-52543be04c81'
            ],
            [
                'code_name' => 'frenchmix',
                'name' => $name . ' French Mix',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://radioespacefrenchmix.ice.infomaniak.ch/radioespacefrenchmix.mp3',
            ],
            [
                'code_name' => 'classics',
                'name' => $name . ' Classics',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://espace-classic.ice.infomaniak.ch/espace-classic.mp3',
            ],
            [
                'code_name' => 'frenchtouch',
                'name' => $name . ' French Touch',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://egwr-espace-001.ice.infomaniak.ch/egwr-espace-001.mp3',
                'id' => '03af41ae-7504-44f6-ad66-ea1cefaedf22'
            ],
            [
                'code_name' => 'latino',
                'name' => $name . ' Latino',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://egwr-espace-latino.ice.infomaniak.ch/egwr-espace-latino.mp3',
                'id' => '1d1a2896-0cd1-4248-bc72-b64d84799ac0'
            ],
            [
                'code_name' => 'hot30',
                'name' => $name . ' Hot 30',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://espace-vintage.ice.infomaniak.ch/espace-vintage-high.mp3',
                'id' => '96165c8e-0601-11e8-ae97-52543be04c81'
            ],
            [
                'code_name' => 'club',
                'name' => $name . ' Club',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://espace100.ice.infomaniak.ch/espace100-high.mp3',
                'id' => '96173791-0601-11e8-ae97-52543be04c81'
            ],
            [
                'code_name' => 'dance90',
                'name' => $name . ' Dance 90',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://espace-disco.ice.infomaniak.ch/espace-disco-high.mp3',
                'id' => '9616baeb-0601-11e8-ae97-52543be04c81'
            ],
            [
                'code_name' => 'djlyonnais',
                'name' => 'DJ Lyonnais by ' . $name,
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://radio-espace-dj-lyonnais.ice.infomaniak.ch/radio-espace-dj-lyonnais.mp3',
                'id' => '6b79597c-ad53-4071-81d9-13a5213e8ce1'
            ],
            [
                'code_name' => 'lalouradio',
                'name' => 'La Lou Radio by ' . $name,
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://lalouradio.ice.infomaniak.ch/lalouradio.mp3',
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
