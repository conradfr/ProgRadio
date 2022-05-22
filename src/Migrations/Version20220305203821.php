<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20220305203821 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(
            'CREATE TABLE api_key_radio (api_key_id uuid NOT NULL, radio_id INT DEFAULT NULL, PRIMARY KEY(api_key_id, radio_id))'
        );

        $this->addSql('ALTER TABLE api_key_radio ADD CONSTRAINT fk_api_key_radio_user FOREIGN KEY (api_key_id) REFERENCES api_key (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE api_key_radio ADD CONSTRAINT fk_api_key_radio_radio FOREIGN KEY (radio_id) REFERENCES radio (id) NOT DEFERRABLE INITIALLY IMMEDIATE');

    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
