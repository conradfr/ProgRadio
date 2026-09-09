<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260909075918 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $prefix = 'alouette';
        $radioId = 69;
        $subRadioId = 440;
        $streamSongId = 60;
        $website = 'https://www.alouette.fr/';

        $subRadios = [
            [
                'code_name' => 'main',
                'name' => 'Alouette',
                'main' => 'true',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://alouettetoutezonemidroll.ice.infomaniak.ch/alouettetoutezonemidroll-128.mp3',
                'id' => '1a4f4fa1-30d5-458b-965a-759289104cd6'
            ],
            [
                'code_name' => 'charente',
                'name' => 'Alouette Charente',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://alouette-angouleme.ice.infomaniak.ch/alouette-angouleme-128.mp3',
            ],
            [
                'code_name' => 'charente_maritime',
                'name' => 'Alouette Charente-Maritime',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://alouette-larochelle.ice.infomaniak.ch/alouette-larochelle-128.mp3'
            ],
            [
                'code_name' => 'correze',
                'name' => 'Alouette Corrèze',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://alouettebrive.ice.infomaniak.ch/alouettebrive-128.mp3',
            ],
            [
                'code_name' => 'cotes_darmor',
                'name' => 'Alouette Côtes-d Armor',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://alouette-finistere.ice.infomaniak.ch/alouette-finistere-128.mp3',
            ],
            [
                'code_name' => 'creuse',
                'name' => 'Alouette Creuse',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://alouette-creuse.ice.infomaniak.ch/alouette-creuse-128.mp3',
            ],
            [
                'code_name' => 'deux_sevres',
                'name' => 'Alouette Deux-Sèvres',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://alouette-niort.ice.infomaniak.ch/alouette-niort-128.mp3',
            ],
            [
                'code_name' => 'finistere',
                'name' => 'Alouette Finistère',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://alouette-finistere.ice.infomaniak.ch/alouette-finistere-128.mp3',
            ],
            [
                'code_name' => 'gironde',
                'name' => 'Alouette Gironde',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://alouettebordeaux.ice.infomaniak.ch/alouettebordeaux-128.mp3',
            ],
            [
                'code_name' => 'haute_vienne',
                'name' => 'Alouette Haute Vienne',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://alouette-limoges.ice.infomaniak.ch/alouette-limoges-128.mp3',
            ],
            [
                'code_name' => 'ille_et_vilaine',
                'name' => 'Alouette Ille-et-Vilaine',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://alouette-rennes.ice.infomaniak.ch/alouette-rennes-128.mp3',
            ],
            [
                'code_name' => 'indre',
                'name' => 'Alouette Indre',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://alouette-chateauroux.ice.infomaniak.ch/alouette-chateauroux-128.mp3',
            ],
            [
                'code_name' => 'indre_et_loire',
                'name' => 'Alouette Indre-et-Loire',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://alouette-tours.ice.infomaniak.ch/alouette-tours-128.mp3',
                'id' => '2403c6bb-0043-4ad1-b3c6-b30b63de4e3d'
            ],
            [
                'code_name' => 'loire_atlantique',
                'name' => 'Alouette Loire-Atlantique',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://alouette-nantes.ice.infomaniak.ch/alouette-nantes-128.mp3',
            ],
            [
                'code_name' => 'loiret',
                'name' => 'Alouette Loiret',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://alouette-orleans.ice.infomaniak.ch/alouetteorleans-128.mp3',
            ],
            [
                'code_name' => 'maine_et_loire',
                'name' => 'Alouette Maine-et-Loire',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://alouette-angers.ice.infomaniak.ch/alouette-angers-128.mp3',
                'id' => '4ce3facf-f2e6-455b-832b-77155ab8ee23'
            ],
            [
                'code_name' => 'mayenne',
                'name' => 'Alouette Mayenne',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://alouette-laval.ice.infomaniak.ch/alouette-laval-128.mp3',
            ],
            [
                'code_name' => 'morbihan',
                'name' => 'Alouette Morbihan',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://alouette-finistere.ice.infomaniak.ch/alouette-finistere-128.mp3',
            ],
            [
                'code_name' => 'sarthe',
                'name' => 'Alouette Sarthe',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://alouette-chateauduloir.ice.infomaniak.ch/alouette-chateauduloir-128.mp3',
            ],
            [
                'code_name' => 'vendee',
                'name' => 'Alouette Vendée',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://alouette-larochesuryon.ice.infomaniak.ch/alouette-larochesuryon-128.mp3',
            ],
            [
                'code_name' => 'vienne',
                'name' => 'Alouette Vienne',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://alouette-poitiers.ice.infomaniak.ch/alouette-poitiers-128.mp3',
            ],

            [
                'code_name' => 'leclub',
                'name' => 'Alouette Le Club',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://alouetteleclub.ice.infomaniak.ch/alouetteleclub-128.mp3',
                'id' => '52a2f88c-0ffa-46ec-98ef-a067a668bf90'
            ],
            [
                'code_name' => 'nouveaux_talents',
                'name' => 'Alouette Nouveaux Talents',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://alouettenouveauxtalents.ice.infomaniak.ch/alouettenouveauxtalents-128.mp3',
                'id' => 'd0755050-143b-47e4-ae86-e3cd3f656f8c'
            ],
            [
                'code_name' => 'indie',
                'name' => 'Alouette Indie',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://alouetteindie.ice.infomaniak.ch/alouetteindie-128.mp3',
                'id' => '71e33a1c-1eed-401e-a885-a8c080d58966'
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
