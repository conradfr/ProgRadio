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
final class Version20231126094303 extends AbstractMigration implements ContainerAwareInterface
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
                'code_name' => 'radiochablais',
                'name' => 'Radio Chablais',
                'category' => 1,
                'collection' => 10,
                'share' => 1,
                'country' => 'CH',
                'timezone' => 'Europe/Zurich'
            ],
            [
                'code_name' => 'rouge',
                'name' => 'Rouge',
                'category' => 2,
                'collection' => 10,
                'share' => 1,
                'country' => 'CH',
                'timezone' => 'Europe/Zurich'
            ]
        ];

        $subRadios = [
            [
                'code_name' => 'radiochablais_main',
                'name' => 'Radio Chablais',
                'main' => 'true',
                'radio_id' => 136
            ],
            [
                'code_name' => 'rouge_main',
                'name' => 'Rouge',
                'main' => 'true',
                'radio_id' => 137
            ],
        ];

        $stream = [
            [
                'code_name' => 'radiochablais_main',
                'name' => 'Radio Chablais',
                'radio_id' => 136,
                'current_song' => 'true',
                'url' => 'https://radiochablais.ice.infomaniak.ch/radiochablais-high.mp3',
                'main' => 'true',
                'enabled' => 'true',
                'sub_radio' => 209
            ],
            [
                'code_name' => 'radiochablais_swissmade',
                'name' => 'Radio Chablais - Swiss Made',
                'radio_id' => 136,
                'current_song' => 'true',
                'url' => 'https://stream.radiochablais.ch/chablais-swissmade.mp3',
                'main' => 'false',
                'enabled' => 'true',
                'sub_radio' => 'null'
            ],
            [
                'code_name' => 'rouge_main',
                'name' => 'Rouge',
                'radio_id' => 137,
                'current_song' => 'true',
                'url' => 'https://rougefm.ice.infomaniak.ch/rougefm-high.mp3',
                'main' => 'true',
                'enabled' => 'true',
                'sub_radio' => 210
            ],
            [
                'code_name' => 'rouge_suisse',
                'name' => 'Rouge - Suisse',
                'radio_id' => 137,
                'current_song' => 'true',
                'url' => 'https://rouge-suisse.ice.infomaniak.ch/rouge-suisse-128.mp3',
                'main' => 'false',
                'enabled' => 'true',
                'sub_radio' => 'null'
            ],
            [
                'code_name' => 'rouge_clubstory',
                'name' => 'Rouge - Club Story',
                'radio_id' => 137,
                'current_song' => 'true',
                'url' => 'https://rouge-disco.ice.infomaniak.ch/rouge-disco-128.mp3',
                'main' => 'false',
                'enabled' => 'true',
                'sub_radio' => 'null'
            ],
        ];

        for ($i = 0; $i < count($radios); $i++) {
            $connection->exec(
                'INSERT INTO radio (id, category_id, code_name, name, country_code, timezone, share, collection_id) VALUES ('
                . ($i + 136) . ',' . $radios[$i]['category'] . ",'" . $radios[$i]['code_name'] . "','" . $radios[$i]['name'] . "','" . $radios[$i]['country'] . "','" . $radios[$i]['timezone'] . "'," . $radios[$i]['share'] . "," . $radios[$i]['collection'] . ");"
            );
        }

        for ($i = 0; $i < count($subRadios); $i++) {
            $connection->exec(
                'INSERT INTO sub_radio (id, radio_id, code_name, name, main, enabled) VALUES ('
                . ($i + 209) . ',' . $subRadios[$i]['radio_id'] . ",'" . $subRadios[$i]['code_name'] . "','" . $subRadios[$i]['name'] . "'," . $subRadios[$i]['main'] . ',true);'
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
