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
class Version20180109201528 extends AbstractMigration implements ContainerAwareInterface
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
                'stream' => 'http://icecast.rtl.fr/rtl-1-44-128'
            ],
            [
                'codename' => 'rtl2',
                'stream' => 'http://streaming.radio.rtl2.fr/rtl2-1-48-192'

            ],
            [
                'codename' => 'europe1',
                'stream' => 'http://e1-live-mp3-128.scdn.arkena.com/europe1.mp3'
            ],
            [
                'codename' => 'funradio',
                'stream' => 'http://streaming.radio.funradio.fr/fun-1-48-192'

            ],
            [
                'codename' => 'franceinter',
                'stream' =>  'http://direct.franceinter.fr/live/franceinter-midfi.mp3?ID=pd569ib97j'
            ],
            [
                'codename' => 'franceinfo',
                'stream' => 'http://chai5she.cdn.dvmr.fr/franceinfo-midfi.mp3'
            ],
            [
                'codename' => 'nrj',
                'stream' => 'https://cdn.nrjaudio.fm/audio1/fr/30001/mp3_128.mp3?origine=radio.net'
            ],
            [
                'codename' => 'skyrock',
                'stream' => 'http://icecast.skyrock.net/s/natio_mp3_128k'
            ],
            [
                'codename' => 'nostalgie',
                'stream' => 'http://185.52.127.132/fr/30601/mp3_128.mp3?origine=radio.net'
            ],
            [
                'codename' => 'rireetchansons',
                'stream' => 'https://cdn.nrjaudio.fm/audio1/fr/30401/mp3_128.mp3?origine=radio.net'
            ],
            [
                'codename' => 'rfm',
                'stream' => 'http://rfm-live-mp3-128.scdn.arkena.com/rfm.mp3'
            ],
            [
                'codename' => 'virgin',
                'stream' => 'http://mp3lg4.tdf-cdn.com/9243/lag_164753.mp3'
            ],
            [
                'codename' => 'franceculture',
                'stream' => 'http://chai5she.cdn.dvmr.fr/franceculture-midfi.mp3?ID=pd569ib97j'
            ],
            [
                'codename' => 'radioclassique',
                'stream' => 'http://radioclassique.ice.infomaniak.ch/radioclassique-high.mp3'
            ],
            [
                'codename' => 'rmc',
                'stream' => 'http://chai5she.lb.vip.cdn.dvmr.fr/rmcinfo'
            ],
            [
                'codename' => 'sudradio',
                'stream' => 'http://start-sud.ice.infomaniak.ch/start-sud-high.mp3'
            ],
            [
                'codename' => 'ouifm',
                'stream' => 'http://chai5she.cdn.dvmr.fr/ouifm-high.mp3'
            ],
            [
                'codename' => 'radionova',
                'stream' => 'http://novazz.ice.infomaniak.ch/novazz-128.mp3'
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
