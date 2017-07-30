<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20170730113937 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'postgresql', 'Migration can only be executed safely on \'postgresql\'.');

        $this->addSql('CREATE TABLE category (id INT NOT NULL, code_name VARCHAR(100) NOT NULL, name VARCHAR(100) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE TABLE radio (id INT NOT NULL, category_id INT DEFAULT NULL, code_name VARCHAR(100) NOT NULL, name VARCHAR(100) NOT NULL, timezone VARCHAR(50) DEFAULT \'Europe/Paris\' NOT NULL, active BOOLEAN DEFAULT \'true\' NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_E0461B0F12469DE2 ON radio (category_id)');
        $this->addSql('CREATE TABLE schedule_entry (id INT NOT NULL, radio_id INT DEFAULT NULL, date_time_start TIMESTAMP(0) WITH TIME ZONE NOT NULL, date_time_end TIMESTAMP(0) WITH TIME ZONE NOT NULL, title VARCHAR(150) NOT NULL, host VARCHAR(100) DEFAULT NULL, description VARCHAR(255) DEFAULT NULL, picture_url VARCHAR(255) DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_D7785D2C5B94ADD2 ON schedule_entry (radio_id)');
        $this->addSql('CREATE INDEX starttime_idx ON schedule_entry (date_time_start)');
        $this->addSql('ALTER TABLE radio ADD CONSTRAINT FK_E0461B0F12469DE2 FOREIGN KEY (category_id) REFERENCES category (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE schedule_entry ADD CONSTRAINT FK_D7785D2C5B94ADD2 FOREIGN KEY (radio_id) REFERENCES radio (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'postgresql', 'Migration can only be executed safely on \'postgresql\'.');

        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE radio DROP CONSTRAINT FK_E0461B0F12469DE2');
        $this->addSql('ALTER TABLE schedule_entry DROP CONSTRAINT FK_D7785D2C5B94ADD2');
        $this->addSql('DROP TABLE category');
        $this->addSql('DROP TABLE radio');
        $this->addSql('DROP TABLE schedule_entry');
    }
}
