<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260704081440 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Delete collection 2 and all associated radios, radio_streams, streams, schedule_entries, api_key_radios and api_user_radios';
    }

    public function up(Schema $schema): void
    {
        // Children first to respect the radio_id / stream_id / radio_stream_id foreign keys.

        // schedule_entry references both radio and stream
        $this->addSql('
            DELETE FROM schedule_entry
            WHERE radio_id IN (SELECT id FROM radio WHERE collection_id = 2)
               OR stream_id IN (
                   SELECT id FROM stream
                   WHERE radio_id IN (SELECT id FROM radio WHERE collection_id = 2)
                      OR radio_stream_id IN (SELECT id FROM radio_stream WHERE radio_id IN (SELECT id FROM radio WHERE collection_id = 2))
               )
        ');

        // stream references radio and radio_stream
        $this->addSql('
            DELETE FROM stream
            WHERE radio_id IN (SELECT id FROM radio WHERE collection_id = 2)
               OR radio_stream_id IN (SELECT id FROM radio_stream WHERE radio_id IN (SELECT id FROM radio WHERE collection_id = 2))
        ');

        // listening_session references radio_stream (NO ACTION), so clear it before radio_stream
        $this->addSql('DELETE FROM listening_session WHERE radio_stream_id IN (SELECT id FROM radio_stream WHERE radio_id IN (SELECT id FROM radio WHERE collection_id = 2))');

        // radio_stream references radio
        $this->addSql('DELETE FROM radio_stream WHERE radio_id IN (SELECT id FROM radio WHERE collection_id = 2)');

        // join tables referencing radio
        $this->addSql('DELETE FROM api_key_radio WHERE radio_id IN (SELECT id FROM radio WHERE collection_id = 2)');
        $this->addSql('DELETE FROM api_user_radio WHERE radio_id IN (SELECT id FROM radio WHERE collection_id = 2)');

        // users_radios references radio (NO ACTION), so clear it before radio
        $this->addSql('DELETE FROM users_radios WHERE radio_id IN (SELECT id FROM radio WHERE collection_id = 2)');

        // radios of the collection, then the collection itself
        $this->addSql('DELETE FROM radio WHERE collection_id = 2');
        $this->addSql('DELETE FROM collection WHERE id = 2');
    }

    public function down(Schema $schema): void
    {
        $this->throwIrreversibleMigration('This data deletion cannot be reverted.');
    }
}
