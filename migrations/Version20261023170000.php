<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20261023170000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Replace the partial stream radio_id index (unusable without enabled = true literal, e.g. lazy loading or generic plans) by a composite one';
    }

    // CREATE INDEX CONCURRENTLY can't run inside a transaction
    public function isTransactional(): bool
    {
        return false;
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS stream_radio_id_main_enabled_idx ON stream (radio_id, is_main_radio, enabled);');
        $this->addSql('DROP INDEX CONCURRENTLY IF EXISTS stream_radio_id_idx;');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('CREATE INDEX CONCURRENTLY IF NOT EXISTS stream_radio_id_idx ON stream (radio_id) WHERE enabled = true;');
        $this->addSql('DROP INDEX CONCURRENTLY IF EXISTS stream_radio_id_main_enabled_idx;');
    }
}
