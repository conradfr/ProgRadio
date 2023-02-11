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
final class Version20230211110528 extends AbstractMigration implements ContainerAwareInterface
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

        $connection = $this->container->get('doctrine.orm.entity_manager')->getConnection();

        // RADIOS

        $subRadios = [
            [
                'codename' => 'radionova_bordeaux',
                'name'     => 'Radio Nova Bordeaux',
                'main'     => 'false',
                'radio_id' => 16
            ],
            [
                'codename' => 'radionova_lyon',
                'name'     => 'Radio Nova Lyon',
                'main'     => 'false',
                'radio_id' => 16
            ],
        ];

        $stream = [
            [
                'code_name'    => 'radionova_bordeaux',
                'name'         => 'Radio Nova Bordeaux',
                'radio_id'     => 16,
                'current_song' => 'false',
                'url'          => 'http://snb.ice.infomaniak.ch/snb-high.mp3',
                'main'         => 'false',
                'enabled'      => 'true',
                'sub_radio'    => 185
            ],
            [
                'code_name'    => 'radionova_lyon',
                'name'         => 'Radio Nova Lyon',
                'radio_id'     => 16,
                'collection'   => 2,
                'current_song' => 'false',
                'url'          => 'http://nova-lyon.ice.infomaniak.ch/nova-lyon-128.mp3',
                'main'         => 'false',
                'enabled'      => 'true',
                'sub_radio'    => 186
            ],
        ];

        for ($i = 0; $i < count($subRadios); $i++) {
            $connection->exec(
                'INSERT INTO sub_radio (id, radio_id, code_name, name, main, enabled) VALUES ('
                .($i + 185).','.$subRadios[$i]['radio_id'].",'".$subRadios[$i]['codename']."','".$subRadios[$i]['name']."',".$subRadios[$i]['main'].',true);'
            );
        }

        for ($i = 0; $i < count($stream); $i++) {
            $connection->exec(
                "INSERT INTO radio_stream (code_name, name, url, radio_id, sub_radio_id, current_song,main,enabled) VALUES ('"
                .$stream[$i]['code_name']."','".$stream[$i]['name']."','".$stream[$i]['url']."',".$stream[$i]['radio_id'].','.$stream[$i]['sub_radio'].','.$stream[$i]['current_song'].','.$stream[$i]['main'].','.$stream[$i]['enabled'].')'
            );
        }
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
