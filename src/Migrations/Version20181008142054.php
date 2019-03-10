<?php declare(strict_types=1);

namespace DoctrineMigrations;

use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20181008142054 extends AbstractMigration implements ContainerAwareInterface
{
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
                'codename' => 'mouv',
                'name' => 'Mouv',
                'category' => 2,
                'share' => 0.15,
                'stream' => 'https://chai5she.cdn.dvmr.fr/mouv-midfi.mp3?ID=radiofrance'
            ]
        ];

        for ($i=0;$i<count($radios);$i++) {
            for ($i=0;$i<count($radios);$i++) {
                $connection->exec(
                    'INSERT INTO radio (id, category_id, code_name, stream_url, name, share) VALUES ('
                    .($i+21).','.$radios[$i]['category'].",'".$radios[$i]['codename']."','".$radios[$i]['stream']."','".$radios[$i]['name']."',".$radios[$i]['share'].");"
                );
            }
        }
    }
}
