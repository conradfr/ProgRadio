<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250407084042 extends AbstractMigration
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
                'code_name' => 'oceane_radio',
                'name' => 'Océane',
                'category' => 2,
                'collection' => 3,
                'share' => 0,
                'country' => 'FR',
                'timezone' => 'Europe/Paris'
            ],
        ];

        $subRadios = [
            [
                'code_name' => 'oceane_radio_main',
                'name' => 'Océane Nantes',
                'main' => 'true',
                'radio_id' => 151
            ],
            [
                'code_name' => 'oceane_radio_rouen',
                'name' => 'Océane Rouen',
                'main' => 'false',
                'radio_id' => 151
            ],
            [
                'code_name' => 'oceane_radio_saint_nazaire',
                'name' => 'Océane Saint-Nazaire',
                'main' => 'false',
                'radio_id' => 151
            ],
            [
                'code_name' => 'oceane_radio_roche_yon',
                'name' => 'Océane La Roche sur Yon',
                'main' => 'false',
                'radio_id' => 151
            ],
            [
                'code_name' => 'oceane_radio_guingamp',
                'name' => 'Océane Guingamp',
                'main' => 'false',
                'radio_id' => 151
            ],
            [
                'code_name' => 'oceane_radio_vannes',
                'name' => 'Océane Vannes',
                'main' => 'false',
                'radio_id' => 151
            ],
            [
                'code_name' => 'oceane_radio_concarneau',
                'name' => 'Océane Concarneau',
                'main' => 'false',
                'radio_id' => 151
            ],
            [
                'code_name' => 'oceane_radio_lorient',
                'name' => 'Océane Lorient',
                'main' => 'false',
                'radio_id' => 151
            ],
            [
                'code_name' => 'oceane_radio_paimpol',
                'name' => 'Océane Paimpol',
                'main' => 'false',
                'radio_id' => 151
            ],
            [
                'code_name' => 'oceane_radio_roche_bernard',
                'name' => 'Océane La Roche Bernard',
                'main' => 'false',
                'radio_id' => 151
            ],
            [
                'code_name' => 'oceane_radio_redon',
                'name' => 'Océane Redon',
                'main' => 'false',
                'radio_id' => 151
            ],
            [
                'code_name' => 'oceane_radio_quimperle',
                'name' => 'Océane Quimperle',
                'main' => 'false',
                'radio_id' => 151
            ],
            [
                'code_name' => 'oceane_radio_questembert',
                'name' => 'Océane Questembert',
                'main' => 'false',
                'radio_id' => 151
            ],
            [
                'code_name' => 'oceane_radio_guer',
                'name' => 'Océane Guer',
                'main' => 'false',
                'radio_id' => 151
            ],
            [
                'code_name' => 'oceane_radio_rennes',
                'name' => 'Océane Rennes',
                'main' => 'false',
                'radio_id' => 151
            ],
            [
                'code_name' => 'oceane_radio_ploermel',
                'name' => 'Océane Ploermel',
                'main' => 'false',
                'radio_id' => 151
            ],
            [
                'code_name' => 'oceane_radio_chateaulin',
                'name' => 'Océane Chateaulin',
                'main' => 'false',
                'radio_id' => 151
            ],
            [
                'code_name' => 'oceane_radio_lannion',
                'name' => 'Océane Lannion',
                'main' => 'false',
                'radio_id' => 151
            ],
            [
                'code_name' => 'oceane_radio_quimper',
                'name' => 'Océane Quimper',
                'main' => 'false',
                'radio_id' => 151
            ],
        ];

        $stream = [
            [
                'code_name' => 'oceane_radio_main',
                'name' => 'Océane Nantes',
                'main' => 'true',
                'radio_id' => 151,
                'current_song' => 'true',
                'url' => 'https://stream.rcs.revma.com/r80n8vu1am3vv',
                'enabled' => 'true',
                'sub_radio' => 274
            ],
            [
                'code_name' => 'oceane_radio_rouen',
                'name' => 'Océane Rouen',
                'main' => 'false',
                'radio_id' => 151,
                'current_song' => 'true',
                'url' => 'https://stream.rcs.revma.com/m0m6sgt1am3vv',
                'enabled' => 'true',
                'sub_radio' => 275
            ],
            [
                'code_name' => 'oceane_radio_saint_nazaire',
                'name' => 'Océane Saint-Nazaire',
                'main' => 'false',
                'radio_id' => 151,
                'current_song' => 'true',
                'url' => 'https://stream.rcs.revma.com/xzhf80bf0v3vv',
                'enabled' => 'true',
                'sub_radio' => 276
            ],
            [
                'code_name' => 'oceane_radio_roche_yon',
                'name' => 'Océane La Roche sur Yon',
                'main' => 'false',
                'radio_id' => 151,
                'current_song' => 'true',
                'url' => 'https://stream.rcs.revma.com/c0ey4y9e0v3vv',
                'enabled' => 'true',
                'sub_radio' => 277
            ],
            [
                'code_name' => 'oceane_radio_guingamp',
                'name' => 'Océane Guingamp',
                'main' => 'false',
                'radio_id' => 151,
                'current_song' => 'true',
                'url' => 'https://stream.rcs.revma.com/qvwq6p5e0v3vv',
                'enabled' => 'true',
                'sub_radio' => 278
            ],
            [
                'code_name' => 'oceane_radio_vannes',
                'name' => 'Océane Vannes',
                'main' => 'false',
                'radio_id' => 151,
                'current_song' => 'true',
                'url' => 'https://stream.rcs.revma.com/r80n8vu1am3vv',
                'enabled' => 'true',
                'sub_radio' => 279
            ],
            [
                'code_name' => 'oceane_radio_concarneau',
                'name' => 'Océane Concarneau',
                'main' => 'false',
                'radio_id' => 151,
                'current_song' => 'true',
                'url' => 'https://stream.rcs.revma.com/xthv0v4e0v3vv',
                'enabled' => 'true',
                'sub_radio' => 280
            ],
            [
                'code_name' => 'oceane_radio_lorient',
                'name' => 'Océane Lorient',
                'main' => 'false',
                'radio_id' => 151,
                'current_song' => 'true',
                'url' => 'https://stream.rcs.revma.com/zkad6eaf0v3vv',
                'enabled' => 'true',
                'sub_radio' => 281
            ],
            [
                'code_name' => 'oceane_radio_paimpol',
                'name' => 'Océane Paimpol',
                'main' => 'false',
                'radio_id' => 151,
                'current_song' => 'true',
                'url' => 'https://stream.rcs.revma.com/drfpqraf0v3vv',
                'enabled' => 'true',
                'sub_radio' => 282
            ],
            [
                'code_name' => 'oceane_radio_roche_bernard',
                'name' => 'Océane La Roche Bernard',
                'main' => 'false',
                'radio_id' => 151,
                'current_song' => 'true',
                'url' => 'https://stream.rcs.revma.com/qbs4kq9e0v3vv',
                'enabled' => 'true',
                'sub_radio' => 283
            ],
            [
                'code_name' => 'oceane_radio_redon',
                'name' => 'Océane Redon',
                'main' => 'false',
                'radio_id' => 151,
                'current_song' => 'true',
                'url' => 'https://stream.rcs.revma.com/cd8spubf0v3vv',
                'enabled' => 'true',
                'sub_radio' => 284
            ],
            [
                'code_name' => 'oceane_radio_quimperle',
                'name' => 'Océane Quimperle',
                'main' => 'false',
                'radio_id' => 151,
                'current_song' => 'true',
                'url' => 'https://stream.rcs.revma.com/0vekuhbf0v3vv',
                'enabled' => 'true',
                'sub_radio' => 285
            ],
            [
                'code_name' => 'oceane_radio_questembert',
                'name' => 'Océane Questembert',
                'main' => 'false',
                'radio_id' => 151,
                'current_song' => 'true',
                'url' => 'https://stream.rcs.revma.com/q07eh9bf0v3vv',
                'enabled' => 'true',
                'sub_radio' => 286
            ],
            [
                'code_name' => 'oceane_radio_guer',
                'name' => 'Océane Guer',
                'main' => 'false',
                'radio_id' => 151,
                'current_song' => 'true',
                'url' => 'https://stream.rcs.revma.com/fqm9v94e0v3vv',
                'enabled' => 'true',
                'sub_radio' => 287
            ],
            [
                'code_name' => 'oceane_radio_rennes',
                'name' => 'Océane Rennes',
                'main' => 'false',
                'radio_id' => 151,
                'current_song' => 'true',
                'url' => 'https://stream.rcs.revma.com/81enxcp9c13vv',
                'enabled' => 'true',
                'sub_radio' => 288
            ],
            [
                'code_name' => 'oceane_radio_ploermel',
                'name' => 'Océane Ploermel',
                'main' => 'false',
                'radio_id' => 151,
                'current_song' => 'true',
                'url' => 'https://soundcastmaster2.bcast.infomaniak.ch:8000/oceaneguer-128.mp3?token=exp%3D1744016790~acl%3D%2Foceaneguer-128~hmac%3Db6c31fb204e73092ce793e83a6da22b0af3453ea71bc3314980d229db429d1d1&CAID=202504062021164450797327',
                'enabled' => 'true',
                'sub_radio' => 289
            ],
            [
                'code_name' => 'oceane_radio_chateaulin',
                'name' => 'Océane Chateaulin',
                'main' => 'false',
                'radio_id' => 151,
                'current_song' => 'true',
                'url' => 'https://stream.rcs.revma.com/rpz1snm1am3vv',
                'enabled' => 'true',
                'sub_radio' => 290
            ],
            [
                'code_name' => 'oceane_radio_lannion',
                'name' => 'Océane Lannion',
                'main' => 'false',
                'radio_id' => 151,
                'current_song' => 'true',
                'url' => 'https://stream.rcs.revma.com/pbe1r79e0v3vv',
                'enabled' => 'true',
                'sub_radio' => 291
            ],
            [
                'code_name' => 'oceane_radio_quimper',
                'name' => 'Océane Quimper',
                'main' => 'false',
                'radio_id' => 151,
                'current_song' => 'true',
                'url' => 'https://stream.rcs.revma.com/snw906af0v3vv',
                'enabled' => 'true',
                'sub_radio' => 292
            ],
            [
                'code_name' => 'oceane_radio_80',
                'name' => 'Océane Années 80',
                'main' => 'false',
                'radio_id' => 151,
                'current_song' => 'true',
                'url' => 'https://stream.rcs.revma.com/snw906af0v3vv',
                'enabled' => 'true',
                'sub_radio' => 'null'
            ],
            [
                'code_name' => 'oceane_radio_francais',
                'name' => 'Océane 100% Français',
                'main' => 'false',
                'radio_id' => 151,
                'current_song' => 'true',
                'url' => 'https://stream.rcs.revma.com/d4u2edvhgm3vv',
                'enabled' => 'true',
                'sub_radio' => 'null'
            ],
            [
                'code_name' => 'oceane_radio_classic_rock',
                'name' => 'Océane Classic Rock',
                'main' => 'false',
                'radio_id' => 151,
                'current_song' => 'true',
                'url' => 'https://stream.rcs.revma.com/arm9exyhwk3vv',
                'enabled' => 'true',
                'sub_radio' => 'null'
            ],
            [
                'code_name' => 'oceane_radio_clazz',
                'name' => 'Clazz Radio',
                'main' => 'false',
                'radio_id' => 151,
                'current_song' => 'true',
                'url' => 'https://stream.rcs.revma.com/xsycwftnfm3vv',
                'enabled' => 'true',
                'sub_radio' => 'null'
            ],
        ];

        for ($i = 0; $i < count($radios); $i++) {
            $this->connection->exec(
                'INSERT INTO radio (id, category_id, code_name, name, country_code, timezone, share, collection_id) VALUES ('
                . ($i + 151) . ',' . $radios[$i]['category'] . ",'" . $radios[$i]['code_name'] . "','" . $radios[$i]['name'] . "','" . $radios[$i]['country'] . "','" . $radios[$i]['timezone'] . "'," . $radios[$i]['share'] . "," . $radios[$i]['collection'] . ");"
            );
        }

        for ($i = 0; $i < count($subRadios); $i++) {
            $this->connection->exec(
                'INSERT INTO sub_radio (id, radio_id, code_name, name, main, enabled) VALUES ('
                . ($i + 274) . ',' . $subRadios[$i]['radio_id'] . ",'" . $subRadios[$i]['code_name'] . "','" . $subRadios[$i]['name'] . "'," . $subRadios[$i]['main'] . ',true);'
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
