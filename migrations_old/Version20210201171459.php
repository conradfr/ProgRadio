<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20210201171459 extends AbstractMigration implements ContainerAwareInterface
{
    private $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE listening_session ADD radio_stream_id BIGINT');

        $this->addSql('CREATE INDEX ls_radio_stream_idx ON listening_session (radio_stream_id)');

        $this->addSql('ALTER TABLE listening_session ADD CONSTRAINT FK_BC76FA146DDA074 FOREIGN KEY (radio_stream_id) REFERENCES radio_stream (id) NOT DEFERRABLE INITIALLY IMMEDIATE');

        $this->addSql("UPDATE listening_session SET radio_stream_id = radio_id WHERE radio_id IS NOT NULL;");
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }

    public function postUp(Schema $schema): void
    {

    }
}
