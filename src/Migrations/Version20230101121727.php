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
final class Version20230101121727 extends AbstractMigration implements ContainerAwareInterface
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
                'codename'   => 'urbanhit',
                'name'       => 'Urban Hit',
                'category'   => 2,
                'collection' => 3,
                'share'      => 0.0,
                'country'    => 'FR',
                'timezone'   => 'Europe/Paris'
            ]
        ];

        $stream = [
            [
                'code_name'    => 'urbanhit_main',
                'name'         => 'Urban Hit',
                'radio_id'     => 122,
                'url'          => 'https://onlyrai.ice.infomaniak.ch/onlyrai-high.mp3',
                'current_song' => 'true',
                'main'         => 'true',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'urbanhit_nouveaute',
                'name'         => 'Urban Hit Nouveauté',
                'radio_id'     => 122,
                'url'          => 'https://urbanhitnouveautes.ice.infomaniak.ch/urbanhitnouveautes-128.mp3',
                'current_song' => 'true',
                'main'         => 'false',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'urbanhit_alancienne',
                'name'         => 'Urban Hit à l\'\'ancienne',
                'radio_id'     => 122,
                'url'          => 'https://urbanhitalancienne.ice.infomaniak.ch/urbanhitalancienne.mp3',
                'current_song' => 'true',
                'main'         => 'false',
                'enabled'      => 'true',
            ],
            [
                'code_name'    => 'urbanhit_us',
                'name'         => 'Urban Hit US',
                'radio_id'     => 122,
                'url'          => 'https://urbanhitus.ice.infomaniak.ch/urbanhitus-128.mp3',
                'current_song' => 'true',
                'main'         => 'false',
                'enabled'      => 'true',
            ]
        ];

        for ($i = 0; $i < count($radios); $i++) {
            $connection->exec(
                'INSERT INTO radio (id, category_id, code_name, name, country_code, timezone, share, collection_id) VALUES ('
                .($i + 122).','.$radios[$i]['category'].",'".$radios[$i]['codename']."','".$radios[$i]['name']."','".$radios[$i]['country']."','".$radios[$i]['timezone']."',".$radios[$i]['share'].",".$radios[$i]['collection'].");"
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
