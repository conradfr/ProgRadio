<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260706092952 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    // this up() migration is auto-generated, please modify it to your needs
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs

        $prefix = 'centpourcent_radio';
        $radioId = 156;
        $subRadioId = 304;
        $website = 'https://www.centpourcent.com';

        $radios = [
            [
                'code_name' => $prefix,
                'name' => '100% Radio',
                'category' => 2,
                'collection' => 3,
                'share' => 0,
                'country' => 'FR',
                'timezone' => 'Europe/Paris'
            ],
        ];

        $subRadios = [
            [
                'code_name' => 'pau',
                'name' => '100% Radio Pau',
                'main' => 'true',
                'radio_id' => $radioId,
                'url' => 'https://100radio-pau.ice.infomaniak.ch/100radio-pau-128.mp3',
                'id' => '96141da6-0601-11e8-ae97-52543be04c81'
            ],
            [
                'code_name' => 'albi',
                'name' => '100% Radio Albi',
                'main' => 'false',
                'radio_id' => $radioId,
                'url' => 'https://100radio-albi.ice.infomaniak.ch/100radio-albi-128.mp3',
                'id' => '96141797-0601-11e8-ae97-52543be04c81'
            ],
            [
                'code_name' => 'auch',
                'name' => '100% Radio Auch',
                'main' => 'false',
                'radio_id' => $radioId,
                'url' => 'https://100radio-pau.ice.infomaniak.ch/100radio-auch-128.mp3',
                'id' => '96141920-0601-11e8-ae97-52543be04c81'
            ],
            [
                'code_name' => 'cahors',
                'name' => '100% Radio Cahors',
                'main' => 'false',
                'radio_id' => $radioId,
                'url' => 'https://100radio-pau.ice.infomaniak.ch/100radio-cahors-128.mp3',
                'id' => '8536727e-09c2-417f-8a62-8d1ba5c6b016'
            ],
            [
                'code_name' => 'carcassonne',
                'name' => '100% Radio Carcassonne',
                'main' => 'false',
                'radio_id' => $radioId,
                'url' => 'https://100radio-pau.ice.infomaniak.ch/100radio-carcassonne-128.mp3',
                'id' => '943d83df-76d5-4782-b1ba-0c24ba96ebf9'
            ],
            [
                'code_name' => 'castres',
                'name' => '100% Radio Castres',
                'main' => 'false',
                'radio_id' => $radioId,
                'url' => 'https://100radio-pau.ice.infomaniak.ch/100radio-castres-128.mp3',
                'id' => '96141b6a-0601-11e8-ae97-52543be04c81'
            ],
            [
                'code_name' => 'foix',
                'name' => '100% Radio Foix',
                'main' => 'false',
                'radio_id' => $radioId,
                'url' => 'https://100radio-pau.ice.infomaniak.ch/100radio-foix-128.mp3',
                'id' => '96141c34-0601-11e8-ae97-52543be04c81'
            ],
            [
                'code_name' => 'lozere',
                'name' => '100% Radio Lozère',
                'main' => 'false',
                'radio_id' => $radioId,
                'url' => 'https://100radiolozere.ice.infomaniak.ch/100radiolozere-128.mp3',
                'id' => 'cbebad5b-ea7c-4240-827d-691866cec3df'
            ],
            [
                'code_name' => 'millau',
                'name' => '100% Radio Millau',
                'main' => 'false',
                'radio_id' => $radioId,
                'url' => 'https://100radio-pau.ice.infomaniak.ch/100radio-pau-128.mp3',
                'id' => '91eb6c13-a861-465a-9ea5-454d77362621'
            ],
            [
                'code_name' => 'montauban',
                'name' => '100% Radio Montauban',
                'main' => 'false',
                'radio_id' => $radioId,
                'url' => 'https://100radio-pau.ice.infomaniak.ch/100radio-montauban-128.mp3',
                'id' => '96141cf4-0601-11e8-ae97-52543be04c81'
            ],
            [
                'code_name' => 'herault',
                'name' => '100% Radio Hérault',
                'main' => 'false',
                'radio_id' => $radioId,
                'url' => 'https://100radio-pau.ice.infomaniak.ch/100radio-herault-128.mp3',
                'id' => 'bb64a82c-7e91-42b8-9399-22bce08f4c11'
            ],
            [
                'code_name' => 'payscatalan',
                'name' => '100% Radio Pays Catalan',
                'main' => 'false',
                'radio_id' => $radioId,
                'url' => 'https://100radio-pau.ice.infomaniak.ch/100radio-perpignan-128.mp3',
                'id' => '961f8670-0601-11e8-ae97-52543be04c81'
            ],
            [
                'code_name' => 'stgaudens',
                'name' => '100% Radio St Gaudens',
                'main' => 'false',
                'radio_id' => $radioId,
                'url' => 'https://100radio-pau.ice.infomaniak.ch/100radio-stgaudens-128.mp3',
                'id' => '96141e55-0601-11e8-ae97-52543be04c81'
            ],
            [
                'code_name' => 'tarbes',
                'name' => '100% Radio Tarbes',
                'main' => 'false',
                'radio_id' => $radioId,
                'url' => 'https://100radio-pau.ice.infomaniak.ch/100radio-tarbes-128.mp3',
                'id' => '96141fa2-0601-11e8-ae97-52543be04c81'
            ],
            [
                'code_name' => 'toulouse',
                'name' => '100% Radio Toulouse',
                'main' => 'false',
                'radio_id' => $radioId,
                'url' => 'https://100radio-toulousefm.ice.infomaniak.ch/100radio-dabtoulouse-192.mp3',
                'id' => 'efb49dbc-0d65-11e9-a80b-52543be04c81'
            ],
        ];

        // song
        $this->connection->executeQuery(
            'INSERT INTO stream_song (id, code_name, enabled) VALUES (' . 125 . ",'" . $prefix . "', true);"
        );

        for ($i = 0; $i < count($radios); $i++) {
            $this->connection->executeQuery(
                'INSERT INTO radio (id, category_id, code_name, name, country_code, timezone, share, collection_id, website) VALUES ('
                . ($i + $radioId) . ',' . $radios[$i]['category'] . ",'" . $radios[$i]['code_name'] . "','" . $radios[$i]['name'] . "','" . $radios[$i]['country'] . "','" . $radios[$i]['timezone'] . "'," . $radios[$i]['share'] . "," . $radios[$i]['collection'] . ",'" . $website . "');"
            );
        }

        for ($i = 0; $i < count($subRadios); $i++) {
            $this->connection->executeQuery(
                'INSERT INTO sub_radio (id, radio_id, code_name, name, main, enabled) VALUES ('
                . ($i + $subRadioId) . ',' . $subRadios[$i]['radio_id'] . ",'" . $prefix . '_' . $subRadios[$i]['code_name'] . "','" . $subRadios[$i]['name'] . "'," . $subRadios[$i]['main'] . ',true);'
            );

            $this->connection->executeQuery(
                "UPDATE stream SET internal_use_img = true, radio_id = " . $radioId . ", is_main_radio = " . $subRadios[$i]['main'] . ", is_sub_radio = TRUE, sub_radio_id = " . ($i + $subRadioId) . ", radio_stream_code_name = '" . $prefix . '_' . $subRadios[$i]['code_name'] ."', stream_song_id = " . 125 . ", stream_song_code_name = '"  . $subRadios[$i]['code_name'] . "' WHERE id = '" . $subRadios[$i]['id'] . "';"
            );
        }
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
