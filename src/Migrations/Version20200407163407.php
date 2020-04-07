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
final class Version20200407163407 extends AbstractMigration implements ContainerAwareInterface
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
                'codename'   => 'evasionfm',
                'name'       => 'Evasion',
                'category'   => 2,
                'collection' => 3,
                'share'      => 0,
                'stream'     => 'https://stream.evasionfm.com/Essonne.aac'
            ]
        ];

        for ($i = 0; $i < count($radios); $i++) {
            for ($i = 0; $i < count($radios); $i++) {
                $connection->exec(
                    'INSERT INTO radio (id, category_id, code_name, stream_url, name, share, collection_id) VALUES ('
                    .($i + 75).','.$radios[$i]['category'].",'".$radios[$i]['codename']."','".$radios[$i]['stream']."','".$radios[$i]['name']."',".$radios[$i]['share'].",".$radios[$i]['collection'].");"
                );
            }
        }
    }
}
