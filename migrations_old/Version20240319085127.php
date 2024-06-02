<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20240319085127 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE stream ADD source VARCHAR(25) DEFAULT \'radio-browser\'');
        $this->addSql('ALTER TABLE stream ADD banned boolean DEFAULT false');
        $this->addSql('ALTER TABLE stream ADD user_id INT DEFAULT NULL');

        $this->addSql('ALTER TABLE stream ADD CONSTRAINT FK_84B61A11A76ED664 FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE SET NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
