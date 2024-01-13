<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20240113110915 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs

        $this->addSql('CREATE TABLE users_streams_history (user_id INT NOT NULL, stream_id UUID NOT NULL, last_listened_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, PRIMARY KEY(user_id, stream_id))');
        $this->addSql('CREATE INDEX IDX_ur_last_listened_at ON users_streams_history (last_listened_at)');
        $this->addSql('ALTER TABLE users_streams_history ADD CONSTRAINT FK_84B61A11A76ED466 FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE users_streams_history ADD CONSTRAINT FK_84B61A115B94AD66 FOREIGN KEY (stream_id) REFERENCES stream (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');

        $this->addSql('ALTER TABLE "user" ADD store_history BOOLEAN DEFAULT true');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
