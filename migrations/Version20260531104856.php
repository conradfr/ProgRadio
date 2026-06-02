<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260531104856 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Drop click24_idx index and clicks_last_24h/votes columns from stream';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE stream DROP clicks_last_24h');
        $this->addSql('ALTER TABLE stream DROP votes');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE stream ADD clicks_last_24h INT DEFAULT 0 NOT NULL');
        $this->addSql('ALTER TABLE stream ADD votes INT DEFAULT 0 NOT NULL');
        $this->addSql('CREATE INDEX click24_idx ON stream (clicks_last_24h)');
    }
}
