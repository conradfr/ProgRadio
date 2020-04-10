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
final class Version20200407221128 extends AbstractMigration implements ContainerAwareInterface
{
    private $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
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
                'codename'   => 'alpes1_grenoble',
                'name'       => 'Alpes 1 Grenoble',
                'category'   => 2,
                'collection' => 3,
                'share'      => 0,
                'stream'     => 'https://alpes1grenoble.ice.infomaniak.ch/alpes1grenoble-high.mp3'
            ],
            [
                'codename'   => 'alpes1_sud',
                'name'       => 'Alpes 1 Alpes du Sud',
                'category'   => 2,
                'collection' => 3,
                'share'      => 0,
                'stream'     => 'https://alpes1gap.ice.infomaniak.ch/alpes1gap-high.mp3'
            ]
        ];

        for ($i = 0; $i < count($radios); $i++) {
            $connection->exec(
                'INSERT INTO radio (id, category_id, code_name, stream_url, name, share, collection_id) VALUES ('
                .($i + 76).','.$radios[$i]['category'].",'".$radios[$i]['codename']."','".$radios[$i]['stream']."','".$radios[$i]['name']."',".$radios[$i]['share'].",".$radios[$i]['collection'].");"
            );
        }
    }
}
