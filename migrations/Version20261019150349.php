<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20261019150349 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $prefix = 'ado';
        $radioId = 186;
        $subRadioId = 478;
        $streamSongId = 161;
        $website = 'https://www.ado.fr/';

        $radios = [
            [
                'code_name' => $prefix,
                'name' => 'ADO',
                'category' => 2,
                'collection' => 9,
                'share' => 0,
                'country' => 'FR',
                'timezone' => 'Europe/Paris'
            ],
        ];

        $subRadios = [
            [
                'code_name' => 'main',
                'name' => 'ADO',
                'main' => 'true',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://start-adofm.radiohls.infomaniak.com/start-adofm/manifest.m3u8?aw_0_1st.rpfr=0&deviceid=03f350df-713b-459f-aff2-4d0804a7089f&advertisingid=03f350df-713b-459f-aff2-4d0804a7089f&consent=CQjUoYAQjUoYAAHABBENCcFoAPLAAELAAAwIF5wAgD9gLzAvOACAvMAA.IF5wAgD9gLzA.flgACFgAAAAA&lat=0.0&long=0.0&appversion=8.16.1&advertisingidtype=app&playerid=RPWWEB&timestamp=1792390090&incar=0',
                'id' => 'b8bbc931-c823-4de9-bf1a-0b8a6a4c92f9'
            ],
            [
                'code_name' => 'backtoclassics',
                'name' => 'ADO Back to Classics',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://securestream-api.radioplayer.cloud/v1/radios/2503834/streams?securestreamId=2299&rp_source=1',
            ],
            [
                'code_name' => 'flashback',
                'name' => 'ADO Flashback',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://streams.lesindesradios.fr/play/radios/adofm/5Z2yF1B86O/any/300/15p5i7.arvo8ilLbtMQyyjve4yPMH0znKfkOiBs87aHtkrWw1E%3D?format=hd&CAID=202608280816445431637101'
            ],
            [
                'code_name' => 'jayz',
                'name' => 'ADO Jay-z',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://streams.lesindesradios.fr/play/radios/adofm/1jT0cE77Yw/any/300/15p5i7.afeWKLBdKwhsjHzizQFrZthaCyGh4QIobuMMF%2FSTmzo%3D?format=hd&CAID=202608280816445431637101',
            ],
            [
                'code_name' => 'work',
                'name' => 'ADO Work Flow',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => ' https://adowork.ice.infomaniak.ch/adowork-128.mp3',
                'id' => '4803d75c-2139-49cc-a0cb-698087757a9e'
            ],
            [
                'code_name' => 'classicus',
                'name' => 'ADO US Classic',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://adoclassicus.ice.infomaniak.ch/adoclassicus-128.mp3',
                'id' => '2c2d9299-9347-439a-b537-8b4cc144cfb4'
            ],
            [
                'code_name' => 'francais',
                'name' => 'ADO 100% Français',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://streams.lesindesradios.fr/play/radios/adofm/Vnknxbmmlf/any/300/15p5i7.iXxSYyhm0wIrs3mMTgSrOGo65%2FqltN55eY2mOp5knq8%3D?format=hd&CAID=202608280816445431637101',
                'id' => '6d06a743-9375-4543-9b30-cb9943ad6589',
            ],
            [
                'code_name' => 'rnb',
                'name' => 'ADO RNB Love',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://adomidnightlove.ice.infomaniak.ch/adomidnightlove-128.mp3',
                'id' => '0ba87713-ee52-43c3-be96-88766cd48307'
            ],
            [
                'code_name' => 'us',
                'name' => 'ADO US',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://streams.lesindesradios.fr/play/radios/adofm/ZQwbXKmcZy/any/300/15p5i7.ef4UxZ6q1ENVJHa30b%2B0IVNhbcxx4WiF%2F5cgDxe%2Fv4Q%3D?format=hd&CAID=202608280816445431637101',
            ],
        ];

        for ($i = 0; $i < count($radios); $i++) {
            $this->connection->executeQuery(
                'INSERT INTO radio (id, category_id, code_name, name, country_code, timezone, share, collection_id, website) VALUES ('
                . ($i + $radioId) . ',' . $radios[$i]['category'] . ",'" . $radios[$i]['code_name'] . "','" . $radios[$i]['name'] . "','" . $radios[$i]['country'] . "','" . $radios[$i]['timezone'] . "'," . $radios[$i]['share'] . "," . $radios[$i]['collection'] . ",'" . $website . "');"
            );
        }

        // song
        $this->connection->executeQuery(
            'INSERT INTO stream_song (id, code_name, enabled) VALUES (' . $streamSongId . ",'" . $prefix . "', true);"
        );

        $mainSubRadios = array_values(array_filter($subRadios, fn($subRadio) => $subRadio['sub_radio'] === true));
        $otherSubRadios = array_values(array_filter($subRadios, fn($subRadio) => $subRadio['sub_radio'] === false));

        for ($i = 0; $i < count($mainSubRadios); $i++) {
            $this->connection->executeQuery(
                'INSERT INTO sub_radio (id, radio_id, code_name, name, main, enabled) VALUES ('
                . ($i + $subRadioId) . ',' . $mainSubRadios[$i]['radio_id'] . ",'" . $prefix . '_' . $mainSubRadios[$i]['code_name'] . "','" . $mainSubRadios[$i]['name'] . "'," . $mainSubRadios[$i]['main'] . ',true);'
            );

            if (!empty($mainSubRadios[$i]['id'])) {
                $this->connection->executeQuery(
                    "UPDATE stream SET name = '"  . $mainSubRadios[$i]['name'] . "', stream_url = '" . $mainSubRadios[$i]['url'] . "', internal_use_img = false, radio_id = " . $radioId . ", is_main_radio = " . $mainSubRadios[$i]['main'] . ", is_sub_radio = TRUE, sub_radio_id = " . ($i + $subRadioId) . ", radio_stream_code_name = '" . $prefix . '_' . $mainSubRadios[$i]['code_name'] ."', own_logo = " . ($mainSubRadios[$i]['main'] ? 'FALSE' : 'TRUE') . ", stream_song_id = " . $streamSongId . ", stream_song_code_name = '"  . $mainSubRadios[$i]['code_name'] . "', website = '" . $website . "' WHERE id = '" . $mainSubRadios[$i]['id'] . "';"
                );
            } else {
                $streamId = \Symfony\Component\Uid\Uuid::v4()->toRfc4122();

                $this->connection->executeQuery(
                    "INSERT INTO stream (id, name, country_code, language, own_logo, stream_url, original_stream_url, internal_use_img, radio_id, is_main_radio, is_sub_radio, sub_radio_id, radio_stream_code_name, stream_song_id, stream_song_code_name, website) VALUES ('"
                    . $streamId . "','" . $mainSubRadios[$i]['name'] . "','FR','french',FALSE,'" . $mainSubRadios[$i]['url'] . "','" . $mainSubRadios[$i]['url'] . "', false, " . $radioId . ',' . $mainSubRadios[$i]['main'] . ", TRUE, " . ($i + $subRadioId) . ", '" . $prefix . '_' . $mainSubRadios[$i]['code_name'] . "'," . $streamSongId . ",'" . $mainSubRadios[$i]['code_name'] . "', '" . $website . "');"
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
