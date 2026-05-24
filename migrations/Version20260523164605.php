<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260523164605 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE stream_auto_update (id SERIAL NOT NULL, stream_id UUID NOT NULL, type TEXT NOT NULL, url TEXT NOT NULL, path TEXT NULL, last_successful_run TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, last_failed_run TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE UNIQUE INDEX UNIQ_106BB95BAEBD0D8F ON stream_auto_update (stream_id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE stream_auto_update ADD CONSTRAINT FK_106BB95BAEBD0D8F FOREIGN KEY (stream_id) REFERENCES stream (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
