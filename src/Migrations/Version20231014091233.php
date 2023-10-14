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
final class Version20231014091233 extends AbstractMigration implements ContainerAwareInterface
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
                'code_name' => 'autoroute_info',
                'name' => 'Autoroute Info 107.7',
                'category' => 1,
                'collection' => 3,
                'share' => 1,
                'country' => 'FR',
                'timezone' => 'Europe/Paris'
            ]
        ];

        $subRadios = [
            [
                'code_name' => 'autoroute_info_main',
                'name' => 'Autoroute Info 107.7 Rhône-Alpes',
                'main' => 'true',
                'radio_id' => 135
            ],
            [
                'code_name' => 'autoroute_info_centre_est',
                'name' => 'Autoroute Info 107.7 Centre Est',
                'main' => 'false',
                'radio_id' => 135
            ],
            [
                'code_name' => 'autoroute_info_centre_sud_ouest',
                'name' => 'Autoroute Info 107.7 Centre & Sud-Ouest',
                'main' => 'false',
                'radio_id' => 135
            ],
        ];

        $stream = [
            [
                'code_name' => 'autoroute_info_main',
                'name' => 'Autoroute Info 107.7 Rhône-Alpes',
                'radio_id' => 135,
                'current_song' => 'true',
                'url' => 'https://media.autorouteinfo.fr/direct_sud.mp3',
                'main' => 'true',
                'enabled' => 'true',
                'sub_radio' => 206
            ],
            [
                'code_name' => 'autoroute_info_centre_est',
                'name' => 'Autoroute Info 107.7 Centre Est',
                'radio_id' => 135,
                'current_song' => 'true',
                'url' => 'https://media.autorouteinfo.fr/direct_nord.mp3',
                'main' => 'false',
                'enabled' => 'true',
                'sub_radio' => 207
            ],
            [
                'code_name' => 'autoroute_info_centre_sud_ouest',
                'name' => 'Autoroute Info 107.7 Centre & Sud-Ouest',
                'radio_id' => 135,
                'current_song' => 'true',
                'url' => 'https://media.autorouteinfo.fr/direct_ouest.mp3',
                'main' => 'false',
                'enabled' => 'true',
                'sub_radio' => 208
            ],
        ];

        for ($i = 0; $i < count($radios); $i++) {
            $connection->exec(
                'INSERT INTO radio (id, category_id, code_name, name, country_code, timezone, share, collection_id) VALUES ('
                . ($i + 135) . ',' . $radios[$i]['category'] . ",'" . $radios[$i]['code_name'] . "','" . $radios[$i]['name'] . "','" . $radios[$i]['country'] . "','" . $radios[$i]['timezone'] . "'," . $radios[$i]['share'] . "," . $radios[$i]['collection'] . ");"
            );
        }

        for ($i = 0; $i < count($subRadios); $i++) {
            $connection->exec(
                'INSERT INTO sub_radio (id, radio_id, code_name, name, main, enabled) VALUES ('
                . ($i + 206) . ',' . $subRadios[$i]['radio_id'] . ",'" . $subRadios[$i]['code_name'] . "','" . $subRadios[$i]['name'] . "'," . $subRadios[$i]['main'] . ',true);'
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
