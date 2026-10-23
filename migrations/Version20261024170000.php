<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20261024170000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Drop the legacy listening_session.radio_stream_id column (sessions are linked through stream_id only)';
    }

    public function up(Schema $schema): void
    {
        // listening_session is updated constantly: don't queue every heartbeat behind the ACCESS EXCLUSIVE lock
        $this->addSql("SET LOCAL lock_timeout = '5s'");
        // also drops its foreign key to radio_stream and any index on it
        $this->addSql('ALTER TABLE listening_session DROP COLUMN IF EXISTS radio_stream_id');
    }

    public function down(Schema $schema): void
    {
        // the values are not restored
        $this->addSql('ALTER TABLE listening_session ADD radio_stream_id BIGINT DEFAULT NULL');
        $this->addSql('ALTER TABLE listening_session ADD CONSTRAINT fk_bc76fa146dda074 FOREIGN KEY (radio_stream_id) REFERENCES radio_stream (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }
}
