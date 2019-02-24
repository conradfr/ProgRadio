<?php declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20190216183604 extends AbstractMigration implements ContainerAwareInterface
{
    private $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'postgresql', 'Migration can only be executed safely on \'postgresql\'.');

        $this->addSql('ALTER TABLE collection ADD sort_field VARCHAR(25)');
        $this->addSql('ALTER TABLE collection ADD sort_order VARCHAR(5)');
        $this->addSql('ALTER INDEX idx_575944535b94add2 RENAME TO IDX_D7785D2C5B94ADD2');
        $this->addSql('ALTER INDEX idx_secschedid RENAME TO IDX_BC76FA146DDA074');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'postgresql', 'Migration can only be executed safely on \'postgresql\'.');

        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER INDEX idx_d7785d2c5b94add2 RENAME TO idx_575944535b94add2');
        $this->addSql('ALTER INDEX idx_bc76fa146dda074 RENAME TO idx_secschedid');
        $this->addSql('ALTER TABLE collection DROP sort');
    }

    public function postUp(Schema $schema)
    {
        $connection = $this->container->get('doctrine.orm.entity_manager')->getConnection();

        $connection->exec(
            "UPDATE collection SET sort_field = 'share', sort_order = 'desc' WHERE id = 1;"
        );
    }
}
