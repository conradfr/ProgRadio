<?php declare(strict_types = 1);

namespace DoctrineMigrations;

use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20180421200840 extends AbstractMigration implements ContainerAwareInterface
{
    private $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs

    }

    public function postUp(Schema $schema)
    {
        $connection = $this->container->get('doctrine.orm.entity_manager')->getConnection();

        // CAT

        $categories = [
            [
                'codename' => 'news_talk',
                'name' => 'Généralistes'
            ],
            [
                'codename' => 'music',
                'name' => 'Musicales'
            ]
        ];

        for ($i=0;$i<count($categories);$i++) {
            $connection->exec(
                "UPDATE category SET name = '".$categories[$i]['name']."' WHERE code_name = '".$categories[$i]['codename']."';"
            );
        }
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
