<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20210112155057 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(
            'CREATE TABLE listening_session (id BIGSERIAL NOT NULL, radio_id INT DEFAULT NULL, stream_id uuid DEFAULT NULL, date_time_start  TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, date_time_end  TIMESTAMP(0) WITHOUT TIME ZONE, PRIMARY KEY(id))'
        );

        $this->addSql('CREATE INDEX radio_idx ON listening_session (radio_id)');
        $this->addSql('CREATE INDEX stream_idx ON listening_session (stream_id)');
        $this->addSql('CREATE INDEX date_time_start_idx ON listening_session (date_time_start)');

        $this->addSql('ALTER TABLE listening_session ADD CONSTRAINT FK_E0EE8CB85B94ADD2 FOREIGN KEY (radio_id) REFERENCES radio (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE listening_session ADD CONSTRAINT FK_E0EE8CB8D0ED463E FOREIGN KEY (stream_id) REFERENCES "stream" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
    }
}
