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
final class Version20230813103211  extends AbstractMigration implements ContainerAwareInterface
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
                'code_name'   => 'radio_vinci_autoroutes',
                'name'       => 'Radio Vinci Autoroutes',
                'category'   => 1,
                'collection' => 3,
                'share'      => 1,
                'country'    => 'FR',
                'timezone'   => 'Europe/Paris'
            ]
        ];


        $subRadios = [
            [
                'code_name' => 'radio_vinci_autoroutes_main',
                'name'     => 'Radio Vinci Autoroutes Ouest Centre',
                'main'     => 'true',
                'radio_id' => 125
            ],
            [
                'code_name' => 'radio_vinci_autoroutes_loire',
                'name'     => 'Radio Vinci Autoroutes Perche - Pays de la Loire',
                'main'     => 'false',
                'radio_id' => 125
            ],
            [
                'code_name' => 'radio_vinci_autoroutes_grand_ouest',
                'name'     => 'Radio Vinci Autoroutes Grand Ouest',
                'main'     => 'false',
                'radio_id' => 125
            ],
            [
                'code_name' => 'radio_vinci_autoroutes_sud_ouest',
                'name'     => 'Radio Vinci Autoroutes Sud Ouest',
                'main'     => 'false',
                'radio_id' => 125
            ],
            [
                'code_name' => 'radio_vinci_autoroutes_languedoc_roussillon',
                'name'     => 'Radio Vinci Autoroutes Languedoc Roussillon',
                'main'     => 'false',
                'radio_id' => 125
            ],
            [
                'code_name' => 'radio_vinci_autoroutes_auvergne',
                'name'     => 'Radio Vinci Autoroutes Auvergne Rhône Méditerranée',
                'main'     => 'false',
                'radio_id' => 125
            ],
            [
                'code_name' => 'radio_vinci_autoroutes_alpes_provence',
                'name'     => 'Radio Vinci Autoroutes Perche - Alpes Provence',
                'main'     => 'false',
                'radio_id' => 125
            ],
            [
                'code_name' => 'radio_vinci_autoroutes_cote_azur',
                'name'     => "Radio Vinci Autoroutes Perche - Côte-d Azur",
                'main'     => 'false',
                'radio_id' => 125
            ],            [
                'code_name' => 'radio_vinci_autoroutes_strasbourg',
                'name'     => 'Radio Vinci Autoroutes Strasbourg - A355',
                'main'     => 'false',
                'radio_id' => 125
            ],
        ];

        $stream = [
            [
                'code_name' => 'radio_vinci_autoroutes_main',
                'name'     => 'Radio Vinci Autoroutes Ouest Centre',
                'radio_id'     => 125,
                'current_song' => 'false',
                'url'          => 'https://ice.creacast.com/radio_vinci_autoroutes_cofiroute_r3',
                'main'         => 'true',
                'enabled'      => 'true',
                'sub_radio'    => 187
            ],
            [
                'code_name' => 'radio_vinci_autoroutes_loire',
                'name'     => 'Radio Vinci Autoroutes Perche - Pays de la Loire',
                'radio_id'     => 125,
                'current_song' => 'false',
                'url'          => 'https://ice.creacast.com/radio_vinci_autoroutes_cofiroute_r2',
                'main'         => 'true',
                'enabled'      => 'true',
                'sub_radio'    => 188
            ],
            [
                'code_name' => 'radio_vinci_autoroutes_grand_ouest',
                'name'     => 'Radio Vinci Autoroutes Grand Ouest',
                'radio_id'     => 125,
                'current_song' => 'false',
                'url'          => 'https://str0.creacast.com/radio_vinci_autoroutes_3',
                'main'         => 'true',
                'enabled'      => 'true',
                'sub_radio'    => 189
            ],
            [
                'code_name' => 'radio_vinci_autoroutes_sud_ouest',
                'name'     => 'Radio Vinci Autoroutes Sud Ouest',
                'radio_id'     => 125,
                'current_song' => 'false',
                'url'          => 'https://str0.creacast.com/radio_vinci_autoroutes_3',
                'main'         => 'true',
                'enabled'      => 'true',
                'sub_radio'    => 190
            ],
            [
                'code_name' => 'radio_vinci_autoroutes_languedoc_roussillon',
                'name'     => 'Radio Vinci Autoroutes Languedoc Roussillon',
                'radio_id'     => 125,
                'current_song' => 'false',
                'url'          => 'https://str0.creacast.com/radio_vinci_autoroutes_4',
                'main'         => 'true',
                'enabled'      => 'true',
                'sub_radio'    => 191
            ],
            [
                'code_name' => 'radio_vinci_autoroutes_auvergne',
                'name'     => 'Radio Vinci Autoroutes Auvergne Rhône Méditerranée',
                'radio_id'     => 125,
                'current_song' => 'false',
                'url'          => 'https://str0.creacast.com/radio_vinci_autoroutes_5',
                'main'         => 'true',
                'enabled'      => 'true',
                'sub_radio'    => 192
            ],
            [
                'code_name' => 'radio_vinci_autoroutes_alpes_provence',
                'name'     => 'Radio Vinci Autoroutes Perche - Alpes Provence',
                'radio_id'     => 125,
                'current_song' => 'false',
                'url'          => 'https://str0.creacast.com/radio_vinci_autoroutes_6',
                'main'         => 'true',
                'enabled'      => 'true',
                'sub_radio'    => 193
            ],
            [
                'code_name' => 'radio_vinci_autoroutes_cote_azur',
                'name'     => "Radio Vinci Autoroutes Perche - Côte-d Azur",
                'radio_id'     => 125,
                'current_song' => 'false',
                'url'          => 'https://str0.creacast.com/radio_vinci_autoroutes_7',
                'main'         => 'true',
                'enabled'      => 'true',
                'sub_radio'    => 194
            ],
            [
                'code_name' => 'radio_vinci_autoroutes_strasbourg',
                'name'     => 'Radio Vinci Autoroutes Strasbourg - A355',
                'radio_id'     => 125,
                'current_song' => 'false',
                'url'          => 'https://ice.creacast.com/radio_vinci_autoroutes_a355',
                'main'         => 'true',
                'enabled'      => 'true',
                'sub_radio'    => 195
            ],
        ];

        for ($i = 0; $i < count($radios); $i++) {
            $connection->exec(
                'INSERT INTO radio (id, category_id, code_name, name, country_code, timezone, share, collection_id) VALUES ('
                .($i + 125).','.$radios[$i]['category'].",'".$radios[$i]['code_name']."','".$radios[$i]['name']."','".$radios[$i]['country']."','".$radios[$i]['timezone']."',".$radios[$i]['share'].",".$radios[$i]['collection'].");"
            );
        }

        for ($i = 0; $i < count($subRadios); $i++) {
            $connection->exec(
                'INSERT INTO sub_radio (id, radio_id, code_name, name, main, enabled) VALUES ('
                .($i + 187).','.$subRadios[$i]['radio_id'].",'".$subRadios[$i]['code_name']."','".$subRadios[$i]['name']."',".$subRadios[$i]['main'].',true);'
            );
        }

        for ($i = 0; $i < count($stream); $i++) {
            $connection->exec(
                "INSERT INTO radio_stream (code_name, name, url, radio_id, sub_radio_id, current_song,main,enabled) VALUES ('"
                .$stream[$i]['code_name']."','".$stream[$i]['name']."','".$stream[$i]['url']."',".$stream[$i]['radio_id'].','.$stream[$i]['sub_radio'].','.$stream[$i]['current_song'].','.$stream[$i]['main'].','.$stream[$i]['enabled'].')'
            );
        }
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
