<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250427184659 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(<<<'SQL'
            CREATE TABLE radio_stream_update (id SERIAL NOT NULL, radio_stream_id BIGINT NOT NULL, type TEXT NOT NULL, url TEXT NOT NULL, path TEXT NOT NULL, last_successful_run TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, last_failed_run TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE UNIQUE INDEX UNIQ_106BB95BAEBD0D7F ON radio_stream_update (radio_stream_id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE radio_stream_update ADD CONSTRAINT FK_106BB95BAEBD0D7F FOREIGN KEY (radio_stream_id) REFERENCES radio_stream (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
    }

    public function down(Schema $schema): void
    {

    }
}
