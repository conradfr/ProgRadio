<?php

namespace Application\Migrations;

use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

use AppBundle\Entity\Radio;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20170801213834 extends AbstractMigration implements ContainerAwareInterface
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
                'share' => 12.3
            ],
            [
                'codename' => 'rtl2',
                'share' => 2.5

            ],
            [
                'codename' => 'europe1',
                'share' => 6.1
            ],
            [
                'codename' => 'funradio',
                'share' => 4.1

            ],
            [
                'codename' => 'franceinter',
                'share' =>  10.6
            ],
            [
                'codename' => 'franceinfo',
                'share' => 4.2
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
