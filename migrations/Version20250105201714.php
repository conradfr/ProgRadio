<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250105201714 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $radios = [
            [
                'code_name' => 'totem',
                'name' => 'Totem',
                'category' => 1,
                'collection' => 3,
                'share' => 0,
                'country' => 'FR',
                'timezone' => 'Europe/Paris'
            ],
        ];

        $subRadios = [
            [
                'code_name' => 'totem_main',
                'name' => 'Totem Aveyron Nord',
                'main' => 'true',
                'radio_id' => 148
            ],
            [
                'code_name' => 'totem_tarnetgaronne',
                'name' => 'Totem Tarn-et-Garonne',
                'main' => 'false',
                'radio_id' => 148
            ],
            [
                'code_name' => 'totem_tarn',
                'name' => 'Totem Tarn',
                'main' => 'false',
                'radio_id' => 148
            ],
            [
                'code_name' => 'totem_correze',
                'name' => 'Totem Corrèze',
                'main' => 'false',
                'radio_id' => 148
            ],
            [
                'code_name' => 'totem_hauteloire',
                'name' => 'Totem Haute-Loire',
                'main' => 'false',
                'radio_id' => 148
            ],
            [
                'code_name' => 'totem_lot_figeac',
                'name' => 'Totem Lot Figeac',
                'main' => 'false',
                'radio_id' => 148
            ],
            [
                'code_name' => 'totem_lot_cahors',
                'name' => 'Totem Lot Cahors',
                'main' => 'false',
                'radio_id' => 148
            ],
            [
                'code_name' => 'totem_dordogne',
                'name' => 'Totem Dordogne',
                'main' => 'false',
                'radio_id' => 148
            ],
            [
                'code_name' => 'totem_aveyron_sud',
                'name' => 'Totem Aveyron Sud',
                'main' => 'false',
                'radio_id' => 148
            ],
            [
                'code_name' => 'totem_lot_nord',
                'name' => 'Totem Lot Nord',
                'main' => 'false',
                'radio_id' => 148
            ],
            [
                'code_name' => 'totem_puysdedome',
                'name' => 'Totem Puy de Dôme',
                'main' => 'false',
                'radio_id' => 148
            ],
            [
                'code_name' => 'totem_herault',
                'name' => 'Totem Hérault',
                'main' => 'false',
                'radio_id' => 148
            ],
            [
                'code_name' => 'totem_lozere',
                'name' => 'Totem Lozère',
                'main' => 'false',
                'radio_id' => 148
            ],
            [
                'code_name' => 'totem_gard',
                'name' => 'Totem Gard',
                'main' => 'false',
                'radio_id' => 148
            ],
            [
                'code_name' => 'totem_cantal',
                'name' => 'Totem Cantal',
                'main' => 'false',
                'radio_id' => 148
            ],
        ];

        $stream = [
            [
                'code_name' => 'totem_main',
                'name' => 'Totem Aveyron Nord',
                'main' => 'true',
                'radio_id' => 148,
                'current_song' => 'false',
                'url' => 'https://aratotem.ice.infomaniak.ch/aveyron.mp3',
                'enabled' => 'true',
                'sub_radio' => 257
            ],
            [
                'code_name' => 'totem_tarnetgaronne',
                'name' => 'Totem Tarn-et-Garonne',
                'main' => 'false',
                'radio_id' => 148,
                'current_song' => 'false',
                'url' => 'https://aratotem.ice.infomaniak.ch/tarn-et-garonne.mp3',
                'enabled' => 'true',
                'sub_radio' => 258
            ],
            [
                'code_name' => 'totem_tarn',
                'name' => 'Totem Tarn',
                'main' => 'false',
                'radio_id' => 148,
                'current_song' => 'false',
                'url' => 'https://aratotem.ice.infomaniak.ch/aveyron.mp3',
                'enabled' => 'true',
                'sub_radio' => 259
            ],
            [
                'code_name' => 'totem_correze',
                'name' => 'Totem Corrèze',
                'main' => 'false',
                'radio_id' => 148,
                'current_song' => 'false',
                'url' => 'https://aratotem.ice.infomaniak.ch/correze.mp3',
                'enabled' => 'true',
                'sub_radio' => 260
            ],
            [
                'code_name' => 'totem_hauteloire',
                'name' => 'Totem Haute-Loire',
                'main' => 'false',
                'radio_id' => 148,
                'current_song' => 'false',
                'url' => 'https://aratotem.ice.infomaniak.ch/issoire-brioude.aac',
                'enabled' => 'true',
                'sub_radio' => 261
            ],
            [
                'code_name' => 'totem_lot_figeac',
                'name' => 'Totem Lot Figeac',
                'main' => 'false',
                'radio_id' => 148,
                'current_song' => 'false',
                'url' => 'https://aratotem.ice.infomaniak.ch/av-ouest.aac',
                'enabled' => 'true',
                'sub_radio' => 262
            ],
            [
                'code_name' => 'totem_lot_cahors',
                'name' => 'Totem Lot Cahors',
                'main' => 'false',
                'radio_id' => 148,
                'current_song' => 'false',
                'url' => 'https://aratotem.ice.infomaniak.ch/cahors.aac',
                'enabled' => 'true',
                'sub_radio' => 263
            ],
            [
                'code_name' => 'totem_dordogne',
                'name' => 'Totem Dordogne',
                'main' => 'false',
                'radio_id' => 148,
                'current_song' => 'false',
                'url' => 'https://aratotem.ice.infomaniak.ch/correze.mp3',
                'enabled' => 'true',
                'sub_radio' => 264
            ],
            [
                'code_name' => 'totem_aveyron_sud',
                'name' => 'Totem Aveyron Sud',
                'main' => 'false',
                'radio_id' => 148,
                'current_song' => 'false',
                'url' => 'https://aratotem.ice.infomaniak.ch/av-sud.aac',
                'enabled' => 'true',
                'sub_radio' => 265
            ],
            [
                'code_name' => 'totem_lot_nord',
                'name' => 'Totem Lot Nord',
                'main' => 'false',
                'radio_id' => 148,
                'current_song' => 'false',
                'url' => 'https://aratotem.ice.infomaniak.ch/correze.mp3',
                'enabled' => 'true',
                'sub_radio' => 266
            ],
            [
                'code_name' => 'totem_puysdedome',
                'name' => 'Totem Puy de Dôme',
                'main' => 'false',
                'radio_id' => 148,
                'current_song' => 'false',
                'url' => 'https://aratotem.ice.infomaniak.ch/issoire-brioude.aac',
                'enabled' => 'true',
                'sub_radio' => 267
            ],
            [
                'code_name' => 'totem_herault',
                'name' => 'Totem Hérault',
                'main' => 'false',
                'radio_id' => 148,
                'current_song' => 'false',
                'url' => 'https://aratotem.ice.infomaniak.ch/lodeve.aac',
                'enabled' => 'true',
                'sub_radio' => 268
            ],
            [
                'code_name' => 'totem_lozere',
                'name' => 'Totem Lozère',
                'main' => 'false',
                'radio_id' => 148,
                'current_song' => 'false',
                'url' => 'https://aratotem.ice.infomaniak.ch/lozere.mp3',
                'enabled' => 'true',
                'sub_radio' => 269
            ],
            [
                'code_name' => 'totem_gard',
                'name' => 'Totem Gard',
                'main' => 'false',
                'radio_id' => 148,
                'current_song' => 'false',
                'url' => 'https://aratotem.ice.infomaniak.ch/gard.mp3',
                'enabled' => 'true',
                'sub_radio' => 270
            ],
            [
                'code_name' => 'totem_cantal',
                'name' => 'Totem Cantal',
                'main' => 'false',
                'radio_id' => 148,
                'current_song' => 'false',
                'url' => 'https://aratotem.ice.infomaniak.ch/auvergne.mp3',
                'enabled' => 'true',
                'sub_radio' => 271
            ],
        ];

        for ($i = 0; $i < count($radios); $i++) {
            $this->connection->exec(
                'INSERT INTO radio (id, category_id, code_name, name, country_code, timezone, share, collection_id) VALUES ('
                . ($i + 148) . ',' . $radios[$i]['category'] . ",'" . $radios[$i]['code_name'] . "','" . $radios[$i]['name'] . "','" . $radios[$i]['country'] . "','" . $radios[$i]['timezone'] . "'," . $radios[$i]['share'] . "," . $radios[$i]['collection'] . ");"
            );
        }

        for ($i = 0; $i < count($subRadios); $i++) {
            $this->connection->exec(
                'INSERT INTO sub_radio (id, radio_id, code_name, name, main, enabled) VALUES ('
                . ($i + 257) . ',' . $subRadios[$i]['radio_id'] . ",'" . $subRadios[$i]['code_name'] . "','" . $subRadios[$i]['name'] . "'," . $subRadios[$i]['main'] . ',true);'
            );
        }

        for ($i = 0; $i < count($stream); $i++) {
            $this->connection->exec(
                "INSERT INTO radio_stream (code_name, name, url, radio_id, sub_radio_id, current_song,main,enabled) VALUES ('"
                . $stream[$i]['code_name'] . "','" . $stream[$i]['name'] . "','" . $stream[$i]['url'] . "'," . $stream[$i]['radio_id'] . ',' . $stream[$i]['sub_radio'] . ',' . $stream[$i]['current_song'] . ',' . $stream[$i]['main'] . ',' . $stream[$i]['enabled'] . ')'
            );
        }
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
