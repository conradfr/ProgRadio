<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260327092537 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE stream ADD own_logo BOOLEAN DEFAULT FALSE');
        $this->addSql('ALTER TABLE stream ADD is_main_radio BOOLEAN DEFAULT FALSE');
        $this->addSql('ALTER TABLE stream ADD radio_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE stream ADD is_sub_radio BOOLEAN DEFAULT FALSE');
        $this->addSql('ALTER TABLE stream ADD sub_radio_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE stream ADD radio_stream_code_name VARCHAR(100) DEFAULT NULL');

        $this->addSql('ALTER TABLE stream ADD CONSTRAINT stream_radio_id_ref FOREIGN KEY (radio_id) REFERENCES radio (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
