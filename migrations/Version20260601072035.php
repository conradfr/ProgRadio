<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260601072035 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add stream_id FK to schedule_entry and backfill from sub_radio.code_name';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE schedule_entry ADD stream_id UUID DEFAULT NULL');
        $this->addSql('ALTER TABLE schedule_entry ADD CONSTRAINT FK_D7785D2CD0ED463E FOREIGN KEY (stream_id) REFERENCES stream (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
//        $this->addSql(<<<'SQL'
//          UPDATE schedule_entry se
//          SET stream_id = s.id
//          FROM sub_radio sr, stream s
//          WHERE se.sub_radio_id = sr.id
//            AND s.sub_radio_id = sr.id
//        SQL);
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE schedule_entry DROP CONSTRAINT FK_D7785D2CD0ED463E');
        $this->addSql('ALTER TABLE schedule_entry DROP stream_id');
    }
}
