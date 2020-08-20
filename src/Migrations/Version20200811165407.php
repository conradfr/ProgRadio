<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20200811165407 extends AbstractMigration
{
    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'postgresql', 'Migration can only be executed safely on \'postgresql\'.');

        $this->addSql('CREATE SEQUENCE "user_id_seq" INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE user_email_change_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE TABLE "user" (id INT NOT NULL, email VARCHAR(180) NOT NULL, roles JSON NOT NULL, password VARCHAR(255) NOT NULL, password_reset_token VARCHAR(100), password_reset_expiration TIMESTAMP(0) WITHOUT TIME ZONE, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, deleted_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX user_token_idx ON "user" (password_reset_token)');
        $this->addSql('CREATE INDEX user_email_idx ON "user" (email)');
        $this->addSql('CREATE TABLE users_radios (user_id INT NOT NULL, radio_id INT NOT NULL, PRIMARY KEY(user_id, radio_id))');
        $this->addSql('CREATE INDEX IDX_84B61A11A76ED395 ON users_radios (user_id)');
        $this->addSql('CREATE INDEX IDX_84B61A115B94ADD2 ON users_radios (radio_id)');
        $this->addSql('ALTER TABLE users_radios ADD CONSTRAINT FK_84B61A11A76ED395 FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE users_radios ADD CONSTRAINT FK_84B61A115B94ADD2 FOREIGN KEY (radio_id) REFERENCES radio (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE TABLE user_email_change (id INT NOT NULL, user_id INT DEFAULT NULL, email VARCHAR(180) NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, token VARCHAR(100) NOT NULL, token_expiration TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_BD0151D2A76ED395 ON user_email_change (user_id)');
        $this->addSql('ALTER TABLE user_email_change ADD CONSTRAINT FK_BD0151D2A76ED395 FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE collection ALTER sort_field SET NOT NULL');
        $this->addSql('ALTER TABLE collection ALTER sort_order SET NOT NULL');
        $this->addSql('ALTER TABLE collection ALTER short_name SET NOT NULL');
        $this->addSql('ALTER TABLE radio ALTER streaming_enabled SET NOT NULL');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'postgresql', 'Migration can only be executed safely on \'postgresql\'.');

        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE users_radios DROP CONSTRAINT FK_84B61A11A76ED395');
        $this->addSql('DROP SEQUENCE "user_id_seq" CASCADE');
        $this->addSql('CREATE TABLE schema_migrations (version BIGINT NOT NULL, inserted_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, PRIMARY KEY(version))');
        $this->addSql('DROP TABLE "user"');
        $this->addSql('DROP TABLE users_radios');
    }
}
