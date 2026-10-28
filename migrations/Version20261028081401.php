<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20261028081401 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $prefix = 'wit';
        $name = 'Wit FM';
        $radioId = 190;
        $subRadioId = 484;
        $streamSongId = 163;
        $website = 'https://www.witfm.fr';

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
                'code_name' => 'bordeaux',
                'name' => $name . ' Bordeaux',
                'main' => 'true',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://streams.lesindesradios.fr/play/radios/witfm/p1T2uH2K6r/any/300/165b2u.nhIwfyCST%2BGY36GrtWNWnRWri%2FamHC3heKPNsscjxO4%3D?format=hd&CAID=202610272136238404230434',
                'id' => '1055c1a4-07be-4a65-9b14-cc3d9009bc92'
            ],
            [
                'code_name' => 'arcachon',
                'name' => $name . ' Arcachon',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://streams.lesindesradios.fr/play/radios/witfm/xZ4hjdJwoj/any/300/165b2u.VSpMSVKJg68tCaYmUxQHXq%2FKaAXaJckkSBv0f5gVlL4%3D?format=hd&CAID=202610272136238404230434',
            ],
            [
                'code_name' => 'perigueux',
                'name' => $name . ' Périgueux',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://streams.lesindesradios.fr/play/radios/witfm/1yNQToCUVL/any/300/165b2u.jsWx8hkcoYs6RwkuGX9rZL4%2FgUwzc0CdDRj5nWrOHRk%3D?format=hd&CAID=202610272136238404230434'
            ],
            [
                'code_name' => 'flashback80',
                'name' => $name . ' Flashback 80',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://streams.lesindesradios.fr/play/radios/witfm/LNmXUgH5PE/any/300/165b2u.gDKuTMf8e53bhLzg4ZbESQcrG8%2Fpsqh0U6Z6P36aM6I%3D?format=hd&CAID=202610272136238404230434',
                'id' => '8d8ac8f6-70e0-4b5c-bcbd-e1a3f8d85194'
            ],
            [
                'code_name' => 'flashback90',
                'name' => $name . ' Flashback 90',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://streams.lesindesradios.fr/play/radios/witfm/MpPKeJogli/any/300/165b2u.J1Bb84h7ymVTN1DOodHUg%2BvfdQw97bJmKgVvNqiLUIQ%3D?format=hd&CAID=202610272136238404230434',
                'id' => '9613b951-0601-11e8-ae97-52543be04c81'
            ],
            [
                'code_name' => 'backto2000',
                'name' => $name . ' Back to 2000',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://streams.lesindesradios.fr/play/radios/witfm/lNx1QSSbtx/any/300/165b2u.4iMmuQUrexy3%2BQcS0JNaWxuUzVG8%2BITHn5pPtA4DBd8%3D?format=hd&CAID=202610272136238404230434',
                'id' => '9613ba27-0601-11e8-ae97-52543be04c81'
            ],
            [
                'code_name' => 'work_hits',
                'name' => $name . ' Work Hits',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://streams.lesindesradios.fr/play/radios/witfm/OdD0onszmx/any/300/165b2u.p71aLRHW%2F3e1nGnCSdUmU23OgoyUk82cMu9HiD4MN%2Bw%3D?format=hd&CAID=202610272136238404230434',
                'id' => '9613b2d6-0601-11e8-ae97-52543be04c81',
            ],
            [
                'code_name' => 'dancefloor',
                'name' => $name . ' Dancefloor',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://streams.lesindesradios.fr/play/radios/witfm/QUzNmvWBcc/any/300/165b2u.PO8uueuMaz4pYZIKN45jk2woNB0oeemeOMlQNbLcqYk%3D?format=hd&CAID=202610272136238404230434',
                'id' => '9613b618-0601-11e8-ae97-52543be04c81'
            ],
            [
                'code_name' => 'centpourcent_francais',
                'name' => $name . ' 100% Français',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://streams.lesindesradios.fr/play/radios/witfm/rO3XPYY6xt/any/300/165b2u.ExLY7h4jc15uFYf68%2Bt1V41og%2ByQ2ZyNs2Xc1D2Wa1s%3D?format=hd&CAID=202610272136238404230434',
                'id' => '0cedfa00-5027-419d-af93-864b8ac47fdb'
            ],
            [
                'code_name' => 'lounge',
                'name' => $name . ' Lounge',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://streams.lesindesradios.fr/play/radios/witfm/NRsshG5aI3/any/300/165b2u.4DqdUkVz1Ue7%2FsMvP6i6gCA8b4k6fK0hfursTOwCrrI%3D?format=hd&CAID=202610272136238404230434',
                'id' => '9613b487-0601-11e8-ae97-52543be04c81'
            ],
            [
                'code_name' => 'love_stories',
                'name' => $name . ' Love Stories',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://streams.lesindesradios.fr/play/radios/witfm/JcNk2bUWxu/any/300/165b2u.SdtmNthE5sYwtiHomPGTDcAarkgmzMFXziZxR0eJ4Tk%3D?format=hd&CAID=202610272136238404230434',
                'id' => '9613b3b9-0601-11e8-ae97-52543be04c81'
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
        $this->connection->executeQuery(
            'INSERT INTO stream_song (id, code_name, enabled) VALUES (' . $streamSongId . ",'" . $prefix . "', true);"
        );

        // {"type":"location","url":"...","referer":"https://www.witfm.fr/"}
        $streamData = fn(string $url): string => $this->connection->quote(json_encode(
            ['type' => 'location', 'url' => $url, 'referer' => $website . '/'],
            JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR
        ));

        $mainSubRadios = array_values(array_filter($subRadios, fn($subRadio) => $subRadio['sub_radio'] === true));
        $otherSubRadios = array_values(array_filter($subRadios, fn($subRadio) => $subRadio['sub_radio'] === false));

        for ($i = 0; $i < count($mainSubRadios); $i++) {
            $this->connection->executeQuery(
                'INSERT INTO sub_radio (id, radio_id, code_name, name, main, enabled) VALUES ('
                . ($i + $subRadioId) . ',' . $mainSubRadios[$i]['radio_id'] . ",'" . $prefix . '_' . $mainSubRadios[$i]['code_name'] . "','" . $mainSubRadios[$i]['name'] . "'," . $mainSubRadios[$i]['main'] . ',true);'
            );

            if (!empty($mainSubRadios[$i]['id'])) {
                $this->connection->executeQuery(
                    "UPDATE stream SET name = '"  . $mainSubRadios[$i]['name'] . "', stream_url = '" . $mainSubRadios[$i]['url'] . "', stream_data = " . $streamData($mainSubRadios[$i]['url']) . ", internal_use_img = false, radio_id = " . $radioId . ", is_main_radio = " . $mainSubRadios[$i]['main'] . ", is_sub_radio = TRUE, sub_radio_id = " . ($i + $subRadioId) . ", radio_stream_code_name = '" . $prefix . '_' . $mainSubRadios[$i]['code_name'] ."', own_logo = " . ($mainSubRadios[$i]['main'] ? 'FALSE' : 'TRUE') . ", stream_song_id = " . $streamSongId . ", stream_song_code_name = '"  . $mainSubRadios[$i]['code_name'] . "', website = '" . $website . "' WHERE id = '" . $mainSubRadios[$i]['id'] . "';"
                );
            } else {
                $streamId = \Symfony\Component\Uid\Uuid::v4()->toRfc4122();

                $this->connection->executeQuery(
                    "INSERT INTO stream (id, name, country_code, language, own_logo, stream_url, original_stream_url, stream_data, internal_use_img, radio_id, is_main_radio, is_sub_radio, sub_radio_id, radio_stream_code_name, stream_song_id, stream_song_code_name, website) VALUES ('"
                    . $streamId . "','" . $mainSubRadios[$i]['name'] . "','FR','french',FALSE,'" . $mainSubRadios[$i]['url'] . "','" . $mainSubRadios[$i]['url'] . "', " . $streamData($mainSubRadios[$i]['url']) . ", false, " . $radioId . ',' . $mainSubRadios[$i]['main'] . ", TRUE, " . ($i + $subRadioId) . ", '" . $prefix . '_' . $mainSubRadios[$i]['code_name'] . "'," . $streamSongId . ",'" . $mainSubRadios[$i]['code_name'] . "', '" . $website . "');"
                );
            }
        }

        for ($i = 0; $i < count($otherSubRadios); $i++) {
            if (!empty($otherSubRadios[$i]['id'])) {
                $this->connection->executeQuery(
                    "UPDATE stream SET name = '"  . $otherSubRadios[$i]['name'] . "', stream_url = '" . $otherSubRadios[$i]['url'] . "', stream_data = " . $streamData($otherSubRadios[$i]['url']) . ", internal_use_img = false, radio_id = " . $radioId . ", is_main_radio = " . $otherSubRadios[$i]['main'] . ", is_sub_radio = FALSE, sub_radio_id = NULL, radio_stream_code_name = '" . $prefix . '_' . $otherSubRadios[$i]['code_name'] ."', own_logo = TRUE, stream_song_id = " . $streamSongId . ", stream_song_code_name = '"  . $otherSubRadios[$i]['code_name'] . "' WHERE id = '" . $otherSubRadios[$i]['id'] . "';"
                );
            } else {
                $streamId = \Symfony\Component\Uid\Uuid::v4()->toRfc4122();

                $this->connection->executeQuery(
                    "INSERT INTO stream (id, name, country_code, language, own_logo, stream_url, original_stream_url, stream_data, internal_use_img, radio_id, is_main_radio, is_sub_radio, sub_radio_id, radio_stream_code_name, stream_song_id, stream_song_code_name) VALUES ('"
                    . $streamId . "','" . $otherSubRadios[$i]['name'] . "','FR','french',TRUE,'" . $otherSubRadios[$i]['url'] . "','" . $otherSubRadios[$i]['url'] . "', " . $streamData($otherSubRadios[$i]['url']) . ", false, " . $radioId . ',' . $otherSubRadios[$i]['main'] . ", FALSE, null, '" . $prefix . '_' . $otherSubRadios[$i]['code_name'] . "'," . $streamSongId . ",'" . $otherSubRadios[$i]['code_name'] . "');"
                );
            }
        }
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
