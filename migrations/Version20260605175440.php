<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260605175440 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('drop index idx_d3485d2c5b94add2;');
        $this->addSql('drop index starttime_idx;');
        $this->addSql('drop index endtime_idx;');
        $this->addSql('drop index listening_session_start_utc ;');
        $this->addSql('CREATE INDEX idx_schedule_entry_stream_date ON schedule_entry (stream_id, date_time_start);');
        $this->addSql('CREATE INDEX stream_radio_id_idx ON stream (radio_id) WHERE enabled = true;');
        $this->addSql('CREATE INDEX stream_radio_stream_code_name_idx ON stream (radio_stream_code_name) WHERE is_sub_radio = true;');
        $this->addSql('CREATE INDEX stream_stream_url_hash_idx ON stream USING hash (stream_url);');
        $this->addSql('CREATE INDEX stream_active_score_idx ON stream (score DESC) WHERE enabled = true AND banned = false AND redirect_to IS NULL;');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
