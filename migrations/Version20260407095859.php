<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260407095859 extends AbstractMigration
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
            'code_name' => 'maximumfm',
            'name' => 'Maximum',
            'category' => 2,
            'collection' => 8,
            'share' => 0.68,
            'country' => 'BE',
            'timezone' => 'Europe/Brussels'
          ],
        ];

        $subRadios = [
          [
            'code_name' => 'maximumfm',
            'name' => 'Maximum',
            'main' => 'true',
            'radio_id' => 153
          ],
        ];

        $stream = [
          [
            'code_name' => 'maximumfm',
            'name' => 'Maximum',
            'main' => 'true',
            'radio_id' => 153,
            'current_song' => 'false',
            'url' => 'https://stream.rcs.revma.com/vnmbzemrmm0uv',
            'enabled' => 'true',
            'sub_radio' => 301
          ]
        ];

        for ($i = 0; $i < count($radios); $i++) {
          $this->connection->executeQuery(
            'INSERT INTO radio (id, category_id, code_name, name, country_code, timezone, share, collection_id) VALUES ('
            . ($i + 153) . ',' . $radios[$i]['category'] . ",'" . $radios[$i]['code_name'] . "','" . $radios[$i]['name'] . "','" . $radios[$i]['country'] . "','" . $radios[$i]['timezone'] . "'," . $radios[$i]['share'] . "," . $radios[$i]['collection'] . ");"
          );
        }

        for ($i = 0; $i < count($subRadios); $i++) {
            $this->connection->executeQuery(
            'INSERT INTO sub_radio (id, radio_id, code_name, name, main, enabled) VALUES ('
            . ($i + 301) . ',' . $subRadios[$i]['radio_id'] . ",'" . $subRadios[$i]['code_name'] . "','" . $subRadios[$i]['name'] . "'," . $subRadios[$i]['main'] . ',true);'
          );
        }

        for ($i = 0; $i < count($stream); $i++) {
            $this->connection->executeQuery(
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
