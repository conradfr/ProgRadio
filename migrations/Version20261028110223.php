<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20261028110223 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $prefix = 'rva';
        $name = 'RVA';
        $radioId = 193;
        $subRadioId = 497;
        $website = 'https://www.radiorva.com';
        $streamSongId = 165;

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
                'code_name' => 'ambert',
                'name' => $name . ' Ambert',
                'main' => 'true',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://rva.ice.infomaniak.ch/rva-ambert.mp3?aw_0_1st.playerId=radioaddict&i=71405',
                'id' => '961abe98-0601-11e8-ae97-52543be04c81'
            ],
            [
                'code_name' => 'riommontagnes',
                'name' => $name . ' Riom es Montagnes',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://rva.ice.infomaniak.ch/rva-auvergne-sud.aac?aw_0_1st.playerId=radioaddict',
            ],
            [
                'code_name' => 'clermont',
                'name' => $name . ' Clermont-Ferrand',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://rva.ice.infomaniak.ch/rva-high.aac?aw_0_1st.playerId=radioaddict',
            ],
            [
                'code_name' => 'thiers',
                'name' => $name . ' Thiers',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://rva.ice.infomaniak.ch/rva-ambert.aac?aw_0_1st.playerId=radioaddict',
            ],
            [
                'code_name' => 'riom',
                'name' => $name . ' Riom',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://rva.ice.infomaniak.ch/rva-auvergne-sud.aac?aw_0_1st.playerId=radioaddict',
            ],
            [
                'code_name' => 'issoire',
                'name' => $name . ' Issoire',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://rva.ice.infomaniak.ch/rva-auvergne-sud.aac?aw_0_1st.playerId=radioaddict',
            ],
            [
                'code_name' => 'gannat',
                'name' => $name . ' Gannat',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://rva.ice.infomaniak.ch/rva-auvergne-sud.aac?aw_0_1st.playerId=radioaddict',
            ],
            [
                'code_name' => 'vichy',
                'name' => $name . ' Vichy',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://rva.ice.infomaniak.ch/rva-vichy.aac?aw_0_1st.playerId=radioaddict',
            ],
            [
                'code_name' => 'brioude',
                'name' => $name . ' Brioude',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://rva.ice.infomaniak.ch/rva-auvergne-sud.aac?aw_0_1st.playerId=radioaddict',
            ],
            [
                'code_name' => 'annees80',
                'name' => $name . ' Best of 80s',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://egwr-rva-80.ice.infomaniak.ch/rva-annees-80.mp3?aw_0_1st.playerId=radioaddict'
            ],
            [
                'code_name' => 'annees90',
                'name' => $name . ' Best of 90s',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://rva-wr01.ice.infomaniak.ch/rva-wr01.mp3?aw_0_1st.playerId=radioaddict',
                'id' => 'fe24c0a3-a786-41be-ae6c-d503c6ebc246'
            ],
            [
                'code_name' => 'annees2000',
                'name' => $name . ' Best of 00s',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://rva-annees-2000.ice.infomaniak.ch/rva-annees-2000.mp3?aw_0_1st.playerId=radioaddict'
            ],
            [
                'code_name' => 'annees2010',
                'name' => $name . ' Best of 10s',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://rva-annees-2010.ice.infomaniak.ch/rva-annees-2010.aac?aw_0_1st.playerId=radioaddict'
            ],
            [
                'code_name' => 'dance90',
                'name' => $name . ' Dance 90',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://rva-dance-90.ice.infomaniak.ch/rva-dance-90.mp3?aw_0_1st.playerId=radioaddict'
            ],
            [
                'code_name' => 'rock',
                'name' => $name . ' Rock',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://rva-rock.ice.infomaniak.ch/rva-rock.mp3?aw_0_1st.playerId=radioaddict'
            ],
            [
                'code_name' => 'latino',
                'name' => $name . ' Latino',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://rva-latino.ice.infomaniak.ch/rva-latino.mp3?aw_0_1st.playerId=radioaddict'
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
