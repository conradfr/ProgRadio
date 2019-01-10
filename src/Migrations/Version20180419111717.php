<?php declare(strict_types = 1);

namespace DoctrineMigrations;

use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20180419111717 extends AbstractMigration implements ContainerAwareInterface
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

        // RADIOS

        $radios = [
            [
                'codename' => 'rtl',
                'share' => 13.2
            ],
            [
                'codename' => 'rtl2',
                'share' => 2.9

            ],
            [
                'codename' => 'europe1',
                'share' => 5.3
            ],
            [
                'codename' => 'funradio',
                'share' => 3.7

            ],
            [
                'codename' => 'franceinter',
                'share' =>  11.5
            ],
            [
                'codename' => 'franceinfo',
                'share' => 3.6
            ],
            [
                'codename' => 'nrj',
                'share' => 5.5
            ],
            [
                'codename' => 'skyrock',
                'share' => 3.3
            ],
            [
                'codename' => 'nostalgie',
                'share' => 4.8
            ],
            [
                'codename' => 'rireetchansons',
                'share' => 1.4
            ],
            [
                'codename' => 'rfm',
                'share' => 2.7
            ],
            [
                'codename' => 'virgin',
                'share' => 2.6
            ],
            [
                'codename' => 'franceculture',
                'share' => 1.6
            ],
            [
                'codename' => 'radioclassique',
                'share' => 1.7
            ],
            [
                'codename' => 'rmc',
                'share' => 6.5
            ],
            [
                'codename' => 'cherie',
                'share' => 2.2
            ]
        ];

        for ($i=0;$i<count($radios);$i++) {
            for ($i=0;$i<count($radios);$i++) {
                $connection->exec(
                    "UPDATE radio SET share = ".$radios[$i]['share']." WHERE code_name = '".$radios[$i]['codename']."';"
                );
            }
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
