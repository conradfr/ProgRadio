<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20240519132909 extends AbstractMigration implements ContainerAwareInterface
{
    private $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs

        $connection = $this->container->get('doctrine.orm.entity_manager')->getConnection();

        // RADIOS

        $radios = [
            [
                'code_name' => 'sweet_fm',
                'name' => 'Sweet FM',
                'category' => 2,
                'collection' => 3,
                'share' => 0,
                'country' => 'FR',
                'timezone' => 'Europe/Paris'
            ],
        ];

        $subRadios = [
            [
                'code_name' => 'sweet_fm_main',
                'name' => 'Sweet FM Le Mans',
                'main' => 'true',
                'radio_id' => 146
            ],
            [
                'code_name' => 'sweet_fm_blois',
                'name' => 'Sweet FM Blois',
                'main' => 'false',
                'radio_id' => 146
            ],
            [
                'code_name' => 'sweet_fm_caen',
                'name' => 'Sweet FM Caen',
                'main' => 'false',
                'radio_id' => 146
            ],
            [
                'code_name' => 'sweet_fm_alencon',
                'name' => 'Sweet FM Alençon',
                'main' => 'false',
                'radio_id' => 146
            ],
            [
                'code_name' => 'sweet_fm_rouen',
                'name' => 'Sweet FM Rouen',
                'main' => 'false',
                'radio_id' => 146
            ],
            [
                'code_name' => 'sweet_fm_chateau_gontier',
                'name' => 'Sweet FM Château-Gontier',
                'main' => 'false',
                'radio_id' => 146
            ],
            [
                'code_name' => 'sweet_fm_evreux',
                'name' => 'Sweet FM Evreux',
                'main' => 'false',
                'radio_id' => 146
            ],
            [
                'code_name' => 'sweet_fm_angers',
                'name' => 'Sweet FM Angers',
                'main' => 'false',
                'radio_id' => 146
            ],
            [
                'code_name' => 'sweet_fm_falaise',
                'name' => 'Sweet FM Falaise',
                'main' => 'false',
                'radio_id' => 146
            ],
            [
                'code_name' => 'sweet_fm_le_havre',
                'name' => 'Sweet FM Le Havre',
                'main' => 'false',
                'radio_id' => 146
            ],
            [
                'code_name' => 'sweet_fm_lisieux',
                'name' => 'Sweet FM Lisieux',
                'main' => 'false',
                'radio_id' => 146
            ],
            [
                'code_name' => 'sweet_fm_louviers',
                'name' => 'Sweet FM Louviers',
                'main' => 'false',
                'radio_id' => 146
            ],
            [
                'code_name' => 'sweet_fm_orleans',
                'name' => 'Sweet FM Orléans',
                'main' => 'false',
                'radio_id' => 146
            ],
            [
                'code_name' => 'sweet_fm_poitiers',
                'name' => 'Sweet FM Poitiers',
                'main' => 'false',
                'radio_id' => 146
            ],
            [
                'code_name' => 'sweet_fm_la_fertebernard',
                'name' => 'Sweet FM La Ferté-Bernard',
                'main' => 'false',
                'radio_id' => 146
            ],
            [
                'code_name' => 'sweet_fm_pontaudemer',
                'name' => 'Pont-Audemer',
                'main' => 'false',
                'radio_id' => 146
            ],
            [
                'code_name' => 'sweet_fm_tours',
                'name' => 'Sweet FM Tours',
                'main' => 'false',
                'radio_id' => 146
            ],
            [
                'code_name' => 'sweet_fm_vernon',
                'name' => 'Sweet FM Vernon',
                'main' => 'false',
                'radio_id' => 146
            ],
            [
                'code_name' => 'sweet_fm_vierzon',
                'name' => 'Sweet FM Vierzon',
                'main' => 'false',
                'radio_id' => 146
            ],
            [
                'code_name' => 'sweet_fm_craon',
                'name' => 'Sweet FM Craon',
                'main' => 'false',
                'radio_id' => 146
            ],
            [
                'code_name' => 'sweet_fm_laigle',
                'name' => "Sweet FM L Aigle",
                'main' => 'false',
                'radio_id' => 146
            ],
            [
                'code_name' => 'sweet_fm_la_Loupe',
                'name' => 'Sweet FM La Loupe',
                'main' => 'false',
                'radio_id' => 146
            ],
            [
                'code_name' => 'sweet_fm_lamottebeuvron',
                'name' => 'Sweet FM Lamotte-Beuvron',
                'main' => 'false',
                'radio_id' => 146
            ],
            [
                'code_name' => 'sweet_fm_mamers',
                'name' => 'Sweet FM Mamers',
                'main' => 'false',
                'radio_id' => 146
            ],
            [
                'code_name' => 'sweet_fm_montoire',
                'name' => 'Sweet FM Montoire-sur-le-Loir',
                'main' => 'false',
                'radio_id' => 146
            ],
            [
                'code_name' => 'sweet_fm_nogentlerotrou',
                'name' => 'Sweet FM Nogent-le-Rotrou',
                'main' => 'false',
                'radio_id' => 146
            ],
            [
                'code_name' => 'sweet_fm_romorantin',
                'name' => 'Sweet FM Romorantin',
                'main' => 'false',
                'radio_id' => 146
            ],
            [
                'code_name' => 'sweet_fm_sablesursarthe',
                'name' => 'Sweet FM Sablé-sur-Sarthe',
                'main' => 'false',
                'radio_id' => 146
            ],
            [
                'code_name' => 'sweet_fm_saintaignan',
                'name' => 'Sweet FM Saint-Aignan',
                'main' => 'false',
                'radio_id' => 146
            ],
            [
                'code_name' => 'sweet_fm_saintcalais',
                'name' => 'Sweet FM Saint-Calais',
                'main' => 'false',
                'radio_id' => 146
            ],
            [
                'code_name' => 'sweet_fm_vendome',
                'name' => 'Sweet FM Vendôme',
                'main' => 'false',
                'radio_id' => 146
            ],
            [
                'code_name' => 'sweet_fm_verneuilsuravre',
                'name' => 'Sweet FM Verneuil-sur-Avre',
                'main' => 'false',
                'radio_id' => 146
            ],

        ];

        $stream = [
            [
                'code_name' => 'sweet_fm_main',
                'name' => 'Sweet FM Le Mans',
                'main' => 'true',
                'radio_id' => 146,
                'current_song' => 'true',
                'url' => 'https://sweetfm-haut-anjou.ice.infomaniak.ch/sweetfm-haut-anjou-192.mp3',
                'enabled' => 'true',
                'sub_radio' => 224
            ],
            [
                'code_name' => 'sweet_fm_blois',
                'name' => 'Sweet FM Blois',
                'main' => 'false',
                'radio_id' => 146,
                'current_song' => 'true',
                'url' => 'https://sweetfm-lemans.ice.infomaniak.ch/sweetfm-blois-192.mp3',
                'enabled' => 'true',
                'sub_radio' => 226
            ],
            [
                'code_name' => 'sweet_fm_caen',
                'name' => 'Sweet FM Caen',
                'main' => 'false',
                'radio_id' => 146,
                'current_song' => 'true',
                'url' => 'https://sweetfm-caen.ice.infomaniak.ch/sweetfm-caen-192.mp3',
                'enabled' => 'true',
                'sub_radio' => 227
            ],
            [
                'code_name' => 'sweet_fm_alencon',
                'name' => 'Sweet FM Alençon',
                'main' => 'false',
                'radio_id' => 146,
                'current_song' => 'true',
                'url' => 'https://sweetfm-alencon.ice.infomaniak.ch/sweetfm-alencon-192.mp3',
                'enabled' => 'true',
                'sub_radio' => 228
            ],
            [
                'code_name' => 'sweet_fm_rouen',
                'name' => 'Sweet FM Rouen',
                'main' => 'false',
                'radio_id' => 146,
                'current_song' => 'true',
                'url' => 'https://sweetfm-rouen.ice.infomaniak.ch/sweetfm-rouen-192.mp3',
                'enabled' => 'true',
                'sub_radio' => 229
            ],
            [
                'code_name' => 'sweet_fm_chateau_gontier',
                'name' => 'Sweet FM Château-Gontier',
                'main' => 'false',
                'radio_id' => 146,
                'current_song' => 'true',
                'url' => 'https://sweetfm-haut-anjou.ice.infomaniak.ch/sweetfm-haut-anjou-192.mp3',
                'enabled' => 'true',
                'sub_radio' => 230
            ],
            [
                'code_name' => 'sweet_fm_evreux',
                'name' => 'Sweet FM Evreux',
                'main' => 'false',
                'radio_id' => 146,
                'current_song' => 'true',
                'url' => 'https://sweetfm-evreux.ice.infomaniak.ch/sweetfm-evreux-192.mp3',
                'enabled' => 'true',
                'sub_radio' => 231
            ],
            [
                'code_name' => 'sweet_fm_angers',
                'name' => 'Sweet FM Angers',
                'main' => 'false',
                'radio_id' => 146,
                'current_song' => 'true',
                'url' => 'https://sweetfm-angers.ice.infomaniak.ch/sweetfm-angers-192.mp3',
                'enabled' => 'true',
                'sub_radio' => 232
            ],
            [
                'code_name' => 'sweet_fm_falaise',
                'name' => 'Sweet FM Falaise',
                'main' => 'false',
                'radio_id' => 146,
                'current_song' => 'true',
                'url' => 'https://sweetfm-caen.ice.infomaniak.ch/sweetfm-caen-192.mp3',
                'enabled' => 'true',
                'sub_radio' => 233
            ],
            [
                'code_name' => 'sweet_fm_le_havre',
                'name' => 'Sweet FM Le Havre',
                'main' => 'false',
                'radio_id' => 146,
                'current_song' => 'true',
                'url' => 'https://sweetfm-rouen.ice.infomaniak.ch/sweetfm-rouen-192.mp3',
                'enabled' => 'true',
                'sub_radio' => 234
            ],
            [
                'code_name' => 'sweet_fm_lisieux',
                'name' => 'Sweet FM Lisieux',
                'main' => 'false',
                'radio_id' => 146,
                'current_song' => 'true',
                'url' => 'https://sweetfm-lisieux.ice.infomaniak.ch/sweetfm-lisieux-192.mp3',
                'enabled' => 'true',
                'sub_radio' => 235
            ],
            [
                'code_name' => 'sweet_fm_louviers',
                'name' => 'Sweet FM Louviers',
                'main' => 'false',
                'radio_id' => 146,
                'current_song' => 'true',
                'url' => 'https://sweetfm-haut-anjou.ice.infomaniak.ch/sweetfm-haut-anjou-192.mp3',
                'enabled' => 'true',
                'sub_radio' => 236
            ],
            [
                'code_name' => 'sweet_fm_orleans',
                'name' => 'Sweet FM Orléans',
                'main' => 'false',
                'radio_id' => 146,
                'current_song' => 'true',
                'url' => 'https://sweetfm-haut-anjou.ice.infomaniak.ch/sweetfm-haut-anjou-192.mp3',
                'enabled' => 'true',
                'sub_radio' => 237
            ],
            [
                'code_name' => 'sweet_fm_poitiers',
                'name' => 'Sweet FM Poitiers',
                'main' => 'false',
                'radio_id' => 146,
                'current_song' => 'true',
                'url' => 'https://sweetfm-poitiers.ice.infomaniak.ch/sweetfm-poitiers-192.mp3',
                'enabled' => 'true',
                'sub_radio' => 238
            ],
            [
                'code_name' => 'sweet_fm_la_fertebernard',
                'name' => 'Sweet FM La Ferté-Bernard',
                'main' => 'false',
                'radio_id' => 146,
                'current_song' => 'true',
                'url' => 'https://sweetfm-perche72.ice.infomaniak.ch/sweetfm-perche72-192.mp3',
                'enabled' => 'true',
                'sub_radio' => 239
            ],
            [
                'code_name' => 'sweet_fm_pontaudemer',
                'name' => 'Pont-Audemer',
                'main' => 'false',
                'radio_id' => 146,
                'current_song' => 'true',
                'url' => 'https://sweetfm-pont-audemer.ice.infomaniak.ch/sweetfm-pont-audemer-192.mp3',
                'enabled' => 'true',
                'sub_radio' => 240
            ],
            [
                'code_name' => 'sweet_fm_tours',
                'name' => 'Sweet FM Tours',
                'main' => 'false',
                'radio_id' => 146,
                'current_song' => 'true',
                'url' => 'https://sweetfm-tours.ice.infomaniak.ch/sweetfm-tours-192.mp3',
                'enabled' => 'true',
                'sub_radio' => 241
            ],
            [
                'code_name' => 'sweet_fm_vernon',
                'name' => 'Sweet FM Vernon',
                'main' => 'false',
                'radio_id' => 146,
                'current_song' => 'true',
                'url' => 'https://sweetfm-vernon.ice.infomaniak.ch/sweetfm-vernon-192.mp3',
                'enabled' => 'true',
                'sub_radio' => 242
            ],
            [
                'code_name' => 'sweet_fm_vierzon',
                'name' => 'Sweet FM Vierzon',
                'main' => 'false',
                'radio_id' => 146,
                'current_song' => 'true',
                'url' => 'https://sweetfm-sologne.ice.infomaniak.ch/sweetfm-sologne-192.mp3',
                'enabled' => 'true',
                'sub_radio' => 243
            ],
            [
                'code_name' => 'sweet_fm_craon',
                'name' => 'Sweet FM Craon',
                'main' => 'false',
                'radio_id' => 146,
                'current_song' => 'true',
                'url' => 'https://sweetfm-haut-anjou.ice.infomaniak.ch/sweetfm-haut-anjou-192.mp3',
                'enabled' => 'true',
                'sub_radio' => 244
            ],
            [
                'code_name' => 'sweet_fm_laigle',
                'name' => "Sweet FM L Aigle",
                'main' => 'false',
                'radio_id' => 146,
                'current_song' => 'true',
                'url' => 'https://sweetfm-aigle-verneuil.ice.infomaniak.ch/sweetfm-aigle-verneuil-192.mp3',
                'enabled' => 'true',
                'sub_radio' => 245
            ],
            [
                'code_name' => 'sweet_fm_la_Loupe',
                'name' => 'Sweet FM La Loupe',
                'main' => 'false',
                'radio_id' => 146,
                'current_song' => 'true',
                'url' => 'https://sweetfm-perche28.ice.infomaniak.ch/sweetfm-perche28-192.mp3',
                'enabled' => 'true',
                'sub_radio' => 246
            ],
            [
                'code_name' => 'sweet_fm_lamottebeuvron',
                'name' => 'Sweet FM Lamotte-Beuvron',
                'main' => 'false',
                'radio_id' => 146,
                'current_song' => 'true',
                'url' => 'https://sweetfm-sologne.ice.infomaniak.ch/sweetfm-sologne-192.mp3',
                'enabled' => 'true',
                'sub_radio' => 247
            ],
            [
                'code_name' => 'sweet_fm_mamers',
                'name' => 'Sweet FM Mamers',
                'main' => 'false',
                'radio_id' => 146,
                'current_song' => 'true',
                'url' => 'https://sweetfm-mamers.ice.infomaniak.ch/sweetfm-mamers-192.mp3',
                'enabled' => 'true',
                'sub_radio' => 248
            ],
            [
                'code_name' => 'sweet_fm_montoire',
                'name' => 'Sweet FM Montoire-sur-le-Loir',
                'main' => 'false',
                'radio_id' => 146,
                'current_song' => 'true',
                'url' => 'https://sweetfm-vendome-montoire.ice.infomaniak.ch/sweetfm-vendome-montoire-192.mp3',
                'enabled' => 'true',
                'sub_radio' => 249
            ],
            [
                'code_name' => 'sweet_fm_nogentlerotrou',
                'name' => 'Sweet FM Nogent-le-Rotrou',
                'main' => 'false',
                'radio_id' => 146,
                'current_song' => 'true',
                'url' => 'https://sweetfm-perche28.ice.infomaniak.ch/sweetfm-perche28-192.mp3',
                'enabled' => 'true',
                'sub_radio' => 250
            ],
            [
                'code_name' => 'sweet_fm_romorantin',
                'name' => 'Sweet FM Romorantin',
                'main' => 'false',
                'radio_id' => 146,
                'current_song' => 'true',
                'url' => 'https://sweetfm-sologne.ice.infomaniak.ch/sweetfm-sologne-192.mp3',
                'enabled' => 'true',
                'sub_radio' => 251
            ],
            [
                'code_name' => 'sweet_fm_sablesursarthe',
                'name' => 'Sweet FM Sablé-sur-Sarthe',
                'main' => 'false',
                'radio_id' => 146,
                'current_song' => 'true',
                'url' => 'https://sweetfm-sable-sur-sarthe.ice.infomaniak.ch/sweetfm-sable-sur-sarthe-192.mp3',
                'enabled' => 'true',
                'sub_radio' => 252
            ],
            [
                'code_name' => 'sweet_fm_saintaignan',
                'name' => 'Sweet FM Saint-Aignan',
                'main' => 'false',
                'radio_id' => 146,
                'current_song' => 'true',
                'url' => 'https://sweetfm-lemans.ice.infomaniak.ch/sweetfm-blois-192.mp3',
                'enabled' => 'true',
                'sub_radio' => 253
            ],
            [
                'code_name' => 'sweet_fm_saintcalais',
                'name' => 'Sweet FM Saint-Calais',
                'main' => 'false',
                'radio_id' => 146,
                'current_song' => 'true',
                'url' => 'https://sweetfm-perche72.ice.infomaniak.ch/sweetfm-perche72-192.mp3',
                'enabled' => 'true',
                'sub_radio' => 254
            ],
            [
                'code_name' => 'sweet_fm_vendome',
                'name' => 'Sweet FM Vendôme',
                'main' => 'false',
                'radio_id' => 146,
                'current_song' => 'true',
                'url' => 'https://sweetfm-vendome-montoire.ice.infomaniak.ch/sweetfm-vendome-montoire-192.mp3',
                'enabled' => 'true',
                'sub_radio' => 255
            ],
            [
                'code_name' => 'sweet_fm_verneuilsuravre',
                'name' => 'Sweet FM Verneuil-sur-Avre',
                'main' => 'false',
                'radio_id' => 146,
                'current_song' => 'true',
                'url' => 'https://sweetfm-verneuil-sur-avre.ice.infomaniak.ch/sweetfm-verneuil-sur-avre-192.mp3',
                'enabled' => 'true',
                'sub_radio' => 256
            ],

        ];

        for ($i = 0; $i < count($radios); $i++) {
            $connection->exec(
                'INSERT INTO radio (id, category_id, code_name, name, country_code, timezone, share, collection_id) VALUES ('
                . ($i + 146) . ',' . $radios[$i]['category'] . ",'" . $radios[$i]['code_name'] . "','" . $radios[$i]['name'] . "','" . $radios[$i]['country'] . "','" . $radios[$i]['timezone'] . "'," . $radios[$i]['share'] . "," . $radios[$i]['collection'] . ");"
            );
        }

        for ($i = 0; $i < count($subRadios); $i++) {
            $connection->exec(
                'INSERT INTO sub_radio (id, radio_id, code_name, name, main, enabled) VALUES ('
                . ($i + 224) . ',' . $subRadios[$i]['radio_id'] . ",'" . $subRadios[$i]['code_name'] . "','" . $subRadios[$i]['name'] . "'," . $subRadios[$i]['main'] . ',true);'
            );
        }

        for ($i = 0; $i < count($stream); $i++) {
            $connection->exec(
                "INSERT INTO radio_stream (code_name, name, url, radio_id, sub_radio_id, current_song,main,enabled) VALUES ('"
                . $stream[$i]['code_name'] . "','" . $stream[$i]['name'] . "','" . $stream[$i]['url'] . "'," . $stream[$i]['radio_id'] . ',' . $stream[$i]['sub_radio'] . ',' . $stream[$i]['current_song'] . ',' . $stream[$i]['main'] . ',' . $stream[$i]['enabled'] . ')'
            );
        }
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
