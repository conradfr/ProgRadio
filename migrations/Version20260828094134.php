<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260828094134 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $prefix = 'topmusic';
        $radioId = 98;
        $subRadioId = 383;
        $streamSongId = 81;
        $website = 'https://www.topmusic.fr/';

        $subRadios = [
            [
                'code_name' => 'saintmarieauxmines',
                'name' => 'Top Music Sainte-Marie aux Mines',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://sc.creacast.com/topmusic_sainte_marie?token=exp=1787910797~acl=.com~hmac=38cbdb31b0fcab6a67226bb7891162f76e5bfee6b5668db13f2d79fc94b6feff&CAID=20260828113812744370389&trk_ir_c=0',
                'id' => '9606d34d-0601-11e8-ae97-52543be04c81'
            ],
            [
                'code_name' => 'schirmeck',
                'name' => 'Top Music Schirmeck',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://sc.creacast.com/topmusic_schirmeck?token=exp=1787910877~acl=.com~hmac=b84d34d5ff28f357f2d2e97077aa5f160e4325de2ac26f0e250e3cbf784f1e66&CAID=20260828113812744370389&trk_ir_c=0',
                'id' => '09d40b6f-11c7-4e69-85df-d0e95dc28363'
            ],
            [
                'code_name' => 'selestat',
                'name' => 'Top Music Sélestat',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://sc.creacast.com/topmusic_selestat?token=exp=1787910930~acl=.com~hmac=08c64419796d39bcfcbf9201f9cb18be3413e884d0ff0e5ec35c72af7f761c3b&CAID=20260828113812744370389&trk_ir_c=0',
                'id' => '6b005da9-d80c-4c3d-9ebe-e57041ed0cfe'
            ],
            [
                'code_name' => 'colmar',
                'name' => 'Top Music Colmar',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://sc.creacast.com/topmusic_colmar?token=exp=1787910981~acl=.com~hmac=a5250acd3f5695f0a6c363073e7bbc15b4025b31b82554ae6419615f63972328&CAID=20260828113812744370389&trk_ir_c=0',
                'id' => '9614cf7f-0601-11e8-ae97-52543be04c81'
            ],
            [
                'code_name' => 'mulhouse',
                'name' => 'Top Music Mulhouse',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://sc.creacast.com/topmusic_mulhouse?token=exp=1787911049~acl=.com~hmac=1298646f1d826cf96ddf308704de3b654b30c5628ad9bec550611aa44016062b&CAID=20260828113812744370389&trk_ir_c=0',
                'id' => '2a2e9b53-7149-4bc1-b958-49a66091f5d5'
            ],
            [
                'code_name' => 'sarrebourg',
                'name' => 'Top Music Sarrebourg',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://sc.creacast.com/topmusic_sarrebourg?token=exp=1787911098~acl=.com~hmac=0b23d574f65f4c78710d4fed0559fbaa5343a104f69c3894994f901ddeba23aa&CAID=20260828113812744370389&trk_ir_c=0',
                'id' => '9614cebe-0601-11e8-ae97-52543be04c81'
            ],
            [
                'code_name' => 'haguenau',
                'name' => 'Top Music Haguenau',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://sc.creacast.com/topmusic_haguenau?token=exp=1787911137~acl=.com~hmac=c64b1f7e8115126caa3a79e7dce272fdc785108275401644ea5699e0fa5f7040&CAID=20260828113812744370389&trk_ir_c=0',
                'id' => '9614cbff-0601-11e8-ae97-52543be04c81'
            ],
            [
                'code_name' => 'strasbourg',
                'name' => 'Top Music Strasbourg',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://sc.creacast.com/topmusic_strasbourg?token=exp=1787911179~acl=.com~hmac=11766c23a6b3220f30e6d451bfb8fdfe2980e3f0d9808ac3ce19cc00095c181b&CAID=20260828113812744370389&trk_ir_c=0',
            ],
            [
                'code_name' => 'saverne',
                'name' => 'Top Music Saverne',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://sc.creacast.com/topmusic_saverne?token=exp=1787911214~acl=.com~hmac=3812d473ba8e8bca15942a172a1bd4687b3037d8c7815f2e0eec51910d93da3d&CAID=20260828113812744370389&trk_ir_c=0',
                'id' => '9614cdfd-0601-11e8-ae97-52543be04c81'
            ],


            [
                'code_name' => 'top80',
                'name' => 'Top Music Top 80',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://sc.creacast.com/topmusic_80?token=exp=1787911265~acl=.com~hmac=07d1b202a924dd357811979c10a1fa4b3179f1f6b5e645c8ddbe6945616dcfcb&CAID=20260828113812744370389&trk_ir_c=0',
                'id' => '935fedda-3858-4a47-8d8c-0c6d52cb24fa'
            ],
            [
                'code_name' => 'topfitness',
                'name' => 'Top Music Top Fitness',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://sc.creacast.com/topmusic_sport?token=exp=1787911304~acl=.com~hmac=4a5c0b182fb3a6660ad6fa46ebc1b1991ff9bc49421bccbaa6b6abaf45761589&CAID=20260828113812744370389&trk_ir_c=0',
            ],
            [
                'code_name' => 'toplove',
                'name' => 'Top Music Top Love',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://sc.creacast.com/topmusic_noel?token=exp=1787911371~acl=.com~hmac=94208dee1e0066e2c588a549c74ea765b54b620a6ad1b1eac3db25e02e916cd1&CAID=20260828113812744370389&trk_ir_c=0',
            ]
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
