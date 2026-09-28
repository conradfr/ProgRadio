<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260928090000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add user_song.stream_id foreign key, emptied (not deleted) when the stream is deleted. Drop unused user_song.radio_stream_id.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE INDEX IDX_496CA268D0ED463E ON user_song (stream_id)');
        $this->addSql('ALTER TABLE user_song ADD CONSTRAINT FK_496CA268D0ED463E FOREIGN KEY (stream_id) REFERENCES stream (id) ON DELETE SET NULL NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE user_song DROP radio_stream_id');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE user_song ADD radio_stream_id BIGINT DEFAULT NULL');
        $this->addSql('ALTER TABLE user_song DROP CONSTRAINT FK_496CA268D0ED463E');
        $this->addSql('DROP INDEX IDX_496CA268D0ED463E');
    }
}
