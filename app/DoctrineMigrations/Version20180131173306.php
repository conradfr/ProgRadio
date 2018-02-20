<?php declare(strict_types = 1);

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20180131173306  extends AbstractMigration implements ContainerAwareInterface
{
    private $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs

    }

    public function postUp(Schema $schema)
    {
        $connection = $this->container->get('doctrine.orm.entity_manager')->getConnection();

        $connection->exec("DROP TABLE schedule_entry;");
        $connection->exec("DROP SEQUENCE schedule_entry_id_seq");
        $connection->exec("ALTER TABLE schedule_entry_new RENAME TO schedule_entry");
        $connection->exec("ALTER SEQUENCE schedule_entry_new_id_seq RENAME TO schedule_entry_id_seq");
        $connection->exec("ALTER INDEX starttime_idx_new RENAME TO starttime_idx");
    }

    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
