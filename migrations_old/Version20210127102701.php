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
final class Version20210127102701  extends AbstractMigration implements ContainerAwareInterface
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

    public function up(Schema $schema) : void
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'postgresql', 'Migration can only be executed safely on \'postgresql\'.');

        // this up() migration is auto-generated, please modify it to your needs
        //$this->addSql('CREATE SEQUENCE radio_stream_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE TABLE radio_stream (id BIGSERIAL NOT NULL, radio_id INT DEFAULT NULL, code_name VARCHAR(100) NOT NULL, name VARCHAR(100) NOT NULL, url VARCHAR(255) NOT NULL, main BOOLEAN DEFAULT \'false\' NOT NULL, enabled BOOLEAN DEFAULT \'true\' NOT NULL, status BOOLEAN DEFAULT \'true\' NOT NULL, retries INT DEFAULT 0 NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_974F37FF5B94ADD2 ON radio_stream (radio_id)');
        $this->addSql('CREATE INDEX radio_stream_code_name_idx ON radio_stream (code_name)');
        $this->addSql('ALTER TABLE radio_stream ADD CONSTRAINT FK_974F37FF5B94ADD2 FOREIGN KEY (radio_id) REFERENCES radio (id) NOT DEFERRABLE INITIALLY IMMEDIATE');

    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }

    public function postUp(Schema $schema): void
    {
        $connection = $this->container->get('doctrine.orm.entity_manager')->getConnection();

        $connection->exec(
            "INSERT INTO radio_stream (radio_id, code_name, name, url, main, enabled, status, retries)
SELECT id as radio_id, CONCAT(code_name, '_main') as code_name, name, streaming_url as url, true, streaming_enabled as enabled, streaming_status as status, streaming_retries as retries
       FROM radio
        ORDER BY id asc;"
        );
    }
}
