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
class Version20180118080945 extends AbstractMigration implements ContainerAwareInterface
{
    private $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    /**
     * @param Schema $schema
     */
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs

    }

    public function postUp(Schema $schema): void
    {
        $connection = $this->container->get('doctrine.orm.entity_manager')->getConnection();

        // RADIOS

        $radios = [
            [
                'codename' => 'rtl',
                'share' => 13.1
            ],
            [
                'codename' => 'rtl2',
                'share' => 2.7

            ],
            [
                'codename' => 'europe1',
                'share' => 5.1
            ],
            [
                'codename' => 'funradio',
                'share' => 3.6

            ],
            [
                'codename' => 'franceinter',
                'share' =>  11.1
            ],
            [
                'codename' => 'franceinfo',
                'share' => 4.0
            ],
            [
                'codename' => 'nrj',
                'share' => 6.4
            ],
            [
                'codename' => 'skyrock',
                'share' => 3.9
            ],
            [
                'codename' => 'nostalgie',
                'share' => 4.1
            ],
            [
                'codename' => 'rireetchansons',
                'share' => 1.3
            ],
            [
                'codename' => 'rfm',
                'share' => 3.3
            ],
            [
                'codename' => 'virgin',
                'share' => 2.6
            ],
            [
                'codename' => 'franceculture',
                'share' => 1.7
            ],
            [
                'codename' => 'radioclassique',
                'share' => 1.7
            ],
            [
                'codename' => 'rmc',
                'share' => 6.2
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
    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
