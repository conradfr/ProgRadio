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
final class Version20200919113328 extends AbstractMigration implements ContainerAwareInterface
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
                'codename'   => 'generations',
                'name'       => 'Generations',
                'category'   => 2,
                'collection' => 3,
                'share'      => 0.0,
                'stream'     => 'https://generationfm.ice.infomaniak.ch/generationfm-high.mp3'
            ],
            [
                'codename'   => 'forum',
                'name'       => 'Forum',
                'category'   => 2,
                'collection' => 3,
                'share'      => 0.0,
                'stream'     => 'https://start-forum.ice.infomaniak.ch/start-forum-high.mp3'
            ],
            [
                'codename'   => 'hitwest',
                'name'       => 'Hit West',
                'category'   => 2,
                'collection' => 3,
                'share'      => 0.0,
                'stream'     => 'https://hitwest.ice.infomaniak.ch/hitwest-high.mp3'
            ],
        ];

        for ($i = 0; $i < count($radios); $i++) {
            $connection->exec(
                'INSERT INTO radio (id, category_id, code_name, streaming_url, name, share, collection_id) VALUES ('
                .($i + 87).','.$radios[$i]['category'].",'".$radios[$i]['codename']."','".$radios[$i]['stream']."','".$radios[$i]['name']."',".$radios[$i]['share'].",".$radios[$i]['collection'].");"
            );
        }
    }
}
