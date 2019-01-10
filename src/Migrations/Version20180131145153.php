<?php declare(strict_types = 1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20180131145153 extends AbstractMigration
{
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'postgresql', 'Migration can only be executed safely on \'postgresql\'.');

        $this->addSql('CREATE TABLE schedule_entry_new (id BIGSERIAL NOT NULL, radio_id INT DEFAULT NULL, date_time_start TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, date_time_end TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, title VARCHAR(150) NOT NULL, host VARCHAR(100) DEFAULT NULL, description TEXT DEFAULT NULL, picture_url VARCHAR(255) DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_575944535B94ADD2 ON schedule_entry_new (radio_id)');
        $this->addSql('CREATE INDEX starttime_idx_new ON schedule_entry_new (date_time_start)');
        $this->addSql('ALTER TABLE schedule_entry_new ADD CONSTRAINT FK_575944535B94ADD2 FOREIGN KEY (radio_id) REFERENCES radio (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'postgresql', 'Migration can only be executed safely on \'postgresql\'.');

        $this->addSql('CREATE SCHEMA public');
        $this->addSql('DROP TABLE schedule_entry_new');
    }
}
