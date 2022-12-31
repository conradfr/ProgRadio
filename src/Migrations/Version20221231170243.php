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
final class Version20221231170243 extends AbstractMigration implements ContainerAwareInterface
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
                'codename'   => 'chantefrance',
                'name'       => 'Chante France',
                'category'   => 2,
                'collection' => 7,
                'share'      => 0.0,
                'country'    => 'FR',
                'timezone'   => 'Europe/Paris'
            ],
            [
                'codename'   => 'toulousefm',
                'name'       => 'Toulouse FM',
                'category'   => 2,
                'collection' => 7,
                'share'      => 0.0,
                'country'    => 'FR',
                'timezone'   => 'Europe/Paris'
            ]
        ];

        $stream = [
            [
                'code_name'    => 'chantefrance_main',
                'name'         => 'Chante France',
                'radio_id'     => 119,
                'url'          => 'https://chantefrance.ice.infomaniak.ch/chantefrance-96.aac',
                'current_song' => 'true',
                'main'         => 'true',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'chantefrance_80s',
                'name'         => 'Chante France 80\'\'s',
                'radio_id'     => 119,
                'url'          => 'https://chantefrance80s.ice.infomaniak.ch/chantefrance80s-96.aac',
                'current_song' => 'true',
                'main'         => 'false',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'chantefrance_70s',
                'name'         => 'Chante France 70\'\'s',
                'radio_id'     => 119,
                'url'          => 'https://chantefrance70s.ice.infomaniak.ch/chantefrance70s-96.aac',
                'current_song' => 'true',
                'main'         => 'false',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'chantefrance_60s',
                'name'         => 'Chante France 60\'\'s',
                'radio_id'     => 119,
                'url'          => 'https://chantefrance70s.ice.infomaniak.ch/chantefrance60s-96.aac',
                'current_song' => 'true',
                'main'         => 'false',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'chantefrance_emotion',
                'name'         => 'Chante France Emotion',
                'radio_id'     => 119,
                'url'          => 'https://chantefranceemotion.ice.infomaniak.ch/chantefranceemotion-96.aac',
                'current_song' => 'true',
                'main'         => 'false',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'chantefrance_nouveautes',
                'name'         => 'Chante France Nouveautés',
                'radio_id'     => 119,
                'url'          => 'https://chantefrancenouveautes.ice.infomaniak.ch/chantefrancenouveautes-96.aac',
                'current_song' => 'true',
                'main'         => 'false',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'toulousefm_main',
                'name'         => 'Toulouse FM',
                'radio_id'     => 120,
                'url'          => 'https://mmradioswebapp.ice.infomaniak.ch/toulousefm-webapp.aac',
                'current_song' => 'true',
                'main'         => 'true',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'toulousefm_bodega',
                'name'         => 'Toulouse FM Bodega',
                'radio_id'     => 120,
                'url'          => 'https://mmradioswebapp.ice.infomaniak.ch/toulousefm-webapp-bodega.aac',
                'current_song' => 'true',
                'main'         => 'false',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'toulousefm_no_french',
                'name'         => 'Toulouse FM No French',
                'radio_id'     => 120,
                'url'          => 'https://mmradioswebapp.ice.infomaniak.ch/toulousefm-webapp-nofrench.aac',
                'current_song' => 'true',
                'main'         => 'false',
                'enabled'      => 'true',
            ],
        ];

        for ($i = 0; $i < count($radios); $i++) {
            $connection->exec(
                'INSERT INTO radio (id, category_id, code_name, name, country_code, timezone, share, collection_id) VALUES ('
                .($i + 119).','.$radios[$i]['category'].",'".$radios[$i]['codename']."','".$radios[$i]['name']."','".$radios[$i]['country']."','".$radios[$i]['timezone']."',".$radios[$i]['share'].",".$radios[$i]['collection'].");"
            );
        }

        for ($i = 0; $i < count($stream); $i++) {
            $connection->exec(
                "INSERT INTO radio_stream (code_name, name, url, radio_id, current_song,main,enabled) VALUES ('"
                .$stream[$i]['code_name']."','".$stream[$i]['name']."','".$stream[$i]['url']."',".$stream[$i]['radio_id'].','.$stream[$i]['current_song'].','.$stream[$i]['main'].','.$stream[$i]['enabled'].')'
            );
        }

    }
}
