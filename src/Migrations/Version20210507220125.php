<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20210507220125 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE listening_session DROP CONSTRAINT listening_session_pkey');
        $this->addSql('ALTER TABLE listening_session RENAME COLUMN id TO old_id');
        $this->addSql('ALTER TABLE listening_session RENAME COLUMN next_id TO id');
        $this->addSql('ALTER TABLE listening_session ADD PRIMARY KEY (id)');
        $this->addSql('ALTER TABLE listening_session DROP COLUMN old_id');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
