<?php declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20190227192720 extends AbstractMigration implements ContainerAwareInterface
{
    private $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }


    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }

    public function postUp(Schema $schema)
    {
        $connection = $this->container->get('doctrine.orm.entity_manager')->getConnection();

        $connection->exec(
            "UPDATE collection SET priority = 2 WHERE id = 2"
        );

        // RADIOS

        $radios = [
            [
                'codename' => 'francebleu_belfortmontbeliard',
                'name' => 'France Bleu Belfort-Montbéliard',
                'category' => 1,
                'collection' => 2,
                'share' => 0.0,
                'stream' => 'https://direct.francebleu.fr/live/fbbelfort-midfi.mp3?ID=radiofrance'
            ],
            [
                'codename' => 'francebleu_berry',
                'name' => 'France Bleu Berry',
                'category' => 1,
                'collection' => 2,
                'share' => 0.0,
                'stream' => 'https://direct.francebleu.fr/live/fbberry-midfi.mp3?ID=radiofrance'
            ],
            [
                'codename' => 'francebleu_besancon',
                'name' => 'France Bleu Besançon',
                'category' => 1,
                'collection' => 2,
                'share' => 0.0,
                'stream' => 'https://direct.francebleu.fr/live/fbbesancon-midfi.mp3?ID=radiofrance'
            ],
            [
                'codename' => 'francebleu_bourgogne',
                'name' => 'France Bleu Bourgogne',
                'category' => 1,
                'collection' => 2,
                'share' => 0.0,
                'stream' => 'https://direct.francebleu.fr/live/fbbourgogne-midfi.mp3?ID=radiofrance'
            ],
            [
                'codename' => 'francebleu_breizhizel',
                'name' => 'France Bleu Breizh Izel',
                'category' => 1,
                'collection' => 2,
                'share' => 0.0,
                'stream' => 'https://direct.francebleu.fr/live/fbbreizizel-midfi.mp3?ID=radiofrance'
            ],
            [
                'codename' => 'francebleu_champagneardenne',
                'name' => 'France Bleu Champagne-Ardenne',
                'category' => 1,
                'collection' => 2,
                'share' => 0.0,
                'stream' => 'https://direct.francebleu.fr/live/fbchampagne-midfi.mp3?ID=radiofrance'
            ],
            [
                'codename' => 'francebleu_cotentin',
                'name' => 'France Bleu Cotentin',
                'category' => 1,
                'collection' => 2,
                'share' => 0.0,
                'stream' => 'https://direct.francebleu.fr/live/fbcotentin-midfi.mp3?ID=radiofrance'
            ],
            [
                'codename' => 'francebleu_creuse',
                'name' => 'France Bleu Creuse',
                'category' => 1,
                'collection' => 2,
                'share' => 0.0,
                'stream' => 'https://direct.francebleu.fr/live/fbcreuse-midfi.mp3?ID=radiofrance'
            ],
            [
                'codename' => 'francebleu_dromeardeche',
                'name' => 'France Bleu Drôme Ardèche',
                'category' => 1,
                'collection' => 2,
                'share' => 0.0,
                'stream' => 'https://direct.francebleu.fr/live/fbdromeardeche-midfi.mp3?ID=radiofrance'
            ],
            [
                'codename' => 'francebleu_elsass',
                'name' => 'France Bleu Elsass',
                'category' => 1,
                'collection' => 2,
                'share' => 0.0,
                'stream' => 'https://direct.francebleu.fr/live/Fbelsass-midfi.mp3?ID=radiofrance'
            ],
            [
                'codename' => 'francebleu_gardlozere',
                'name' => 'France Bleu Gard Lozère',
                'category' => 1,
                'collection' => 2,
                'share' => 0.0,
                'stream' => 'https://direct.francebleu.fr/live/fbgardlozere-midfi.mp3?ID=radiofrance'
            ],
            [
                'codename' => 'francebleu_gascogne',
                'name' => 'France Bleu Gascogne',
                'category' => 1,
                'collection' => 2,
                'share' => 0.0,
                'stream' => 'https://direct.francebleu.fr/live/fbgascogne-midfi.mp3?ID=radiofrance'
            ],
            [
                'codename' => 'francebleu_gironde',
                'name' => 'France Bleu Gironde',
                'category' => 1,
                'collection' => 2,
                'share' => 0.0,
                'stream' => 'https://direct.francebleu.fr/live/fbgironde-midfi.mp3?ID=radiofrance'
            ],
            [
                'codename' => 'francebleu_herault',
                'name' => 'France Bleu Hérault',
                'category' => 1,
                'collection' => 2,
                'share' => 0.0,
                'stream' => 'https://direct.francebleu.fr/live/fbherault-midfi.mp3?ID=radiofrance'
            ],
            [
                'codename' => 'francebleu_isere',
                'name' => 'France Bleu Isère',
                'category' => 1,
                'collection' => 2,
                'share' => 0.0,
                'stream' => 'https://direct.francebleu.fr/live/fbisere-midfi.mp3?ID=radiofrance'
            ],
            [
                'codename' => 'francebleu_larochelle',
                'name' => 'France Bleu La Rochelle',
                'category' => 1,
                'collection' => 2,
                'share' => 0.0,
                'stream' => 'https://direct.francebleu.fr/live/fblarochelle-midfi.mp3?ID=radiofrance'
            ],
            [
                'codename' => 'francebleu_limousin',
                'name' => 'France Bleu Limousin',
                'category' => 1,
                'collection' => 2,
                'share' => 0.0,
                'stream' => 'https://direct.francebleu.fr/live/fblimousin-midfi.mp3?ID=radiofrance'
            ],
            [
                'codename' => 'francebleu_loireocean',
                'name' => 'France Bleu Loire Océan',
                'category' => 1,
                'collection' => 2,
                'share' => 0.0,
                'stream' => 'https://direct.francebleu.fr/live/fbloireocean-midfi.mp3?ID=radiofrance'
            ],
            [
                'codename' => 'francebleu_lorrainenord',
                'name' => 'France Bleu Lorraine Nord',
                'category' => 1,
                'collection' => 2,
                'share' => 0.0,
                'stream' => 'https://direct.francebleu.fr/live/fblorrainenord-midfi.mp3?ID=radiofrance'
            ],
            [
                'codename' => 'francebleu_maine',
                'name' => 'France Bleu Maine',
                'category' => 1,
                'collection' => 2,
                'share' => 0.0,
                'stream' => 'https://direct.francebleu.fr/live/fbmaine-midfi.mp3?ID=radiofrance'
            ],
            [
                'codename' => 'francebleu_mayenne',
                'name' => 'France Bleu Mayenne',
                'category' => 1,
                'collection' => 2,
                'share' => 0.0,
                'stream' => 'https://direct.francebleu.fr/live/fbmayenne-midfi.mp3?ID=radiofrance'
            ],
            [
                'codename' => 'francebleu_bassenormandie',
                'name' => 'France Bleu Normandie (Calvados - Orne)',
                'category' => 1,
                'collection' => 2,
                'share' => 0.0,
                'stream' => 'https://direct.francebleu.fr/live/fbbassenormandie-midfi.mp3?ID=radiofrance'
            ],
            [
                'codename' => 'francebleu_hautenormandie',
                'name' => 'France Bleu Normandie (Seine-Maritime - Eure)',
                'category' => 1,
                'collection' => 2,
                'share' => 0.0,
                'stream' => 'https://direct.francebleu.fr/live/fbhautenormandie-midfi.mp3?ID=radiofrance'
            ],
            [
                'codename' => 'francebleu_occitanie',
                'name' => 'France Bleu Occitanie',
                'category' => 1,
                'collection' => 2,
                'share' => 0.0,
                'stream' => 'https://direct.francebleu.fr/live/fbtoulouse-midfi.mp3?ID=radiofrance'
            ],
            [
                'codename' => 'francebleu_orleans',
                'name' => 'France Bleu Orléans',
                'category' => 1,
                'collection' => 2,
                'share' => 0.0,
                'stream' => 'https://direct.francebleu.fr/live/fborleans-midfi.mp3?ID=radiofrance'
            ],
            [
                'codename' => 'francebleu_paysbasque',
                'name' => 'France Bleu Pays Basque',
                'category' => 1,
                'collection' => 2,
                'share' => 0.0,
                'stream' => 'https://direct.francebleu.fr/live/fbpaysbasque-midfi.mp3?ID=radiofrance'
            ],
            [
                'codename' => 'francebleu_paysdauvergne',
                'name' => "France Bleu Pays d''Auvergne",
                'category' => 1,
                'collection' => 2,
                'share' => 0.0,
                'stream' => 'https://direct.francebleu.fr/live/fbpaysdauvergne-midfi.mp3?ID=radiofrance'
            ],
            [
                'codename' => 'francebleu_paysdesavoie',
                'name' => 'France Bleu Pays de Savoie',
                'category' => 1,
                'collection' => 2,
                'share' => 0.0,
                'stream' => 'https://direct.francebleu.fr/live/fbherault-midfi.mp3?ID=radiofrance'
            ],
            [
                'codename' => 'francebleu_perigord',
                'name' => 'France Bleu Périgord',
                'category' => 1,
                'collection' => 2,
                'share' => 0.0,
                'stream' => 'https://direct.francebleu.fr/live/fbperigord-midfi.mp3?ID=radiofrance'
            ],
            [
                'codename' => 'francebleu_picardie',
                'name' => 'France Bleu Picardie',
                'category' => 1,
                'collection' => 2,
                'share' => 0.0,
                'stream' => 'https://direct.francebleu.fr/live/fbpicardie-midfi.mp3?ID=radiofrance'
            ],
            [
                'codename' => 'francebleu_poitou',
                'name' => 'France Bleu Poitou',
                'category' => 1,
                'collection' => 2,
                'share' => 0.0,
                'stream' => 'https://direct.francebleu.fr/live/fbpoitou-midfi.mp3?ID=radiofrance'
            ],
            [
                'codename' => 'francebleu_provence',
                'name' => 'France Bleu Provence',
                'category' => 1,
                'collection' => 2,
                'share' => 0.0,
                'stream' => 'https://direct.francebleu.fr/live/fbprovence-midfi.mp3?ID=radiofrance'
            ],
            [
                'codename' => 'francebleu_rcfm',
                'name' => 'France Bleu RCFM',
                'category' => 1,
                'collection' => 2,
                'share' => 0.0,
                'stream' => 'https://direct.francebleu.fr/live/fbfrequenzamora-midfi.mp3?ID=radiofrance'
            ],
            [
                'codename' => 'francebleu_roussillon',
                'name' => 'France Bleu Roussillon',
                'category' => 1,
                'collection' => 2,
                'share' => 0.0,
                'stream' => 'https://direct.francebleu.fr/live/fbroussillon-midfi.mp3?ID=radiofrance'
            ],
            [
                'codename' => 'francebleu_saintetienneloire',
                'name' => 'France Bleu Saint-Étienne Loire',
                'category' => 1,
                'collection' => 2,
                'share' => 0.0,
                'stream' => 'https://direct.francebleu.fr/live/fbstetienne-midfi.mp3?ID=radiofrance'
            ],
            [
                'codename' => 'francebleu_sudlorraine',
                'name' => 'France Bleu Sud Lorraine',
                'category' => 1,
                'collection' => 2,
                'share' => 0.0,
                'stream' => 'https://direct.francebleu.fr/live/fbsudlorraine-midfi.mp3?ID=radiofrance'
            ],
            [
                'codename' => 'francebleu_touraine',
                'name' => 'France Bleu Touraine',
                'category' => 1,
                'collection' => 2,
                'share' => 0.0,
                'stream' => 'https://direct.francebleu.fr/live/fbtouraine-midfi.mp3?ID=radiofrance'
            ],
            [
                'codename' => 'francebleu_vaucluse',
                'name' => 'France Bleu Vaucluse',
                'category' => 1,
                'collection' => 2,
                'share' => 0.0,
                'stream' => 'https://direct.francebleu.fr/live/fbvaucluse-midfi.mp3?ID=radiofrance'
            ]
        ];

        for ($i=0;$i<count($radios);$i++) {
            for ($i=0;$i<count($radios);$i++) {
                $connection->exec(
                    'INSERT INTO radio (id, category_id, code_name, stream_url, name, share, collection_id) VALUES ('
                    .($i+30).','.$radios[$i]['category'].",'".$radios[$i]['codename']."','".$radios[$i]['stream']."','".$radios[$i]['name']."',".$radios[$i]['share'].",".$radios[$i]['collection'].");"
                );
            }
        }
    }
}
