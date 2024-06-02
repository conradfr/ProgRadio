<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20200916211637 extends AbstractMigration
{
    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE users_streams (user_id INT NOT NULL, stream_id UUID NOT NULL, PRIMARY KEY(user_id, stream_id))');
        $this->addSql('CREATE INDEX IDX_ur_user ON users_streams (user_id)');
        $this->addSql('CREATE INDEX IDX_ur_stream ON users_streams (stream_id)');
        $this->addSql('ALTER TABLE users_streams ADD CONSTRAINT FK_84B61A11A76ED399 FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE users_streams ADD CONSTRAINT FK_84B61A115B94ADD3 FOREIGN KEY (stream_id) REFERENCES stream (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
    }
}
