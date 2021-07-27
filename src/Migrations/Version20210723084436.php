<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20210723084436 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(
            'CREATE TABLE api_user (id SERIAL NOT NULL, name VARCHAR(50) NOT NULL, enabled  BOOLEAN DEFAULT \'true\' NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, deleted_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, PRIMARY KEY(id))'
        );

        $this->addSql(
            'CREATE TABLE api_key (id uuid DEFAULT gen_random_uuid(), api_user_id INT NOT NULL, enabled  BOOLEAN DEFAULT \'true\' NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, deleted_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, PRIMARY KEY(id))'
        );

        $this->addSql('ALTER TABLE api_key ADD CONSTRAINT fk_api_key_api_user FOREIGN KEY (api_user_id) REFERENCES api_user (id) NOT DEFERRABLE INITIALLY IMMEDIATE');


        $this->addSql(
            'CREATE TABLE api_key_right (api_key_id uuid NOT NULL, type VARCHAR(25) NOT NULL, read BOOLEAN DEFAULT \'true\' NOT NULL, write BOOLEAN DEFAULT \'false\' NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, deleted_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, PRIMARY KEY(api_key_id, type))'
        );

        $this->addSql(
            'CREATE TABLE api_user_radio (api_user_id INT NOT NULL, radio_id INT DEFAULT NULL, PRIMARY KEY(api_user_id, radio_id))'
        );

        $this->addSql('ALTER TABLE api_user_radio ADD CONSTRAINT fk_api_user_radio_user FOREIGN KEY (api_user_id) REFERENCES api_user (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE api_user_radio ADD CONSTRAINT fk_api_user_radio_radio FOREIGN KEY (radio_id) REFERENCES radio (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
