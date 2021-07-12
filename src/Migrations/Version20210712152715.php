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
final class Version20210712152715 extends AbstractMigration implements ContainerAwareInterface
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
                'codename'   => 'fm93',
                'name'       => 'FM93',
                'category'   => 1,
                'collection' => 4,
                'share'      => 0.0,
                'country'    => 'CA',
                'timezone'   => 'America/Montreal'
            ],
        ];

        $stream = [
            [
                'code_name'    => 'fm93_main',
                'name'         => 'FM93',
                'radio_id'     => 104,
                'url'          => 'https://cogecomedia.leanstream.co/cogecomedia/CJMFFM.stream/playlist.m3u8?type=.ts&args=web_01',
                'current_song' => 'false',
                'main'         => 'true',
                'enabled'      => 'true',
            ]
        ];

        for ($i = 0; $i < count($radios); $i++) {
            $connection->exec(
                'INSERT INTO radio (id, category_id, code_name, name, country_code, timezone, share, collection_id) VALUES ('
                .($i + 104).','.$radios[$i]['category'].",'".$radios[$i]['codename']."','".$radios[$i]['name']."','".$radios[$i]['country']."','". $radios[$i]['timezone']."',".$radios[$i]['share'].",".$radios[$i]['collection'].");"
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
