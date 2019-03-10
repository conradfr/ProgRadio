<?php declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20180626192817 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'postgresql', 'Migration can only be executed safely on \'postgresql\'.');

        $this->addSql('CREATE TABLE section_entry (id BIGSERIAL NOT NULL, schedule_entry_id BIGINT NOT NULL REFERENCES schedule_entry ON DELETE CASCADE, date_time_start TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,  title VARCHAR(150) NOT NULL, presenter VARCHAR(100) DEFAULT NULL, description TEXT DEFAULT NULL, picture_url VARCHAR(255) DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_SECSCHEDID ON section_entry (schedule_entry_id)');
        $this->addSql('ALTER TABLE section_entry ADD CONSTRAINT FK_SECSCHED FOREIGN KEY (schedule_entry_id) REFERENCES schedule_entry (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'postgresql', 'Migration can only be executed safely on \'postgresql\'.');

        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE section_entry DROP CONSTRAINT FK_SECSCHED');
        $this->addSql('DROP SEQUENCE section_entry_id_seq CASCADE');
        $this->addSql('DROP TABLE section_entry');
    }
}
