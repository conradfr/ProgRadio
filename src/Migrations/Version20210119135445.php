<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20210119135445 extends AbstractMigration
{
    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs

        $this->addSql('ALTER TABLE listening_session ADD source VARCHAR(30) DEFAULT NULL');
        $this->addSql('ALTER TABLE listening_session ADD ip_address BYTEA DEFAULT NULL');

        $this->addSql('COMMENT ON COLUMN listening_session.ip_address IS \'(DC2Type:ip)\'');
        $this->addSql('COMMENT ON COLUMN listening_session.stream_id IS \'(DC2Type:uuid)\'');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
