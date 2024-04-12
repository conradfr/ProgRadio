<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20240412172117 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs

//        CREATE EXTENSION pg_trgm;
//        ALTER ROLE postgres SET pg_trgm.similarity_threshold = 0.2;

        $this->addSql('CREATE INDEX stream_tags_trgm_idx ON stream USING GIN (tags gin_trgm_ops)');
        $this->addSql('CREATE INDEX stream_name_trgm_idx ON stream USING GIN (name gin_trgm_ops)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
