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
final class Version20200414090449 extends AbstractMigration implements ContainerAwareInterface
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
        $this->addSql(
            'INSERT INTO collection (id, code_name, name, priority, sort_field, sort_order) VALUES (4, \'international\', \'International\', 4, \'code_name\', \'asc\')'
        );
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
                'codename'   => 'couleur3',
                'name'       => 'Couleur 3',
                'category'   => 2,
                'collection' => 4,
                'share'      => 0.0,
                'stream'     => 'http://stream.srg-ssr.ch/m/couleur3/mp3_128'
            ],
            [
                'codename'   => 'espace2',
                'name'       => 'Espace 2',
                'category'   => 2,
                'collection' => 4,
                'share'      => 0.0,
                'stream'     => 'http://stream.srg-ssr.ch/m/espace-2/mp3_128'
            ],
            [
                'codename'   => 'la1ere',
                'name'       => 'La Première',
                'category'   => 1,
                'collection' => 4,
                'share'      => 0.0,
                'stream'     => 'http://stream.srg-ssr.ch/m/la-1ere/mp3_128'
            ],
            [
                'codename'   => 'optionmusique',
                'name'       => 'Option Musique',
                'category'   => 2,
                'collection' => 4,
                'share'      => 0.0,
                'stream'     => 'http://stream.srg-ssr.ch/m/option-musique/mp3_128'
            ],
        ];

        for ($i = 0; $i < count($radios); $i++) {
            $connection->exec(
                'INSERT INTO radio (id, category_id, code_name, stream_url, name, share, collection_id) VALUES ('
                .($i + 78).','.$radios[$i]['category'].",'".$radios[$i]['codename']."','".$radios[$i]['stream']."','".$radios[$i]['name']."',".$radios[$i]['share'].",".$radios[$i]['collection'].");"
            );
        }
    }
}
