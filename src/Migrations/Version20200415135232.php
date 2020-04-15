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
final class Version20200415135232 extends AbstractMigration implements ContainerAwareInterface
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
                'codename'   => 'lapremiere',
                'name'       => 'La Première',
                'category'   => 1,
                'collection' => 4,
                'share'      => 0.0,
                'stream'     => 'https://radios.rtbf.be/laprem1ere-64.aac?userref=e8a2d409e555a1c406e272db3496d1'
            ],
            [
                'codename'   => 'classic21',
                'name'       => 'Classic 21',
                'category'   => 2,
                'collection' => 4,
                'share'      => 0.0,
                'stream'     => 'https://radios.rtbf.be/classic21-64.aac?userref=e8a2d409e555a1c406e272db3496d1'
            ],
            [
                'codename'   => 'vivacite',
                'name'       => 'VivaCité',
                'category'   => 1,
                'collection' => 4,
                'share'      => 0.0,
                'stream'     => 'https://radios.rtbf.be/vivabxl-64.aac?userref=e8a2d409e555a1c406e272db3496d1'
            ],
            [
                'codename'   => 'musiq3',
                'name'       => 'Musiq3',
                'category'   => 2,
                'collection' => 4,
                'share'      => 0.0,
                'stream'     => 'https://radios.rtbf.be/musiq3-128.aac?userref=e8a2d409e555a1c406e272db3496d1'
            ],
            [
                'codename'   => 'pure',
                'name'       => 'Pure',
                'category'   => 2,
                'collection' => 4,
                'share'      => 0.0,
                'stream'     => 'https://radios.rtbf.be/pure-64.aac?userref=e8a2d409e555a1c406e272db3496d1'
            ],
        ];

        for ($i = 0; $i < count($radios); $i++) {
            $connection->exec(
                'INSERT INTO radio (id, category_id, code_name, stream_url, name, share, collection_id) VALUES ('
                .($i + 82).','.$radios[$i]['category'].",'".$radios[$i]['codename']."','".$radios[$i]['stream']."','".$radios[$i]['name']."',".$radios[$i]['share'].",".$radios[$i]['collection'].");"
            );
        }
    }
}
