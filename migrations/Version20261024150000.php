<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20261024150000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'BRIN index on listening_session date_time_start for the admin stats date ranges (tiny and near free to maintain on the heartbeat updates)';
    }

    // CREATE INDEX CONCURRENTLY can't run inside a transaction
    public function isTransactional(): bool
    {
        return false;
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS listening_session_start_brin_idx ON listening_session USING brin (date_time_start);');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP INDEX CONCURRENTLY IF EXISTS listening_session_start_brin_idx;');
    }
}
