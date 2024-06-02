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
final class Version20230118161247 extends AbstractMigration implements ContainerAwareInterface
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

    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }

    public function postUp(Schema $schema): void
    {
        $connection = $this->container->get('doctrine.orm.entity_manager')->getConnection();

        // RADIOS

        $radios = [
            [
                'codename'   => 'radio_scoop',
                'name'       => 'Radio SCOOP',
                'category'   => 2,
                'collection' => 3,
                'share'      => 0.0,
                'country'    => 'FR',
                'timezone'   => 'Europe/Paris'
            ]
        ];

        $subRadios = [
            [
                'codename'   => 'radio_scoop_lyon',
                'name'       => 'Radio SCOOP Lyon',
                'main'       => 'true',
                'radio_id'   => 123
            ],
            [
                'codename'   => 'radio_scoop_vienne',
                'name'       => 'Radio SCOOP Vienne',
                'main'       => 'false',
                'radio_id'   => 123
            ],
            [
                'codename'   => 'radio_scoop_tarare',
                'name'       => 'Radio SCOOP Tarare',
                'main'       => 'false',
                'radio_id'   => 123
            ],
            [
                'codename'   => 'radio_scoop_saintetienne',
                'name'       => 'Radio SCOOP Saint-Étienne',
                'main'       => 'false',
                'radio_id'   => 123
            ],
            [
                'codename'   => 'radio_scoop_roanne',
                'name'       => 'Radio SCOOP Roanne',
                'main'       => 'false',
                'radio_id'   => 123
            ],
            [
                'codename'   => 'radio_scoop_lepuyenvelay',
                'name'       => 'Radio SCOOP Le-Puy-En-Velay',
                'main'       => 'false',
                'radio_id'   => 123
            ],
            [
                'codename'   => 'radio_scoop_yssingeaux',
                'name'       => 'Radio SCOOP Issingeaux',
                'main'       => 'false',
                'radio_id'   => 123
            ],
            [
                'codename'   => 'radio_scoop_clermont',
                'name'       => 'Radio SCOOP Clermont',
                'main'       => 'false',
                'radio_id'   => 123
            ],
            [
                'codename'   => 'radio_scoop_vichy',
                'name'       => 'Radio SCOOP Vichy',
                'main'       => 'false',
                'radio_id'   => 123
            ],
            [
                'codename'   => 'radio_scoop_bourgenbresse',
                'name'       => 'Radio SCOOP Bourg-En-Bresse',
                'main'       => 'false',
                'radio_id'   => 123
            ],
            [
                'codename'   => 'radio_scoop_macon',
                'name'       => 'Radio SCOOP Mâcon',
                'main'       => 'false',
                'radio_id'   => 123
            ],
            [
                'codename'   => 'radio_scoop_valserhone',
                'name'       => 'Radio SCOOP Valserhône',
                'main'       => 'false',
                'radio_id'   => 123
            ],
            [
                'codename'   => 'radio_scoop_aubenas',
                'name'       => 'Radio SCOOP Aubenas',
                'main'       => 'false',
                'radio_id'   => 123
            ],
            [
                'codename'   => 'radio_scoop_grenoble',
                'name'       => 'Radio SCOOP Grenoble',
                'main'       => 'false',
                'radio_id'   => 123
            ],
            [
                'codename'   => 'radio_scoop_chambery',
                'name'       => 'Radio SCOOP Chambery',
                'main'       => 'false',
                'radio_id'   => 123
            ],
            [
                'codename'   => 'radio_scoop_annecy',
                'name'       => 'Radio SCOOP Annecy',
                'main'       => 'false',
                'radio_id'   => 123
            ]
        ];

        $stream = [
            [
                'code_name'    => 'radio_scoop_main',
                'name'         => 'Radio SCOOP Lyon',
                'radio_id'     => 123,
                'sub_radio_id' => 123,
                'url'          => 'https://radioscooplyon.ice.infomaniak.ch/radioscoop-lyon-64.aac',
                'current_song' => 'true',
                'main'         => 'true',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'radio_scoop_vienne',
                'name'         => 'Radio SCOOP Vienne',
                'radio_id'     => 123,
                'sub_radio_id' => 124,
                'url'          => 'https://radioscoopvienne.ice.infomaniak.ch/radioscoop-vienne-64.aac',
                'current_song' => 'true',
                'main'         => 'false',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'radio_scoop_tarare',
                'name'         => 'Radio SCOOP Tarare',
                'radio_id'     => 123,
                'sub_radio_id' => 125,
                'url'          => 'https://radioscooplyon.ice.infomaniak.ch/radioscoop-lyon-64.aac',
                'current_song' => 'true',
                'main'         => 'false',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'radio_scoop_saintetienne',
                'name'         => 'Radio SCOOP Saint-Étienne',
                'radio_id'     => 123,
                'sub_radio_id' => 126,
                'url'          => 'https://radioscoopsaintetienne.ice.infomaniak.ch/radioscoop-stetienne-64.aac',
                'current_song' => 'true',
                'main'         => 'false',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'radio_scoop_roanne',
                'name'         => 'Radio SCOOP Roanne',
                'radio_id'     => 123,
                'sub_radio_id' => 127,
                'url'          => 'https://radioscooproanne.ice.infomaniak.ch/radioscoop-roanne-64.aac',
                'current_song' => 'true',
                'main'         => 'false',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'radio_scoop_lepuyenvelay',
                'name'         => 'Radio SCOOP Le-Puy-En-Velay',
                'radio_id'     => 123,
                'sub_radio_id' => 128,
                'url'          => 'https://radioscooplepuy-en-velay.ice.infomaniak.ch/radioscoop-lepuy-64.aac',
                'current_song' => 'true',
                'main'         => 'false',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'radio_scoop_yssingeaux',
                'name'         => 'Radio SCOOP Yssingeaux',
                'radio_id'     => 123,
                'sub_radio_id' => 129,
                'url'          => 'https://radioscoopyssingeaux.ice.infomaniak.ch/radioscoop-yssingeaux-64.aac',
                'current_song' => 'true',
                'main'         => 'false',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'radio_scoop_clermont',
                'name'         => 'Radio SCOOP Clermont',
                'radio_id'     => 123,
                'sub_radio_id' => 130,
                'url'          => 'https://radioscoopclermont-ferrand.ice.infomaniak.ch/radioscoop-clermont-64.aac',
                'current_song' => 'true',
                'main'         => 'false',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'radio_scoop_vichy',
                'name'         => 'Radio SCOOP Vichy',
                'radio_id'     => 123,
                'sub_radio_id' => 131,
                'url'          => 'https://radioscoopvichy.ice.infomaniak.ch/radioscoop-vichy-64.aac',
                'current_song' => 'true',
                'main'         => 'false',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'radio_scoop_bourgenbresse',
                'name'         => 'Radio SCOOP Bourg-En-Bresse',
                'radio_id'     => 123,
                'sub_radio_id' => 132,
                'url'          => 'https://radioscoopbourg-en-bresse.ice.infomaniak.ch/radioscoop-bourg-64.aac',
                'current_song' => 'true',
                'main'         => 'false',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'radio_scoop_macon',
                'name'         => 'Radio SCOOP Mâcon',
                'radio_id'     => 123,
                'sub_radio_id' => 133,
                'url'          => 'https://radioscoopmacon.ice.infomaniak.ch/radioscoop-macon-64.aac',
                'current_song' => 'true',
                'main'         => 'false',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'radio_scoop_valserhone',
                'name'         => 'Radio SCOOP Valserhône',
                'radio_id'     => 123,
                'sub_radio_id' => 134,
                'url'          => 'https://radioscoopbellegarde.ice.infomaniak.ch/radioscoop-bellegarde-64.aac',
                'current_song' => 'true',
                'main'         => 'false',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'radio_scoop_aubenas',
                'name'         => 'Radio SCOOP Aubenas',
                'radio_id'     => 123,
                'sub_radio_id' => 135,
                'url'          => 'https://radioscoopaubenas.ice.infomaniak.ch/radioscoop-aubenas-64.aac',
                'current_song' => 'true',
                'main'         => 'false',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'radio_scoop_grenoble',
                'name'         => 'Radio SCOOP Grenoble',
                'radio_id'     => 123,
                'sub_radio_id' => 136,
                'url'          => 'https://radioscoopgrenoble.ice.infomaniak.ch/radioscoop-grenoble-64.aac',
                'current_song' => 'true',
                'main'         => 'false',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'radio_scoop_chambery',
                'name'         => 'Radio SCOOP Chambery',
                'radio_id'     => 123,
                'sub_radio_id' => 137,
                'url'          => 'https://radioscoopalpes.ice.infomaniak.ch/radioscoop-alpes-64.aac',
                'current_song' => 'true',
                'main'         => 'false',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'radio_scoop_annecy',
                'name'         => 'Radio SCOOP Annecy',
                'radio_id'     => 123,
                'sub_radio_id' => 138,
                'url'          => 'https://radioscoopalpes.ice.infomaniak.ch/radioscoop-alpes-64.aac',
                'current_song' => 'true',
                'main'         => 'false',
                'enabled'      => 'true',
            ]
        ];

        for ($i = 0; $i < count($radios); $i++) {
            $connection->exec(
                'INSERT INTO radio (id, category_id, code_name, name, country_code, timezone, share, collection_id) VALUES ('
                .($i + 123).','.$radios[$i]['category'].",'".$radios[$i]['codename']."','".$radios[$i]['name']."','".$radios[$i]['country']."','".$radios[$i]['timezone']."',".$radios[$i]['share'].",".$radios[$i]['collection'].");"
            );
        }

        for ($i = 0; $i < count($subRadios); $i++) {
            $connection->exec(
                'INSERT INTO sub_radio (id, radio_id, code_name, name, main, enabled) VALUES ('
                .($i + 123).','.$subRadios[$i]['radio_id'].",'".$subRadios[$i]['codename']."','".$subRadios[$i]['name']."',".$subRadios[$i]['main'].',true);'
            );
        }

        for ($i = 0; $i < count($stream); $i++) {
            $connection->exec(
                "INSERT INTO radio_stream (code_name, name, url, radio_id, sub_radio_id, current_song,main,enabled) VALUES ('"
                .$stream[$i]['code_name']."','".$stream[$i]['name']."','".$stream[$i]['url']."',".$stream[$i]['radio_id'].','.$stream[$i]['sub_radio_id'].','.$stream[$i]['current_song'].','.$stream[$i]['main'].','.$stream[$i]['enabled'].')'
            );
        }

    }
}
