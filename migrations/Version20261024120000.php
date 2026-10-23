<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20261024120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Drop unused indexes (no scans in production) and indexes redundant with a composite or primary key';
    }

    // DROP/CREATE INDEX CONCURRENTLY can't run inside a transaction
    public function isTransactional(): bool
    {
        return false;
    }

    public function up(Schema $schema): void
    {
        // unused
        $this->addSql('DROP INDEX CONCURRENTLY IF EXISTS stream_fulltext_name_tags_idx;');
        $this->addSql('DROP INDEX CONCURRENTLY IF EXISTS stream_genres_idx;');
        $this->addSql('DROP INDEX CONCURRENTLY IF EXISTS language_idx;');
        $this->addSql('DROP INDEX CONCURRENTLY IF EXISTS idx_ur_last_listened_at;');

        // covered by listening_session_stream_start_idx (stream_id, date_time_start)
        $this->addSql('DROP INDEX CONCURRENTLY IF EXISTS stream_idx;');

        // covered by the (user_id, ...) primary keys
        $this->addSql('DROP INDEX CONCURRENTLY IF EXISTS idx_84b61a11a76ed395;');
        $this->addSql('DROP INDEX CONCURRENTLY IF EXISTS idx_ur_user;');
    }

    public function down(Schema $schema): void
    {
        $this->addSql("CREATE INDEX CONCURRENTLY IF NOT EXISTS stream_fulltext_name_tags_idx ON stream USING gin (to_tsvector('progradio_unaccent'::regconfig, ((name || ' '::text) || tags)));");
        $this->addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS stream_genres_idx ON stream (lower(genres));');
        $this->addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS language_idx ON stream (language);');
        $this->addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ur_last_listened_at ON users_streams_history (last_listened_at);');
        $this->addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS stream_idx ON listening_session (stream_id);');
        $this->addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_84b61a11a76ed395 ON users_radios (user_id);');
        $this->addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ur_user ON users_streams (user_id);');
    }
}
