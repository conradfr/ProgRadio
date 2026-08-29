<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260829055821 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $prefix = 'evasionfm';
        $radioId = 75;
        $subRadioId = 424;
        $streamSongId = 78;
        $website = 'https://www.evasionfm.com/';

        $subRadios = [
            [
                'code_name' => 'main',
                'name' => 'Evasion Paris',
                'main' => 'true',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://evasion75.ice.infomaniak.ch/evasion75-96.aac',
                'id' => '1c9f37ee-cf8c-4832-b6b5-26a08954e45d'
            ],
            [
                'code_name' => 'essonne',
                'name' => 'Evasion Essonne',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://evasion91.ice.infomaniak.ch/evasion91-96.aac',
                'id' => '9614c299-0601-11e8-ae97-52543be04c81'
            ],
            [
                'code_name' => 'eure',
                'name' => 'Evasion Eure',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://evasion78n.ice.infomaniak.ch/evasion78n-96.aac',
            ],
            [
                'code_name' => 'seineetmarne_nord',
                'name' => 'Evasion Seine-et-Marne Nord',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://evasion77n.ice.infomaniak.ch/evasion77n-96.aac',
                'id' => '9614bef3-0601-11e8-ae97-52543be04c81'
            ],
            [
                'code_name' => 'seineetmarne_sud',
                'name' => 'Evasion Seine-et-Marne Sud',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://evasion77s.ice.infomaniak.ch/evasion77s-96.aac',
                'id' => '9614c0d5-0601-11e8-ae97-52543be04c81'
            ],
            [
                'code_name' => 'seine_maritime',
                'name' => 'Evasion Seine-Maritime',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://evasion75.ice.infomaniak.ch/evasion75-96.aac',
            ],
            [
                'code_name' => 'somme',
                'name' => 'Evasion Somme',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://evasion80.ice.infomaniak.ch/evasion80-96.aac?token=exp%3D1787984421~acl%3D%2Fevasion80-96~hmac%3D9c83515502b7e59c56e438a31f60dabf92f607e4de4f47d5989ebe0219cd23a8&CAID=202608290051482060344863&trk_ir_c=0',
                'id' => '9614c1c4-0601-11e8-ae97-52543be04c81'
            ],
            [
                'code_name' => 'yvelines_nord',
                'name' => 'Evasion Yvelines Nord',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://evasion78n.ice.infomaniak.ch/evasion78n-96.aac',
                'id' => '9608e425-0601-11e8-ae97-52543be04c81'
            ],
            [
                'code_name' => 'yvelines_sud',
                'name' => 'Evasion Yvelines Sud',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://evasion78s.ice.infomaniak.ch/evasion78s-96.aac',
            ],
        ];

        $mainSubRadios = array_values(array_filter($subRadios, fn($subRadio) => $subRadio['sub_radio'] === true));
        $otherSubRadios = array_values(array_filter($subRadios, fn($subRadio) => $subRadio['sub_radio'] === false));

        for ($i = 0; $i < count($mainSubRadios); $i++) {
            $this->connection->executeQuery(
                'INSERT INTO sub_radio (id, radio_id, code_name, name, main, enabled) VALUES ('
                . ($i + $subRadioId) . ',' . $mainSubRadios[$i]['radio_id'] . ",'" . $prefix . '_' . $mainSubRadios[$i]['code_name'] . "','" . $mainSubRadios[$i]['name'] . "'," . $mainSubRadios[$i]['main'] . ',true);'
            );

            if (!empty($mainSubRadios[$i]['id'])) {
                $this->connection->executeQuery(
                    "UPDATE stream SET name = '"  . $mainSubRadios[$i]['name'] . "', stream_url = '" . $mainSubRadios[$i]['url'] . "', internal_use_img = false, radio_id = " . $radioId . ", is_main_radio = " . $mainSubRadios[$i]['main'] . ", is_sub_radio = TRUE, sub_radio_id = " . ($i + $subRadioId) . ", radio_stream_code_name = '" . $prefix . '_' . $mainSubRadios[$i]['code_name'] ."', own_logo = FALSE, stream_song_id = " . $streamSongId . ", stream_song_code_name = '"  . $mainSubRadios[$i]['code_name'] . "' WHERE id = '" . $mainSubRadios[$i]['id'] . "';"
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
                    "UPDATE stream SET name = '"  . $otherSubRadios[$i]['name'] . "', stream_url = '" . $otherSubRadios[$i]['url'] . "', internal_use_img = false, radio_id = " . $radioId . ", is_main_radio = " . $otherSubRadios[$i]['main'] . ", is_sub_radio = FALSE, sub_radio_id = NULL, radio_stream_code_name = '" . $prefix . '_' . $otherSubRadios[$i]['code_name'] ."', own_logo = FALSE, stream_song_id = " . $streamSongId . ", stream_song_code_name = '"  . $otherSubRadios[$i]['code_name'] . "' WHERE id = '" . $otherSubRadios[$i]['id'] . "';"
                );
            } else {
                $streamId = \Symfony\Component\Uid\Uuid::v4()->toRfc4122();

                $this->connection->executeQuery(
                    "INSERT INTO stream (id, name, country_code, language, own_logo, stream_url, original_stream_url, internal_use_img, radio_id, is_main_radio, is_sub_radio, sub_radio_id, radio_stream_code_name, stream_song_id, stream_song_code_name) VALUES ('"
                    . $streamId . "','" . $otherSubRadios[$i]['name'] . "','FR','french',FALSE,'" . $otherSubRadios[$i]['url'] . "','" . $otherSubRadios[$i]['url'] . "', false, " . $radioId . ',' . $otherSubRadios[$i]['main'] . ", FALSE, null, '" . $prefix . '_' . $otherSubRadios[$i]['code_name'] . "'," . $streamSongId . ",'" . $otherSubRadios[$i]['code_name'] . "');"
                );
            }
        }
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
