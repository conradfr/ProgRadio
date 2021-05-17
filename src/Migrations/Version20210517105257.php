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
final class Version20210517105257 extends AbstractMigration implements ContainerAwareInterface
{
    private $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs

    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }

    public function postUp(Schema $schema): void
    {
        $connection = $this->container->get('doctrine.orm.entity_manager')->getConnection();

        // RADIOS

        $radios = [
            [
                'codename'   => 'trace_martinique',
                'name'       => 'Trace FM Martinique',
                'category'   => 2,
                'collection' => 6,
                'share'      => 0.0
            ],
            [
                'codename'   => 'trace_reunion',
                'name'       => 'Trace FM La Réunion',
                'category'   => 2,
                'collection' => 6,
                'share'      => 0.0
            ],
            [
                'codename'   => 'trace_guyane',
                'name'       => 'Trace FM Guyane',
                'category'   => 2,
                'collection' => 6,
                'share'      => 0.0
            ]
        ];

        $stream = [
            [
                'code_name'  => 'trace_martinique_main',
                'name'       => 'Trace FM Martinique',
                'radio_id'   => 101,
                'url'        => 'https://stream.trace.tv/trace_fm_martinique-midfi.aac',
                'current_song' => 'false',
                'main' => 'true',
                'enabled' => 'true',
            ],
            [
                'code_name'  => 'trace_reunion_main',
                'name'       => 'Trace FM La Réunion',
                'radio_id'   => 102,
                'url'        => 'https://stream.trace.tv/trace_fm_martinique-midfi.aac',
                'current_song' => 'false',
                'main' => 'true',
                'enabled' => 'false',
            ],
            [
                'code_name'  => 'trace_guyane_main',
                'name'       => 'Trace FM Guyane',
                'radio_id'   => 103,
                'url'        =>  'https://stream.trace.tv/trace_fm_guyane-midfi.aac',
                'current_song' => 'false',
                'main' => 'true',
                'enabled' => 'true',
            ]
        ];

        for ($i = 0; $i < count($radios); $i++) {
            $connection->exec(
                'INSERT INTO radio (id, category_id, code_name, name, share, collection_id) VALUES ('
                .($i + 101).','.$radios[$i]['category'].",'".$radios[$i]['codename']."','".$radios[$i]['name']."',".$radios[$i]['share'].",".$radios[$i]['collection'].");"
            );
        }

        for ($i = 0; $i < count($stream); $i++) {
            $connection->exec("INSERT INTO radio_stream (code_name, name, url, radio_id, current_song,main,enabled) VALUES ('"
                . $stream[$i]['code_name']."','".$stream[$i]['name']."','".$stream[$i]['url']."',".$stream[$i]['radio_id']. ','. $stream[$i]['current_song']. ','. $stream[$i]['main'].','. $stream[$i]['enabled'].')');
        }
    }
}
