<?php declare(strict_types = 1);

namespace DoctrineMigrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20180131153525  extends AbstractMigration implements ContainerAwareInterface
{
    private $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs

    }

    public function postUp(Schema $schema): void
    {
        $connection = $this->container->get('doctrine.orm.entity_manager')->getConnection();

        $connection->exec(
            "INSERT INTO schedule_entry_new (radio_id, date_time_start, date_time_end, title, host, description, picture_url) SELECT radio_id, date_time_start, date_time_end, title, host, description, picture_url FROM schedule_entry"
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
