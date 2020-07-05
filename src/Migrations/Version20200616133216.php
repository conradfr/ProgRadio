<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20200616133216 extends AbstractMigration
{
    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE stream (id UUID NOT NULL, name TEXT NOT NULL, img TEXT DEFAULT NULL, country_code VARCHAR(2) DEFAULT NULL, language VARCHAR(255) DEFAULT NULL, stream_url TEXT NOT NULL, votes BIGINT NOT NULL DEFAULT 0, clicks_last_24h BIGINT NOT NULL DEFAULT 0, PRIMARY KEY(id))');

        $this->addSql('CREATE INDEX language_idx ON stream (language)');
        $this->addSql('CREATE INDEX countrycode_idx ON stream (country_code)');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
