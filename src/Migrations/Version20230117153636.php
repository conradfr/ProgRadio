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
final class Version20230117153636 extends AbstractMigration implements ContainerAwareInterface
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
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'postgresql', 'Migration can only be executed safely on \'postgresql\'.');

        $this->addSql('CREATE TABLE sub_radio (id INT NOT NULL, code_name VARCHAR(100) NOT NULL, name VARCHAR(100) NOT NULL, enabled BOOLEAN DEFAULT \'true\' NOT NULL, main BOOLEAN DEFAULT \'false\' NOT NULL, radio_id INT DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_D8885D2C5B94ADD2 ON sub_radio (radio_id)');
        $this->addSql('CREATE INDEX sub_radio_code_name_idx ON sub_radio (code_name)');

        $this->addSql('ALTER TABLE radio_stream ADD sub_radio_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE schedule_entry ADD sub_radio_id INT DEFAULT NULL');

        $this->addSql('CREATE INDEX IDX_D9985D2C5B94ADD2 ON radio_stream (sub_radio_id)');
        $this->addSql('CREATE INDEX IDX_D3485D2C5B94ADD2 ON schedule_entry (sub_radio_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }

    public function postUp(Schema $schema): void
    {
        $connection = $this->container->get('doctrine.orm.entity_manager')->getConnection();

        $connection->exec(
            "INSERT INTO sub_radio (id, code_name, name, main, enabled, radio_id)
                SELECT id, code_name, name, true, active as enabled, id as radio_id 
                FROM radio
                ORDER BY id asc;"
        );

        $connection->exec(
            "UPDATE schedule_entry SET sub_radio_id = radio_id;"
        );
    }

}
