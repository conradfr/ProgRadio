<?php declare(strict_types = 1);

namespace DoctrineMigrations;

use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

use AppBundle\Entity\Radio;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20180114131831 extends AbstractMigration implements ContainerAwareInterface
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
                'codename' => 'franceinter',
                'stream' =>  'https://chai5she.cdn.dvmr.fr/franceinter-midfi.mp3'
            ],
            [
                'codename' => 'franceinfo',
                'stream' => 'https://chai5she.cdn.dvmr.fr/franceinfo-midfi.mp3'
            ],
            [
                'codename' => 'nrj',
                'stream' => 'https://cdn.nrjaudio.fm/audio1/fr/30001/mp3_128.mp3?origine=radio.net'
            ],
            [
                'codename' => 'skyrock',
                'stream' => 'https://icecast.skyrock.net/s/natio_mp3_128k'
            ],
            [
                'codename' => 'rireetchansons',
                'stream' => 'https://cdn.nrjaudio.fm/audio1/fr/30401/mp3_128.mp3?origine=radio.net'
            ],
            [
                'codename' => 'franceculture',
                'stream' => 'https://chai5she.cdn.dvmr.fr/franceculture-midfi.mp3'
            ],
            [
                'codename' => 'radioclassique',
                'stream' => 'https://radioclassique.ice.infomaniak.ch/radioclassique-high.mp3'
            ],
            [
                'codename' => 'sudradio',
                'stream' => 'https://start-sud.ice.infomaniak.ch/start-sud-high.mp3'
            ],
            [
                'codename' => 'ouifm',
                'stream' => 'https://chai5she.cdn.dvmr.fr/ouifm-high.mp3'
            ],
            [
                'codename' => 'radionova',
                'stream' => 'https://novazz.ice.infomaniak.ch/novazz-128.mp3'
            ]
        ];

        for ($i=0;$i<count($radios);$i++) {
            for ($i=0;$i<count($radios);$i++) {
                $connection->exec(
                    "UPDATE radio SET stream_url = '".$radios[$i]['stream']."' WHERE code_name = '".$radios[$i]['codename']."';"
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
