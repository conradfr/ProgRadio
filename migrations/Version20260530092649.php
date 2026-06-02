<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260530092649 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Move radio_stream_update rows to stream_auto_update using the canonical stream id';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(<<<'SQL'
            INSERT INTO stream_auto_update (stream_id, type, url, path, last_successful_run, last_failed_run)
            SELECT s.id, rsu.type, rsu.url, rsu.path, rsu.last_successful_run, rsu.last_failed_run
            FROM radio_stream_update rsu
            JOIN stream s ON s.radio_stream_id = rsu.radio_stream_id
                          AND s.redirect_to IS NULL
            ON CONFLICT (stream_id) DO NOTHING
        SQL);
    }

    public function down(Schema $schema): void
    {
    }
}
