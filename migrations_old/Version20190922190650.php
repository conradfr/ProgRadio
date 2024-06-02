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
final class Version20190922190650 extends AbstractMigration implements ContainerAwareInterface
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
        $this->addSql('INSERT INTO collection (id, code_name, name, priority, sort_field, sort_order) VALUES (3, \'lesindes\', \'Les Indés Radios\', 2, \'code_name\', \'asc\')');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }

    public function postUp(Schema $schema): void
    {
        $connection = $this->container->get('doctrine.orm.entity_manager')->getConnection();

        $connection->exec(
            "UPDATE collection SET priority = 3 WHERE id = 2"
        );

        // RADIOS

        $radios = [
            [
                'codename' => 'africaradio',
                'name' => 'Africa Radio',
                'category' => 2,
                'collection' => 3,
                'share' => 0.0,
                'stream' => 'https://african1paris.ice.infomaniak.ch/african1paris-128.mp3'
            ],
            [
                'codename' => 'alouette',
                'name' => 'Alouette',
                'category' => 2,
                'collection' => 3,
                'share' => 0.0,
                'stream' => 'https://alouette.ice.infomaniak.ch/alouette-high.mp3'
            ],
            [
                'codename' => 'beurfm',
                'name' => 'Beur FM',
                'category' => 1,
                'collection' => 3,
                'share' => 0.0,
                'stream' => 'https://beurfm.ice.infomaniak.ch/beurfm-high.mp3'
            ],
            [
                'codename' => 'contactfm',
                'name' => 'Contact FM',
                'category' => 1,
                'collection' => 3,
                'share' => 0.0,
                'stream' => 'https://radio-contact.ice.infomaniak.ch/radio-contact-high.mp3'
            ],
            [
                'codename' => 'latina',
                'name' => 'Latina',
                'category' => 2,
                'collection' => 3,
                'share' => 0.0,
                'stream' => 'https://start-latina.ice.infomaniak.ch/start-latina-high.mp3'
            ],
            [
                'codename' => 'voltage',
                'name' => 'Voltage',
                'category' => 2,
                'collection' => 3,
                'share' => 0.0,
                'stream' => 'https://start-voltage.ice.infomaniak.ch/start-voltage-high.mp3'
            ],
        ];

        for ($i=0;$i<count($radios);$i++) {
            $connection->exec(
                'INSERT INTO radio (id, category_id, code_name, stream_url, name, share, collection_id) VALUES ('
                .($i + 68).','.$radios[$i]['category'].",'".$radios[$i]['codename']."','".$radios[$i]['stream']."','".$radios[$i]['name']."',".$radios[$i]['share'].",".$radios[$i]['collection'].");"
            );
        }
    }
}
