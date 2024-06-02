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
final class Version20231012220159 extends AbstractMigration implements ContainerAwareInterface
{
    private $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }


    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs

    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }

    public function postUp(Schema $schema): void
    {
/*        $connection = $this->container->get('doctrine.orm.entity_manager')->getConnection();

        $connection->exec('CREATE EXTENSION IF NOT EXISTS "unaccent";');

        $connection->exec('CREATE TEXT SEARCH CONFIGURATION progradio_unaccent ( COPY = english );');

        $connection->exec("ALTER TEXT SEARCH CONFIGURATION progradio_unaccent" . PHP_EOL
        . "ALTER MAPPING FOR hword, hword_part, word" . PHP_EOL
        . "WITH unaccent;");

        $connection->exec("CREATE INDEX stream_fulltext_name_tags_idx ON stream USING GIN (to_tsvector('progradio_unaccent', name || ' ' || tags));");*/
    }
}
