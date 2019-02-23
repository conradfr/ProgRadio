<?php declare(strict_types=1);

namespace DoctrineMigrations;

use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20181202195643 extends AbstractMigration implements ContainerAwareInterface
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
                'share'    => 11.8
            ],
            [
                'codename' => 'rtl2',
                'share'    => 4.3

            ],
            [
                'codename' => 'europe1',
                'share'    => 6.2
            ],
            [
                'codename' => 'funradio',
                'share'    => 5.4
            ],
            [
                'codename' => 'franceinter',
                'share'    => 11.5
            ],
            [
                'codename' => 'franceinfo',
                'share'    => 8.1
            ],
            [
                'codename' => 'nrj',
                'share'    => 9.8
            ],
            [
                'codename' => 'skyrock',
                'share'    => 6.5
            ],
            [
                'codename' => 'nostalgie',
                'share'    => 6.3
            ],
            [
                'codename' => 'rireetchansons',
                'share'    => 3.1
            ],
            [
                'codename' => 'rfm',
                'share'    => 4.1
            ],
            [
                'codename' => 'virgin',
                'share'    => 4.1
            ],
            [
                'codename' => 'franceculture',
                'share'    => 2.8
            ],
            [
                'codename' => 'radioclassique',
                'share'    => 1.9
            ],
            [
                'codename' => 'rmc',
                'share'    => 7.3
            ],
            [
                'codename' => 'cherie',
                'share'    => 3.5
            ],
            [
                'codename' => 'mradio',
                'share'    => 1.3
            ],
            [
                'codename' => 'ouifm',
                'share'    => 0.3
            ]
        ];

        for ($i = 0; $i < count($radios); $i++) {
            for ($i = 0; $i < count($radios); $i++) {
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
