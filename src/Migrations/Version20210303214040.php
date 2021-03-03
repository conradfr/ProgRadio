<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20210303214040 extends AbstractMigration
{
    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs

        $this->addSql('CREATE INDEX schedule_entry_start_utc ON schedule_entry (TIMEZONE(\'UTC\', date_time_start))');
        $this->addSql('CREATE INDEX schedule_entry_end_utc ON schedule_entry (TIMEZONE(\'UTC\', date_time_end))');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
