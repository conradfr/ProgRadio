<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260828073623 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $prefix = 'hitwest';
        $radioId = 89;
        $subRadioId = 359;
        $streamSongId = 59;
        $website = 'https://hitwest.ouest-france.fr';

        $subRadios = [
            [
                'code_name' => 'angers',
                'name' => 'Hit West Angers',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://stream.rcs.revma.com/1gas2s0vcy3vv',
                'id' => 'd02c131c-1ba5-4d27-9d49-dc4687150783'
            ],
            [
                'code_name' => 'brest',
                'name' => 'Hit West Brest',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://stream.rcs.revma.com/um6wc6x0am3vv',
                'id' => '6fc705a8-a959-4cb5-ad11-9f05d0a96b70'
            ],
            [
                'code_name' => 'carhaix',
                'name' => 'Hit West Carhaix',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://stream.rcs.revma.com/0vgcc0r88k3vv',
            ],
            [
                'code_name' => 'chateaubriant',
                'name' => 'Hit West Châteaubriant',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://stream.rcs.revma.com/3zv0mp049k3vv',
            ],
            [
                'code_name' => 'cholet',
                'name' => 'Hit West Cholet',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://stream.rcs.revma.com/r2hfug1vcy3vv',
            ],
            [
                'code_name' => 'dinan',
                'name' => 'Hit West Dinan',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://stream.rcs.revma.com/qfpd501vcy3vv',
            ],
            [
                'code_name' => 'laroche',
                'name' => 'Hit West La Roche Sur Yon',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://stream.rcs.revma.com/k4ctbk2vcy3vv',
            ],
            [
                'code_name' => 'laval',
                'name' => 'Hit West Laval',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://stream.rcs.revma.com/4n99733vcy3vv',
            ],
            [
                'code_name' => 'lemans',
                'name' => 'Hit West Le Mans',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://stream.rcs.revma.com/5egdssmta9bwv',
            ],
            [
                'code_name' => 'lessables',
                'name' => 'Hit West Les Sables',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://stream.rcs.revma.com/tey4114vcy3vv',
            ],
            [
                'code_name' => 'lorient',
                'name' => 'Hit West Lorient',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://stream.rcs.revma.com/vssbrvy0am3vv',
            ],
            [
                'code_name' => 'loudeac',
                'name' => 'Hit West Loudéac',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://stream.rcs.revma.com/wpw52kmwcy3vv',
            ],
            [
                'code_name' => 'morlaix',
                'name' => 'Hit West Morlaix',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://stream.rcs.revma.com/ehwmdpsta9bwv',
            ],
            [
                'code_name' => 'nantes',
                'name' => 'Hit West Nantes',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://stream.rcs.revma.com/42hpctu59k3vv',
            ],
            [
                'code_name' => 'ploermel',
                'name' => 'Hit West Ploermel',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://stream.rcs.revma.com/b4yrpwdu7ucwv',
            ],
            [
                'code_name' => 'quimper',
                'name' => 'Hit West Quimper',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://stream.rcs.revma.com/3m61r25vcy3vv',
            ],
            [
                'code_name' => 'redon',
                'name' => 'Hit West Redon',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://stream.rcs.revma.com/mvyt6kr0am3vv',
            ],
            [
                'code_name' => 'rennes',
                'name' => 'Hit West Rennes',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://stream.rcs.revma.com/nvsuedfwcy3vv',
            ],
            [
                'code_name' => 'saintbrieuc',
                'name' => 'Hit West Saint Brieuc',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://stream.rcs.revma.com/wpw52kmwcy3vv',
            ],
            [
                'code_name' => 'saintgilles',
                'name' => 'Hit West Saint Gilles',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://stream.rcs.revma.com/wskk0ymwcy3vv',
            ],
            [
                'code_name' => 'saintmalo',
                'name' => 'Hit West Saint-Malo',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://stream.rcs.revma.com/qfpd501vcy3vv',
            ],
            [
                'code_name' => 'saintnazaire',
                'name' => 'Hit West Saint Nazaire',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://stream.rcs.revma.com/fru94anwcy3vv',
            ],
            [
                'code_name' => 'tours',
                'name' => 'Hit West Tours',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://stream.rcs.revma.com/wy412nnwcy3vv',
                'id' => 'b491bebd-1696-41a3-8cc2-cc3b15630aa6'
            ],
            [
                'code_name' => 'vannes',
                'name' => 'Hit West Vannes',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://stream.rcs.revma.com/qwzd20nwcy3vv',
            ],




            [
                'code_name' => 'freshhits',
                'name' => 'Hit West Fresh Hits',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://stream.rcs.revma.com/b36c78463p3vv?trk_ir_c=0',
            ],
            [
                'code_name' => 'hitsdumoment',
                'name' => 'Hit West Hits du moment',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://stream.rcs.revma.com/84g6y0xa3zcwv',
            ],
            [
                'code_name' => 'hit80',
                'name' => 'Hit West 80',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://stream.rcs.revma.com/ens21efbyrcwv',
            ],
            [
                'code_name' => 'hit90',
                'name' => 'Hit West 90',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://stream.rcs.revma.com/93ez15uhgm3vv',
            ],
            [
                'code_name' => 'hit2000',
                'name' => 'Hit West 2000',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://stream.rcs.revma.com/uttd3ygkwk3vv',
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
