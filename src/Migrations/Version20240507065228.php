<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20240507065228 extends AbstractMigration implements ContainerAwareInterface
{
    private $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs

        $connection = $this->container->get('doctrine.orm.entity_manager')->getConnection();

        // RADIOS

        $radios = [
            [
                'code_name' => 'oxygene',
                'name' => 'Oxygène',
                'category' => 2,
                'collection' => 7,
                'share' => 1,
                'country' => 'FR',
                'timezone' => 'Europe/Paris'
            ],
        ];

        $subRadios = [
            [
                'code_name' => 'oxygene_main',
                'name' => 'Oxygène Melun',
                'main' => 'true',
                'radio_id' => 138
            ],
            [
                'code_name' => 'oxygene_sud77',
                'name' => 'Oxygène Sud 77',
                'main' => 'false',
                'radio_id' => 138
            ],
            [
                'code_name' => 'oxygene_provins',
                'name' => 'Oxygène Provins',
                'main' => 'false',
                'radio_id' => 138
            ],
            [
                'code_name' => 'oxygene_coulommiers',
                'name' => 'Oxygène Coulommiers',
                'main' => 'false',
                'radio_id' => 138
            ],
            [
                'code_name' => 'oxygene_meaux',
                'name' => 'Oxygène Meaux',
                'main' => 'false',
                'radio_id' => 138
            ],
        ];

        $stream = [
            [
                'code_name' => 'oxygene_main',
                'name' => 'Oxygène Melun',
                'radio_id' => 138,
                'current_song' => 'true',
                'url' => 'http://str0.creacast.com/oxy-melun',
                'main' => 'true',
                'enabled' => 'true',
                'sub_radio' => 211
            ],
            [
                'code_name' => 'oxygene_sud77',
                'name' => 'Oxygène Sud 77',
                'radio_id' => 138,
                'current_song' => 'true',
                'url' => 'http://str0.creacast.com/oxy-montereau',
                'main' => 'false',
                'enabled' => 'true',
                'sub_radio' => 212
            ],
            [
                'code_name' => 'oxygene_provins',
                'name' => 'Oxygène Provins',
                'radio_id' => 138,
                'current_song' => 'true',
                'url' => 'http://str0.creacast.com/oxy-provins',
                'main' => 'false',
                'enabled' => 'true',
                'sub_radio' => 213
            ],
            [
                'code_name' => 'oxygene_coulommiers',
                'name' => 'Oxygène Coulommiers',
                'radio_id' => 138,
                'current_song' => 'true',
                'url' => 'http://str0.creacast.com/oxy-coulommiers',
                'main' => 'false',
                'enabled' => 'true',
                'sub_radio' => 214
            ],
            [
                'code_name' => 'oxygene_meaux',
                'name' => 'Oxygène Meaux',
                'radio_id' => 138,
                'current_song' => 'true',
                'url' => 'http://str0.creacast.com/oxy-meaux',
                'main' => 'false',
                'enabled' => 'true',
                'sub_radio' => 215
            ],
        ];

        for ($i = 0; $i < count($radios); $i++) {
            $connection->exec(
                'INSERT INTO radio (id, category_id, code_name, name, country_code, timezone, share, collection_id) VALUES ('
                . ($i + 138) . ',' . $radios[$i]['category'] . ",'" . $radios[$i]['code_name'] . "','" . $radios[$i]['name'] . "','" . $radios[$i]['country'] . "','" . $radios[$i]['timezone'] . "'," . $radios[$i]['share'] . "," . $radios[$i]['collection'] . ");"
            );
        }

        for ($i = 0; $i < count($subRadios); $i++) {
            $connection->exec(
                'INSERT INTO sub_radio (id, radio_id, code_name, name, main, enabled) VALUES ('
                . ($i + 211) . ',' . $subRadios[$i]['radio_id'] . ",'" . $subRadios[$i]['code_name'] . "','" . $subRadios[$i]['name'] . "'," . $subRadios[$i]['main'] . ',true);'
            );
        }

        for ($i = 0; $i < count($stream); $i++) {
            $connection->exec(
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
