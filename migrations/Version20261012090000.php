<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20261012090000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'listening_session: composite index (stream_id, date_time_start) replacing stream_idx';
    }

    // CREATE/DROP INDEX CONCURRENTLY can not run inside a transaction
    public function isTransactional(): bool
    {
        return false;
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS listening_session_stream_start_idx ON listening_session (stream_id, date_time_start)');
//        $this->addSql('DROP INDEX CONCURRENTLY IF EXISTS stream_idx');
    }

    public function down(Schema $schema): void
    {
//        $this->addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS stream_idx ON listening_session (stream_id)');
        $this->addSql('DROP INDEX CONCURRENTLY IF EXISTS listening_session_stream_start_idx');
    }
}
