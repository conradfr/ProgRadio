<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260530071025 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Set redirect_to on streams with radio_stream_id but no code_name; update users_streams to target redirect destinations';
    }

    public function up(Schema $schema): void
    {
        // For each stream that has a radio_stream_id but no code_name, point redirect_to at the
        // canonical stream sharing the same radio_stream_id that does have a code_name.
        $this->addSql(<<<'SQL'
            UPDATE stream s1
            SET redirect_to = (
                SELECT s2.id
                FROM stream s2
                WHERE s2.radio_stream_id = s1.radio_stream_id
                  AND s2.radio_stream_code_name IS NOT NULL
                LIMIT 1
            )
            WHERE s1.radio_stream_id IS NOT NULL
              AND s1.radio_stream_code_name IS NULL
        SQL);

        // Repoint any users_streams row whose stream is itself a redirect (redirect_to IS NOT NULL
        // and radio_stream_id IS NOT NULL) to the canonical target stream.
        // Insert one canonical (user_id, redirect_to) row per unique pair that doesn't already exist.
        // DISTINCT handles the case where multiple stream_ids for the same user share the same redirect_to.
        $this->addSql(<<<'SQL'
            INSERT INTO users_streams (user_id, stream_id)
            SELECT DISTINCT us.user_id, s.redirect_to
            FROM users_streams us
            JOIN stream s ON us.stream_id = s.id
            WHERE s.redirect_to IS NOT NULL
              AND s.radio_stream_id IS NOT NULL
              AND NOT EXISTS (
                  SELECT 1 FROM users_streams us2
                  WHERE us2.user_id = us.user_id
                    AND us2.stream_id = s.redirect_to
              )
        SQL);

        // Remove all rows that pointed to redirect streams — now superseded by the canonical rows above.
        $this->addSql(<<<'SQL'
            DELETE FROM users_streams us
            USING stream s
            WHERE us.stream_id = s.id
              AND s.redirect_to IS NOT NULL
              AND s.radio_stream_id IS NOT NULL
        SQL);
    }

    public function down(Schema $schema): void
    {
    }
}
