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
final class Version20211221153823 extends AbstractMigration  implements ContainerAwareInterface
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
        $this->addSql('ALTER TABLE collection ADD name_FR VARCHAR(100)');
        $this->addSql('ALTER TABLE collection ADD name_EN VARCHAR(100)');
        $this->addSql('ALTER TABLE collection ADD name_ES VARCHAR(100)');

        $this->addSql('ALTER TABLE category ADD name_FR VARCHAR(100)');
        $this->addSql('ALTER TABLE category ADD name_EN VARCHAR(100)');
        $this->addSql('ALTER TABLE category ADD name_ES VARCHAR(100)');


    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }

    public function postUp(Schema $schema): void
    {
        $connection = $this->container->get('doctrine.orm.entity_manager')->getConnection();

        $connection->exec(
            "UPDATE category SET name_FR = category.name, name_EN = category.name, name_ES = category.name;"
        );

        $connection->exec(
            "UPDATE collection SET name_FR = collection.name, name_EN = collection.name, name_ES = collection.name;"
        );
    }
}
