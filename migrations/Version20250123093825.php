<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250123093825 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE collection ADD name_HU VARCHAR(100)');
        $this->addSql('ALTER TABLE collection ADD name_TR VARCHAR(100)');
        $this->addSql('ALTER TABLE collection ADD name_DK VARCHAR(100)');
        $this->addSql('ALTER TABLE collection ADD name_SE VARCHAR(100)');

        $this->addSql('ALTER TABLE category ADD name_HU VARCHAR(100)');
        $this->addSql('ALTER TABLE category ADD name_TR VARCHAR(100)');
        $this->addSql('ALTER TABLE category ADD name_DK VARCHAR(100)');
        $this->addSql('ALTER TABLE category ADD name_SE VARCHAR(100)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
