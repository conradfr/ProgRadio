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
final class Version20201106094121 extends AbstractMigration implements ContainerAwareInterface
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
                'codename'   => 'rfi_monde',
                'name'       => 'RFI Monde',
                'category'   => 1,
                'collection' => 4,
                'share'      => 0.0,
                'stream'     => 'https://rfimonde64k.ice.infomaniak.ch/rfimonde-64.mp3'
            ],
            [
                'codename'   => 'rfi_afrique',
                'name'       => 'RFI Afrique',
                'category'   => 1,
                'collection' => 4,
                'share'      => 0.0,
                'stream'     => 'https://rfiafrique64k.ice.infomaniak.ch/rfiafrique-64.mp3'
            ],
        ];

        for ($i = 0; $i < count($radios); $i++) {
            $connection->exec(
                'INSERT INTO radio (id, category_id, code_name, streaming_url, name, share, collection_id) VALUES ('
                .($i + 90).','.$radios[$i]['category'].",'".$radios[$i]['codename']."','".$radios[$i]['stream']."','".$radios[$i]['name']."',".$radios[$i]['share'].",".$radios[$i]['collection'].");"
            );
        }
    }
}
