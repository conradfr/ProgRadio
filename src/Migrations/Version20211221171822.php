<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20211221171822 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE affiliate (id INT NOT NULL, locale VARCHAR(2) NOT NULL, html_link text NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE SEQUENCE affiliate_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE INDEX affiliate_locale_idx ON affiliate (locale)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
