<?php declare(strict_types = 1);

namespace DoctrineMigrations;

use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

use AppBundle\Entity\Radio;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20171116104408 extends AbstractMigration implements ContainerAwareInterface
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
                'share' => 12.8
            ],
            [
                'codename' => 'rtl2',
                'share' => 3.0

            ],
            [
                'codename' => 'europe1',
                'share' => 5.6
            ],
            [
                'codename' => 'funradio',
                'share' => 3.7

            ],
            [
                'codename' => 'franceinter',
                'share' =>  10.1
            ],
            [
                'codename' => 'franceinfo',
                'share' => 3.8
            ],
            [
                'codename' => 'nrj',
                'share' => 6.2
            ],
            [
                'codename' => 'skyrock',
                'share' => 3.2
            ],
            [
                'codename' => 'nostalgie',
                'share' => 4.1
            ],
            [
                'codename' => 'rireetchansons',
                'share' => 1.2
            ],
            [
                'codename' => 'rfm',
                'share' => 3.3
            ],
            [
                'codename' => 'virgin',
                'share' => 2.7
            ],
            [
                'codename' => 'franceculture',
                'share' => 1.7
            ],
            [
                'codename' => 'radioclassique',
                'share' => 1.5
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
