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
final class Version20200426122842 extends AbstractMigration implements ContainerAwareInterface
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
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'postgresql', 'Migration can only be executed safely on \'postgresql\'.');

        $this->addSql('ALTER TABLE collection ADD short_name VARCHAR(25)');
    }

    public function postUp(Schema $schema): void
    {
        $connection = $this->container->get('doctrine.orm.entity_manager')->getConnection();

        $collections = [
            [
                'codename' => 'nationwide',
                'shortname'=> 'Nationales'
            ],
            [
                'codename' => 'francebleu',
                'shortname'=> 'France Bleu'
            ],
            [
                'codename' => 'lesindes',
                'shortname'=> 'Les Indés'
            ],
            [
                'codename' => 'international',
                'shortname'=> 'International'
            ],
            [
                'codename' => 'favorites',
                'shortname'=> 'Favoris'
            ],
        ];

        for ($i = 0; $i < count($collections); $i++) {
            $connection->exec(
                "UPDATE collection SET short_name = '".$collections[$i]['shortname']."' WHERE code_name = '".$collections[$i]['codename']."';"
            );
        }
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
