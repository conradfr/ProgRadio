<?php declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20190126211909 extends AbstractMigration
{
    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'postgresql', 'Migration can only be executed safely on \'postgresql\'.');

        $this->addSql('CREATE TABLE collection (id INT NOT NULL, code_name VARCHAR(100) NOT NULL, name VARCHAR(100) NOT NULL, priority INT NOT NULL, PRIMARY KEY(id))');
        $this->addSql('ALTER TABLE radio ADD collection_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE radio ADD CONSTRAINT FK_E0461B0F514956FD FOREIGN KEY (collection_id) REFERENCES collection (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_E0461B0F514956FD ON radio (collection_id)');

        $this->addSql('INSERT INTO collection (id, code_name, name, priority) VALUES (1, \'nationwide\', \'Nationales\', 1)');
        $this->addSql('UPDATE radio SET collection_id = 1');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'postgresql', 'Migration can only be executed safely on \'postgresql\'.');

        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE radio DROP CONSTRAINT FK_E0461B0F514956FD');
        $this->addSql('DROP TABLE collection');
        $this->addSql('DROP INDEX IDX_E0461B0F514956FD');
        $this->addSql('ALTER TABLE radio DROP collection_id');
        $this->addSql('ALTER TABLE section_entry ALTER schedule_entry_id SET NOT NULL');
        $this->addSql('ALTER TABLE section_entry ADD CONSTRAINT section_entry_schedule_entry_id_fkey FOREIGN KEY (schedule_entry_id) REFERENCES schedule_entry (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
    }
}
