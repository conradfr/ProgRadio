<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20231126123629 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE affiliate ADD text_FR VARCHAR(255)');
        $this->addSql('ALTER TABLE affiliate ADD text_EN VARCHAR(255)');
        $this->addSql('ALTER TABLE affiliate ADD text_ES VARCHAR(255)');
        $this->addSql('ALTER TABLE affiliate ADD text_DE VARCHAR(255)');
        $this->addSql('ALTER TABLE affiliate ADD base64img TEXT');
        $this->addSql('ALTER TABLE affiliate DROP locale');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
