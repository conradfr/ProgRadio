<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20261029161243 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Rename name_dk to name_da and name_se to name_sv in collection and category (locale codes, not country codes)';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE collection RENAME COLUMN name_dk TO name_da');
        $this->addSql('ALTER TABLE collection RENAME COLUMN name_se TO name_sv');

        $this->addSql('ALTER TABLE category RENAME COLUMN name_dk TO name_da');
        $this->addSql('ALTER TABLE category RENAME COLUMN name_se TO name_sv');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE collection RENAME COLUMN name_da TO name_dk');
        $this->addSql('ALTER TABLE collection RENAME COLUMN name_sv TO name_se');

        $this->addSql('ALTER TABLE category RENAME COLUMN name_da TO name_dk');
        $this->addSql('ALTER TABLE category RENAME COLUMN name_sv TO name_se');
    }
}
