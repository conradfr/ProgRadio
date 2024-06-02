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
final class Version20231014100237 extends AbstractMigration implements ContainerAwareInterface
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

        $this->addSql(
            'INSERT INTO collection (id, code_name, name, priority, sort_field, sort_order, short_name, name_fr, name_en, name_es, name_de, name_pt) VALUES (10, \'switzerland\', \'Suisse\', 8, \'share\', \'desc\', \'Suisse\', \'Suisse\', \'Switzerland\', \'Suizo\', \'Schweizerisch\', \'Suíço\')'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }

    public function postUp(Schema $schema): void
    {
        $connection = $this->container->get('doctrine.orm.entity_manager')->getConnection();

        $connection->exec(
            "UPDATE collection SET priority = 9 WHERE id = 4"
        );

        $connection->exec(
            "UPDATE radio SET collection_id = 10 WHERE id in (78, 79, 80, 81)"
        );
    }
}
