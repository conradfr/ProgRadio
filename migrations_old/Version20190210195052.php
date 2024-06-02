<?php declare(strict_types=1);

namespace DoctrineMigrations;

use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20190210195052 extends AbstractMigration implements ContainerAwareInterface
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
                'share'    => 12
            ],
            [
                'codename' => 'rtl2',
                'share'    => 4.2

            ],
            [
                'codename' => 'europe1',
                'share'    => 6.0
            ],
            [
                'codename' => 'funradio',
                'share'    => 5.1
            ],
            [
                'codename' => 'franceinter',
                'share'    => 11.9
            ],
            [
                'codename' => 'franceinfo',
                'share'    => 9.0
            ],
            [
                'codename' => 'nrj',
                'share'    => 9.5
            ],
            [
                'codename' => 'skyrock',
                'share'    => 6.3
            ],
            [
                'codename' => 'nostalgie',
                'share'    => 5.6
            ],
            [
                'codename' => 'rireetchansons',
                'share'    => 2.9
            ],
            [
                'codename' => 'rfm',
                'share'    => 3.7
            ],
            [
                'codename' => 'virgin',
                'share'    => 4.4
            ],
            [
                'codename' => 'franceculture',
                'share'    => 2.5
            ],
            [
                'codename' => 'radioclassique',
                'share'    => 1.8
            ],
            [
                'codename' => 'rmc',
                'share'    => 7.7
            ],
            [
                'codename' => 'cherie',
                'share'    => 3.6
            ],
            [
                'codename' => 'mradio',
                'share'    => 1.1
            ],
            [
                'codename' => 'ouifm',
                'share'    => 0.4
            ]
        ];

        for ($i = 0; $i < count($radios); $i++) {
            $connection->exec(
                "UPDATE radio SET share = ".$radios[$i]['share']." WHERE code_name = '".$radios[$i]['codename']."';"
            );
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
