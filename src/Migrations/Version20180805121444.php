<?php declare(strict_types=1);

namespace DoctrineMigrations;


use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20180805121444 extends AbstractMigration implements ContainerAwareInterface
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
                'share'    => 11.9
            ],
            [
                'codename' => 'rtl2',
                'share'    => 4.3

            ],
            [
                'codename' => 'europe1',
                'share'    => 6.5
            ],
            [
                'codename' => 'funradio',
                'share'    => 5.8
            ],
            [
                'codename' => 'franceinter',
                'share'    => 10.7
            ],
            [
                'codename' => 'franceinfo',
                'share'    => 8.0
            ],
            [
                'codename' => 'nrj',
                'share'    => 10.2
            ],
            [
                'codename' => 'skyrock',
                'share'    => 6.8
            ],
            [
                'codename' => 'nostalgie',
                'share'    => 6.1
            ],
            [
                'codename' => 'rireetchansons',
                'share'    => 3.0
            ],
            [
                'codename' => 'rfm',
                'share'    => 4.1
            ],
            [
                'codename' => 'virgin',
                'share'    => 4.5
            ],
            [
                'codename' => 'franceculture',
                'share'    => 2.4
            ],
            [
                'codename' => 'radioclassique',
                'share'    => 1.8
            ],
            [
                'codename' => 'rmc',
                'share'    => 7.8
            ],
            [
                'codename' => 'cherie',
                'share'    => 3.6
            ],
            [
                'codename' => 'mradio',
                'share'    => 1.1
            ],

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
