<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20261024090000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Trigram index on stream genres: the search ILIKE on name OR tags OR genres needs one on each column to avoid a seq scan';
    }

    // CREATE INDEX CONCURRENTLY can't run inside a transaction
    public function isTransactional(): bool
    {
        return false;
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS stream_genres_trgm_idx ON stream USING gin (genres gin_trgm_ops);');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP INDEX CONCURRENTLY IF EXISTS stream_genres_trgm_idx;');
    }
}
