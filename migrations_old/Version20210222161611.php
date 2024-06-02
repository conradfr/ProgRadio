<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20210222161611 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE radio_stream ADD current_song BOOLEAN DEFAULT \'false\' NOT NULL');
        $this->addSql("UPDATE radio_stream SET current_song = true WHERE code_name = 'fip_main'");

        $this->addSql('ALTER TABLE listening_session DROP CONSTRAINT FK_E0EE8CB8D0ED463E');
        $this->addSql('ALTER TABLE listening_session ADD CONSTRAINT FK_E0EE8CB8D0ED463E FOREIGN KEY (stream_id) REFERENCES "stream" (id) ON DELETE CASCADE ');

    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
