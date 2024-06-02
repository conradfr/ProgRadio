<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20210704114550 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE radio ADD website VARCHAR(100) DEFAULT null');
        $this->addSql('ALTER TABLE radio ADD description_fr text DEFAULT null');
        $this->addSql('ALTER TABLE radio ADD description_en text DEFAULT null');
        $this->addSql('ALTER TABLE radio ADD wikipedia_fr VARCHAR(100) DEFAULT null');
        $this->addSql('ALTER TABLE radio ADD wikipedia_en VARCHAR(100) DEFAULT null');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
