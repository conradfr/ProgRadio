<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260828213650 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $prefix = 'forum';
        $radioId = 88;
        $subRadioId = 393;
        $streamSongId = 89;
        $website = 'https://www.forum.fr';

        $subRadios = [
            [
                'code_name' => 'angers',
                'name' => 'Forum Angers',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://securestream-api.radioplayer.cloud/v1/radios/2501397/streams?securestreamId=2787&rp_source=1',
                'id' => '80f9ef66-82c0-4efa-a313-87bb17a6cf33'
            ],
            [
                'code_name' => 'angouleme',
                'name' => 'Forum Angoulême',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://securestream-api.radioplayer.cloud/v1/radios/2501398/streams?securestreamId=2795&rp_source=1',
            ],
            [
                'code_name' => 'bellac',
                'name' => 'Forum Bellac',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://start-forum.ice.infomaniak.ch/start-forum-high.mp3',
            ],
            [
                'code_name' => 'blois',
                'name' => 'Forum Blois',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://securestream-api.radioplayer.cloud/v1/radios/2501399/streams?securestreamId=2804&rp_source=1',
            ],
            [
                'code_name' => 'chateaurenault',
                'name' => 'Forum Château-Renault',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://start-forum.ice.infomaniak.ch/start-forum-high.mp3',
            ],
            [
                'code_name' => 'chateauroux',
                'name' => 'Forum Châteauroux',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://securestream-api.radioplayer.cloud/v1/radios/2501400/streams?securestreamId=2814&rp_source=1',
            ],
            [
                'code_name' => 'chatellerault',
                'name' => 'Forum Châtellerault',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://start-forum.ice.infomaniak.ch/start-forum-high.mp3',
            ],
            [
                'code_name' => 'chauvigny',
                'name' => 'Forum Chauvigny',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://securestream-api.radioplayer.cloud/v1/radios/2501403/streams?securestreamId=2493&rp_source=1',
            ],
            [
                'code_name' => 'cholet',
                'name' => 'Forum Cholet',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://securestream-api.radioplayer.cloud/v1/radios/2501397/streams?securestreamId=2787&rp_source=1',
            ],
            [
                'code_name' => 'civray',
                'name' => 'Forum Civray',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://start-forum.ice.infomaniak.ch/start-forum-high.mp3',
            ],
            [
                'code_name' => 'confolens',
                'name' => 'Forum Confolens',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://start-forum.ice.infomaniak.ch/start-forum-high.mp3',
            ],
            [
                'code_name' => 'gencay',
                'name' => 'Forum Gençay',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://start-forum.ice.infomaniak.ch/start-forum-high.mp3',
            ],
            [
                'code_name' => 'oleron',
                'name' => "Forum Île d Oléron",
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://start-forum.ice.infomaniak.ch/start-forum-high.mp3',
            ],
            [
                'code_name' => 'rocheposay',
                'name' => 'Forum La Roche-Posay',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://start-forum.ice.infomaniak.ch/start-forum-high.mp3',
            ],
            [
                'code_name' => 'larochelle',
                'name' => 'Forum La Rochelle',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://start-forum.ice.infomaniak.ch/start-forum-high.mp3',
            ],
            [
                'code_name' => 'limoges',
                'name' => 'Forum Limoges',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://start-forum.ice.infomaniak.ch/start-forum-high.mp3',
            ],
            [
                'code_name' => 'loudun',
                'name' => 'Forum Loudun',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://start-forum.ice.infomaniak.ch/start-forum-high.mp3',
            ],
            [
                'code_name' => 'montmorillon',
                'name' => 'Forum Montmorillon',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://start-forum.ice.infomaniak.ch/start-forum-high.mp3',
            ],
            [
                'code_name' => 'niort',
                'name' => 'Forum Niort',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://securestream-api.radioplayer.cloud/v1/radios/2501401/streams?securestreamId=2782&rp_source=1',
            ],
            [
                'code_name' => 'orleans',
                'name' => 'Forum Orléans',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://securestream-api.radioplayer.cloud/v1/radios/2501402/streams?securestreamId=2823&rp_source=1',
                'id' => 'e075cdab-ecac-47cb-a8ca-777bd7a1eb11'
            ],
            [
                'code_name' => 'parthenay',
                'name' => 'Forum Parthenay',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://start-forum.ice.infomaniak.ch/start-forum-high.mp3',
            ],
            [
                'code_name' => 'poitiers',
                'name' => 'Forum Poitiers',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://securestream-api.radioplayer.cloud/v1/radios/2501403/streams?securestreamId=2493&rp_source=1',
            ],
            [
                'code_name' => 'romorantin',
                'name' => 'Forum Romorantin-Lanthenay',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://securestream-api.radioplayer.cloud/v1/radios/2501404/streams?securestreamId=2839&rp_source=1',
            ],
            [
                'code_name' => 'ruffec',
                'name' => 'Forum Ruffec',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://securestream-api.radioplayer.cloud/v1/radios/2501397/streams?securestreamId=2787&rp_source=1',
            ],
            [
                'code_name' => 'saintsavin',
                'name' => 'Forum Saint-Savin',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://start-forum.ice.infomaniak.ch/start-forum-high.mp3',
            ],
            [
                'code_name' => 'saumur',
                'name' => 'Forum Saumur',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://securestream-api.radioplayer.cloud/v1/radios/2501397/streams?securestreamId=2787&rp_source=1',
            ],
            [
                'code_name' => 'saintjunien',
                'name' => 'Forum Saint-Junien',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://start-forum.ice.infomaniak.ch/start-forum-high.mp3',
            ],
            [
                'code_name' => 'saintmaixent',
                'name' => 'Forum Saint-Maixent-l Ecole',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://securestream-api.radioplayer.cloud/v1/radios/2501401/streams?securestreamId=2782&rp_source=1',
            ],
            [
                'code_name' => 'thouars',
                'name' => 'Forum Thouars',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://start-forum.ice.infomaniak.ch/start-forum-high.mp3',
            ],
            [
                'code_name' => 'tours',
                'name' => 'Forum Tours',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://securestream-api.radioplayer.cloud/v1/radios/2501405/streams?securestreamId=2842&rp_source=1',
                'id' => '84a9d194-e6bc-4f90-826f-75ad7ccda264'
            ],
            [
                'code_name' => 'vendome',
                'name' => 'Forum Vendôme',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => true,
                'url' => 'https://securestream-api.radioplayer.cloud/v1/radios/2501396/streams?securestreamId=2721&rp_source=1',
            ],


            [
                'code_name' => 'divas',
                'name' => 'Forum Divas',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://webfor2.ice.infomaniak.ch/forumaufeminin.mp3',
            ],
            [
                'code_name' => 'flashback70',
                'name' => 'Forum Flashback 70',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://forum70s.ice.infomaniak.ch/forum70s.mp3',
                'id' => 'f7786324-e5b9-11e8-a9cc-52543be04c81'
            ],
            [
                'code_name' => 'flashback80',
                'name' => 'Forum Flashback 80',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://forum80s.ice.infomaniak.ch/forum80s.mp3',
                'id' => 'e97fd597-e58f-11e8-a9cc-52543be04c81'
            ],
            [
                'code_name' => 'flashback90',
                'name' => 'Forum Flashback 90',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://forum90s.ice.infomaniak.ch/forum90s.mp3',
                'id' => 'da4c5cc8-e5b5-11e8-a9cc-52543be04c81'
            ],
            [
                'code_name' => 'backto2000',
                'name' => 'Forum Back to 2000',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://forum2000.ice.infomaniak.ch/forum2000.mp3',
                'id' => '0f590d16-e5ba-11e8-a9cc-52543be04c81'
            ],
            [
                'code_name' => 'funk',
                'name' => 'Forum Funk Legends',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://webfor1.ice.infomaniak.ch/forumfunk.mp3',
            ],
            [
                'code_name' => 'workhits',
                'name' => 'Forum Work Hits',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://forumwork.ice.infomaniak.ch/forumwork.mp3',
                'id' => '69f21b6b-e5ba-11e8-a9cc-52543be04c81'
            ],
            [
                'code_name' => 'discofever',
                'name' => 'Forum Disco Fever',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://forumforever.ice.infomaniak.ch/forumdiscofever.mp3',
            ],
            [
                'code_name' => 'francais',
                'name' => 'Forum 100% Français',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://forumenfrancais.ice.infomaniak.ch/forumenfrancais.mp3',
            ],
            [
                'code_name' => 'legends',
                'name' => 'Forum Legends',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://forumlegends.ice.infomaniak.ch/forumlegends.mp3',
            ],
            [
                'code_name' => 'love',
                'name' => 'Forum Love Stories',
                'main' => 'false',
                'radio_id' => $radioId,
                'sub_radio' => false,
                'url' => 'https://forumlove.ice.infomaniak.ch/forumlove.mp3',
                'id' => '8b0cc98d-e5ba-11e8-a9cc-52543be04c81'
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
