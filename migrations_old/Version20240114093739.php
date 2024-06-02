<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20240114093739 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE stream_overloading ADD force_hls boolean DEFAULT false');
        $this->addSql('ALTER TABLE stream_overloading ADD force_mpd boolean DEFAULT false');
        $this->addSql('ALTER TABLE stream ADD force_hls boolean DEFAULT false');
        $this->addSql('ALTER TABLE stream ADD force_mpd boolean DEFAULT false');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
