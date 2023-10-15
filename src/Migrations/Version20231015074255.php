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
final class Version20231015074255 extends AbstractMigration implements ContainerAwareInterface
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
        $this->addSql('ALTER TABLE stream_overloading ADD tags text DEFAULT NULL');
        $this->addSql('ALTER TABLE stream ADD original_tags text DEFAULT NULL');

        $this->addSql('ALTER TABLE stream ADD import_updated_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL');
        $this->addSql('ALTER TABLE stream ADD last_listening_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL');

        $this->addSql('CREATE INDEX stream_last_listen_idx ON stream (last_listening_at)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }

    public function postUp(Schema $schema): void
    {
        // just here as documentation
        // will be executed outside of migration to avoid downtime

        /*        $connection = $this->container->get('doctrine.orm.entity_manager')->getConnection();

        $connection->exec(
"
WITH subquery AS (
    SELECT stream_id, MAX(date_time_start) as last_date_time
    FROM listening_session ls
    WHERE stream_id is not null
    GROUP BY ls.stream_id
)
UPDATE stream
SET last_listening_at = subquery.last_date_time
FROM subquery
WHERE stream.id = subquery.stream_id;
"
        );*/
    }
}
