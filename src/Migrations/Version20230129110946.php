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
final class Version20230129110946 extends AbstractMigration implements ContainerAwareInterface
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
                'codename'   => 'france_bleu',
                'name'       => 'France Bleu',
                'category'   => 1,
                'collection' => 1,
                'share'      => 4.9,
                'country'    => 'FR',
                'timezone'   => 'Europe/Paris'
            ]
        ];

        $subRadios = [
            [
                'codename'   => 'france_bleu_paris',
                'name'       => 'France Bleu Paris',
                'main'       => 'true',
                'radio_id'   => 124
            ],
            [
                'codename'   => 'france_bleu_nord',
                'name'       => 'France Bleu Nord',
                'main'       => 'false',
                'radio_id'   => 124
            ],
            [
                'codename'   => 'france_bleu_alsace',
                'name'       => 'France Bleu Alsace',
                'main'       => 'false',
                'radio_id'   => 124
            ],
            [
                'codename'   => 'france_bleu_armorique',
                'name'       => 'France Bleu Armorique',
                'main'       => 'false',
                'radio_id'   => 124
            ],
            [
                'codename'   => 'france_bleu_auxerre',
                'name'       => 'France Bleu Auxerre',
                'main'       => 'false',
                'radio_id'   => 124
            ],
            [
                'codename'   => 'france_bleu_azur',
                'name'       => 'France Bleu Azur',
                'main'       => 'false',
                'radio_id'   => 124
            ],
            [
                'codename'   => 'france_bleu_bearn',
                'name'       => 'France Bleu Béarn',
                'main'       => 'false',
                'radio_id'   => 124
            ],
            [
                'codename'   => 'france_bleu_belfortmontbeliard',
                'name'       => 'France Bleu Belfort-Montbéliard',
                'main'       => 'false',
                'radio_id'   => 124
            ],
            [
                'codename'   => 'france_bleu_berry',
                'name'       => 'France Bleu Berry',
                'main'       => 'false',
                'radio_id'   => 124
            ],
            [
                'codename'   => 'france_bleu_besancon',
                'name'       => 'France Bleu Besançon',
                'main'       => 'false',
                'radio_id'   => 124
            ],
            [
                'codename'   => 'france_bleu_bourgogne',
                'name'       => 'France Bleu Bourgogne',
                'main'       => 'false',
                'radio_id'   => 124
            ],
            [
                'codename'   => 'france_bleu_breizhizel',
                'name'       => 'France Bleu Breizh Izel',
                'main'       => 'false',
                'radio_id'   => 124
            ],
            [
                'codename'   => 'france_bleu_champagneardenne',
                'name'       => 'France Bleu Champagne-Ardenne',
                'main'       => 'false',
                'radio_id'   => 124
            ],
            [
                'codename'   => 'france_bleu_breizhizel',
                'name'       => 'France Bleu Breizh Izel',
                'main'       => 'false',
                'radio_id'   => 124
            ],
            [
                'codename'   => 'france_bleu_cotentin',
                'name'       => 'France Bleu Cotentin',
                'main'       => 'false',
                'radio_id'   => 124
            ],
            [
                'codename'   => 'france_bleu_creuse',
                'name'       => 'France Bleu Creuse',
                'main'       => 'false',
                'radio_id'   => 124
            ],
            [
                'codename'   => 'france_bleu_dromeardeche',
                'name'       => 'France Bleu Drôme Ardèche',
                'main'       => 'false',
                'radio_id'   => 124
            ],
            [
                'codename'   => 'france_bleu_elsass',
                'name'       => 'France Bleu Elsass',
                'main'       => 'false',
                'radio_id'   => 124
            ],
            [
                'codename'   => 'france_bleu_gardlozere',
                'name'       => 'France Bleu Gard Lozère',
                'main'       => 'false',
                'radio_id'   => 124
            ],
            [
                'codename'   => 'france_bleu_gascogne',
                'name'       => 'France Bleu Gascogne',
                'main'       => 'false',
                'radio_id'   => 124
            ],
            [
                'codename'   => 'france_bleu_gironde',
                'name'       => 'France Bleu Gironde',
                'main'       => 'false',
                'radio_id'   => 124
            ],
            [
                'codename'   => 'france_bleu_herault',
                'name'       => 'France Bleu Hérault',
                'main'       => 'false',
                'radio_id'   => 124
            ],
            [
                'codename'   => 'france_bleu_isere',
                'name'       => 'France Bleu Isère',
                'main'       => 'false',
                'radio_id'   => 124
            ],
            [
                'codename'   => 'france_bleu_larochelle',
                'name'       => 'France Bleu La Rochelle',
                'main'       => 'false',
                'radio_id'   => 124
            ],
            [
                'codename'   => 'france_bleu_limousin',
                'name'       => 'France Bleu Limousin',
                'main'       => 'false',
                'radio_id'   => 124
            ],
            [
                'codename'   => 'france_bleu_loireocean',
                'name'       => 'France Bleu Loire Océan',
                'main'       => 'false',
                'radio_id'   => 124
            ],
            [
                'codename'   => 'france_bleu_lorrainenord',
                'name'       => 'France Bleu Lorraine Nord',
                'main'       => 'false',
                'radio_id'   => 124
            ],
            [
                'codename'   => 'france_bleu_maine',
                'name'       => 'France Bleu Maine',
                'main'       => 'false',
                'radio_id'   => 124
            ],
            [
                'codename'   => 'france_bleu_mayenne',
                'name'       => 'France Bleu Mayenne',
                'main'       => 'false',
                'radio_id'   => 124
            ],
            [
                'codename'   => 'france_bleu_bassenormandie',
                'name'       => 'France Bleu Normandie (Calvados - Orne)',
                'main'       => 'false',
                'radio_id'   => 124
            ],
            [
                'codename'   => 'france_bleu_hautenormandie',
                'name'       => 'France Bleu Normandie (Seine-Maritime - Eure)',
                'main'       => 'false',
                'radio_id'   => 124
            ],
            [
                'codename'   => 'france_bleu_occitanie',
                'name'       => 'France Bleu Occitanie',
                'main'       => 'false',
                'radio_id'   => 124
            ],
            [
                'codename'   => 'france_bleu_orleans',
                'name'       => 'France Bleu Orléans',
                'main'       => 'false',
                'radio_id'   => 124
            ],
            [
                'codename'   => 'france_bleu_paysbasque',
                'name'       => 'France Bleu Pays Basque',
                'main'       => 'false',
                'radio_id'   => 124
            ],
            [
                'codename'   => 'france_bleu_paysdauvergne',
                'name'       => "France Bleu Pays d''Auvergne",
                'main'       => 'false',
                'radio_id'   => 124
            ],
            [
                'codename'   => 'france_bleu_paysdesavoie',
                'name'       => 'France Bleu Pays de Savoie',
                'main'       => 'false',
                'radio_id'   => 124
            ],
            [
                'codename'   => 'france_bleu_perigord',
                'name'       => 'France Bleu Périgord',
                'main'       => 'false',
                'radio_id'   => 124
            ],
            [
                'codename'   => 'france_bleu_picardie',
                'name'       => 'France Bleu Picardie',
                'main'       => 'false',
                'radio_id'   => 124
            ],
            [
                'codename'   => 'france_bleu_poitou',
                'name'       => 'France Bleu Poitou',
                'main'       => 'false',
                'radio_id'   => 124
            ],
            [
                'codename'   => 'france_bleu_provence',
                'name'       => 'France Bleu Provence',
                'main'       => 'false',
                'radio_id'   => 124
            ],
            [
                'codename'   => 'france_bleu_rcfm',
                'name'       => 'France Bleu RCFM',
                'main'       => 'false',
                'radio_id'   => 124
            ],
            [
                'codename'   => 'france_bleu_roussillon',
                'name'       => 'France Bleu Roussillon',
                'main'       => 'false',
                'radio_id'   => 124
            ],
            [
                'codename'   => 'france_bleu_saintetienneloire',
                'name'       => 'France Bleu Saint-Étienne Loire',
                'main'       => 'false',
                'radio_id'   => 124
            ],
            [
                'codename'   => 'france_bleu_sudlorraine',
                'name'       => 'France Bleu Sud Lorraine',
                'main'       => 'false',
                'radio_id'   => 124
            ],
            [
                'codename'   => 'france_bleu_touraine',
                'name'       => 'France Bleu Touraine',
                'main'       => 'false',
                'radio_id'   => 124
            ],
            [
                'codename'   => 'france_bleu_vaucluse',
                'name'       => 'France Bleu Vaucluse',
                'main'       => 'false',
                'radio_id'   => 124
            ],
        ];

        $stream = [
            [
                'code_name' => 'france_bleu_main',
                'name' => 'France Bleu Paris',
                'radio_id' => 124,
                'collection' => 2,
                'current_song' => 'false',
                'url' => 'https://direct.francebleu.fr/ts/fb1071-midfi.mp3',
                'main'         => 'true',
                'enabled'      => 'true',
                'sub_radio' => 139
            ],
            [
                'code_name' => 'france_bleu_nord',
                'name' => 'France Bleu Nord',
                'radio_id' => 124,
                'collection' => 2,
                'current_song' => 'false',
                'url' => 'https://direct.francebleu.fr/ts/fbnord-midfi.mp3',
                'main'         => 'false',
                'enabled'      => 'true',
                'sub_radio' => 140
            ],
            [
                'code_name' => 'france_bleu_alsace',
                'name' => 'France Bleu Alsace',
                'radio_id' => 124,
                'collection' => 2,
                'current_song' => 'false',
                'url' => 'https://direct.francebleu.fr/ts/fbalsace-midfi.mp3',
                'main'         => 'false',
                'enabled'      => 'true',
                'sub_radio' => 141
            ],
            [
                'code_name' => 'france_bleu_armorique',
                'name' => 'France Bleu Armorique',
                'radio_id' => 124,
                'collection' => 2,
                'current_song' => 'false',
                'url' => 'https://direct.francebleu.fr/live/fbarmorique-midfi.mp3?ID=radiofrance',
                'main'         => 'false',
                'enabled'      => 'true',
                'sub_radio' => 142
            ],
            [
                'code_name' => 'france_bleu_auxerre',
                'name' => 'France Bleu Auxerre',
                'radio_id' => 124,
                'collection' => 2,
                'current_song' => 'false',
                'url' => 'https://direct.francebleu.fr/live/fbauxerre-midfi.mp3?ID=radiofrance',
                'main'         => 'false',
                'enabled'      => 'true',
                'sub_radio' => 143
            ],
            [
                'code_name' => 'france_bleu_azur',
                'name' => 'France Bleu Azur',
                'radio_id' => 124,
                'collection' => 2,
                'current_song' => 'false',
                'url' => 'https://direct.francebleu.fr/live/fbazur-midfi.mp3?ID=radiofrance',
                'main'         => 'false',
                'enabled'      => 'true',
                'sub_radio' => 144
            ],
            [
                'code_name' => 'france_bleu_bearn',
                'name' => 'France Bleu Béarn',
                'radio_id' => 124,
                'collection' => 2,
                'current_song' => 'false',
                'url' => 'https://direct.francebleu.fr/live/fbbearn-midfi.mp3?ID=radiofrance',
                'main'         => 'false',
                'enabled'      => 'true',
                'sub_radio' => 145
            ],
            [
                'code_name' => 'france_bleu_belfortmontbeliard',
                'name' => 'France Bleu Belfort-Montbéliard',
                'radio_id' => 124,
                'collection' => 2,
                'current_song' => 'false',
                'url' => 'https://direct.francebleu.fr/live/fbbelfort-midfi.mp3?ID=radiofrance',
                'main'         => 'false',
                'enabled'      => 'true',
                'sub_radio' => 146
            ],
            [
                'code_name' => 'france_bleu_berry',
                'name' => 'France Bleu Berry',
                'radio_id' => 124,
                'collection' => 2,
                'current_song' => 'false',
                'url' => 'https://direct.francebleu.fr/live/fbberry-midfi.mp3?ID=radiofrance',
                'main'         => 'false',
                'enabled'      => 'true',
                'sub_radio' => 147
            ],
            [
                'code_name' => 'france_bleu_besancon',
                'name' => 'France Bleu Besançon',
                'radio_id' => 124,
                'collection' => 2,
                'current_song' => 'false',
                'url' => 'https://direct.francebleu.fr/live/fbbesancon-midfi.mp3?ID=radiofrance',
                'main'         => 'false',
                'enabled'      => 'true',
                'sub_radio' => 148
            ],
            [
                'code_name' => 'france_bleu_bourgogne',
                'name' => 'France Bleu Bourgogne',
                'radio_id' => 124,
                'collection' => 2,
                'current_song' => 'false',
                'url' => 'https://direct.francebleu.fr/live/fbbourgogne-midfi.mp3?ID=radiofrance',
                'main'         => 'false',
                'enabled'      => 'true',
                'sub_radio' => 149
            ],
            [
                'code_name' => 'france_bleu_breizhizel',
                'name' => 'France Bleu Breizh Izel',
                'radio_id' => 124,
                'collection' => 2,
                'current_song' => 'false',
                'url' => 'https://direct.francebleu.fr/live/fbbreizizel-midfi.mp3?ID=radiofrance',
                'main'         => 'false',
                'enabled'      => 'true',
                'sub_radio' => 150
            ],
            [
                'code_name' => 'france_bleu_champagneardenne',
                'name' => 'France Bleu Champagne-Ardenne',
                'radio_id' => 124,
                'collection' => 2,
                'current_song' => 'false',
                'url' => 'https://direct.francebleu.fr/live/fbchampagne-midfi.mp3?ID=radiofrance',
                'main'         => 'false',
                'enabled'      => 'true',
                'sub_radio' => 151
            ],
            [
                'code_name' => 'france_bleu_cotentin',
                'name' => 'France Bleu Cotentin',
                'radio_id' => 124,
                'collection' => 2,
                'current_song' => 'false',
                'url' => 'https://direct.francebleu.fr/live/fbcotentin-midfi.mp3?ID=radiofrance',
                'main'         => 'false',
                'enabled'      => 'true',
                'sub_radio' => 152
            ],
            [
                'code_name' => 'france_bleu_creuse',
                'name' => 'France Bleu Creuse',
                'radio_id' => 124,
                'collection' => 2,
                'current_song' => 'false',
                'url' => 'https://direct.francebleu.fr/live/fbcreuse-midfi.mp3?ID=radiofrance',
                'main'         => 'false',
                'enabled'      => 'true',
                'sub_radio' => 153
            ],
            [
                'code_name' => 'france_bleu_dromeardeche',
                'name' => 'France Bleu Drôme Ardèche',
                'radio_id' => 124,
                'collection' => 2,
                'current_song' => 'false',
                'url' => 'https://direct.francebleu.fr/live/fbdromeardeche-midfi.mp3?ID=radiofrance',
                'main'         => 'false',
                'enabled'      => 'true',
                'sub_radio' => 154
            ],
            [
                'code_name' => 'france_bleu_elsass',
                'name' => 'France Bleu Elsass',
                'radio_id' => 124,
                'collection' => 2,
                'current_song' => 'false',
                'url' => 'https://direct.francebleu.fr/live/Fbelsass-midfi.mp3?ID=radiofrance',
                'main'         => 'false',
                'enabled'      => 'true',
                'sub_radio' => 155
            ],
            [
                'code_name' => 'france_bleu_gardlozere',
                'name' => 'France Bleu Gard Lozère',
                'radio_id' => 124,
                'collection' => 2,
                'current_song' => 'false',
                'url' => 'https://direct.francebleu.fr/live/fbgardlozere-midfi.mp3?ID=radiofrance',
                'main'         => 'false',
                'enabled'      => 'true',
                'sub_radio' => 156
            ],
            [
                'code_name' => 'france_bleu_gascogne',
                'name' => 'France Bleu Gascogne',
                'radio_id' => 124,
                'collection' => 2,
                'current_song' => 'false',
                'url' => 'https://direct.francebleu.fr/live/fbgascogne-midfi.mp3?ID=radiofrance',
                'main'         => 'false',
                'enabled'      => 'true',
                'sub_radio' => 157
            ],
            [
                'code_name' => 'france_bleu_gironde',
                'name' => 'France Bleu Gironde',
                'radio_id' => 124,
                'collection' => 2,
                'current_song' => 'false',
                'url' => 'https://direct.francebleu.fr/live/fbgironde-midfi.mp3?ID=radiofrance',
                'main'         => 'false',
                'enabled'      => 'true',
                'sub_radio' => 158
            ],
            [
                'code_name' => 'france_bleu_herault',
                'name' => 'France Bleu Hérault',
                'radio_id' => 124,
                'collection' => 2,
                'current_song' => 'false',
                'url' => 'https://direct.francebleu.fr/live/fbherault-midfi.mp3?ID=radiofrance',
                'main'         => 'false',
                'enabled'      => 'true',
                'sub_radio' => 159
            ],
            [
                'code_name' => 'france_bleu_isere',
                'name' => 'France Bleu Isère',
                'radio_id' => 124,
                'collection' => 2,
                'current_song' => 'false',
                'url' => 'https://direct.francebleu.fr/live/fbisere-midfi.mp3?ID=radiofrance',
                'main'         => 'false',
                'enabled'      => 'true',
                'sub_radio' => 160
            ],
            [
                'code_name' => 'france_bleu_larochelle',
                'name' => 'France Bleu La Rochelle',
                'radio_id' => 124,
                'collection' => 2,
                'current_song' => 'false',
                'url' => 'https://direct.francebleu.fr/live/fblarochelle-midfi.mp3?ID=radiofrance',
                'main'         => 'false',
                'enabled'      => 'true',
                'sub_radio' => 161
            ],
            [
                'code_name' => 'france_bleu_limousin',
                'name' => 'France Bleu Limousin',
                'radio_id' => 124,
                'collection' => 2,
                'current_song' => 'false',
                'url' => 'https://direct.francebleu.fr/live/fblimousin-midfi.mp3?ID=radiofrance',
                'main'         => 'false',
                'enabled'      => 'true',
                'sub_radio' => 162
            ],
            [
                'code_name' => 'france_bleu_loireocean',
                'name' => 'France Bleu Loire Océan',
                'radio_id' => 124,
                'collection' => 2,
                'current_song' => 'false',
                'url' => 'https://direct.francebleu.fr/live/fbloireocean-midfi.mp3?ID=radiofrance',
                'main'         => 'false',
                'enabled'      => 'true',
                'sub_radio' => 163
            ],
            [
                'code_name' => 'france_bleu_lorrainenord',
                'name' => 'France Bleu Lorraine Nord',
                'radio_id' => 124,
                'collection' => 2,
                'current_song' => 'false',
                'url' => 'https://direct.francebleu.fr/live/fblorrainenord-midfi.mp3?ID=radiofrance',
                'main'         => 'false',
                'enabled'      => 'true',
                'sub_radio' => 164
            ],
            [
                'code_name' => 'france_bleu_maine',
                'name' => 'France Bleu Maine',
                'radio_id' => 124,
                'collection' => 2,
                'current_song' => 'false',
                'url' => 'https://direct.francebleu.fr/live/fbmaine-midfi.mp3?ID=radiofrance',
                'main'         => 'false',
                'enabled'      => 'true',
                'sub_radio' => 165
            ],
            [
                'code_name' => 'france_bleu_mayenne',
                'name' => 'France Bleu Mayenne',
                'radio_id' => 124,
                'collection' => 2,
                'current_song' => 'false',
                'url' => 'https://direct.francebleu.fr/live/fbmayenne-midfi.mp3?ID=radiofrance',
                'main'         => 'false',
                'enabled'      => 'true',
                'sub_radio' => 166
            ],
            [
                'code_name' => 'france_bleu_bassenormandie',
                'name' => 'France Bleu Normandie (Calvados - Orne)',
                'radio_id' => 124,
                'collection' => 2,
                'current_song' => 'false',
                'url' => 'https://direct.francebleu.fr/live/fbbassenormandie-midfi.mp3?ID=radiofrance',
                'main'         => 'false',
                'enabled'      => 'true',
                'sub_radio' => 167
            ],
            [
                'code_name' => 'france_bleu_hautenormandie',
                'name' => 'France Bleu Normandie (Seine-Maritime - Eure)',
                'radio_id' => 124,
                'collection' => 2,
                'current_song' => 'false',
                'url' => 'https://direct.francebleu.fr/live/fbhautenormandie-midfi.mp3?ID=radiofrance',
                'main'         => 'false',
                'enabled'      => 'true',
                'sub_radio' => 168
            ],
            [
                'code_name' => 'france_bleu_occitanie',
                'name' => 'France Bleu Occitanie',
                'radio_id' => 124,
                'collection' => 2,
                'current_song' => 'false',
                'url' => 'https://direct.francebleu.fr/live/fbtoulouse-midfi.mp3?ID=radiofrance',
                'main'         => 'false',
                'enabled'      => 'true',
                'sub_radio' => 169
            ],
            [
                'code_name' => 'france_bleu_orleans',
                'name' => 'France Bleu Orléans',
                'radio_id' => 124,
                'collection' => 2,
                'current_song' => 'false',
                'url' => 'https://direct.francebleu.fr/live/fborleans-midfi.mp3?ID=radiofrance',
                'main'         => 'false',
                'enabled'      => 'true',
                'sub_radio' => 170
            ],
            [
                'code_name' => 'france_bleu_paysbasque',
                'name' => 'France Bleu Pays Basque',
                'radio_id' => 124,
                'collection' => 2,
                'current_song' => 'false',
                'url' => 'https://direct.francebleu.fr/live/fbpaysbasque-midfi.mp3?ID=radiofrance',
                'main'         => 'false',
                'enabled'      => 'true',
                'sub_radio' => 171
            ],
            [
                'code_name' => 'france_bleu_paysdauvergne',
                'name' => "France Bleu Pays d''Auvergne",
                'radio_id' => 124,
                'collection' => 2,
                'current_song' => 'false',
                'url' => 'https://direct.francebleu.fr/live/fbpaysdauvergne-midfi.mp3?ID=radiofrance',
                'main'         => 'false',
                'enabled'      => 'true',
                'sub_radio' => 172
            ],
            [
                'code_name' => 'france_bleu_paysdesavoie',
                'name' => 'France Bleu Pays de Savoie',
                'radio_id' => 124,
                'collection' => 2,
                'current_song' => 'false',
                'url' => 'https://direct.francebleu.fr/live/fbherault-midfi.mp3?ID=radiofrance',
                'main'         => 'false',
                'enabled'      => 'true',
                'sub_radio' => 173
            ],
            [
                'code_name' => 'france_bleu_perigord',
                'name' => 'France Bleu Périgord',
                'radio_id' => 124,
                'collection' => 2,
                'current_song' => 'false',
                'url' => 'https://direct.francebleu.fr/live/fbperigord-midfi.mp3?ID=radiofrance',
                'main'         => 'false',
                'enabled'      => 'true',
                'sub_radio' => 174
            ],
            [
                'code_name' => 'france_bleu_picardie',
                'name' => 'France Bleu Picardie',
                'radio_id' => 124,
                'collection' => 2,
                'current_song' => 'false',
                'url' => 'https://direct.francebleu.fr/live/fbpicardie-midfi.mp3?ID=radiofrance',
                'main'         => 'false',
                'enabled'      => 'true',
                'sub_radio' => 175
            ],
            [
                'code_name' => 'france_bleu_poitou',
                'name' => 'France Bleu Poitou',
                'radio_id' => 124,
                'collection' => 2,
                'current_song' => 'false',
                'url' => 'https://direct.francebleu.fr/live/fbpoitou-midfi.mp3?ID=radiofrance',
                'main'         => 'false',
                'enabled'      => 'true',
                'sub_radio' => 176
            ],
            [
                'code_name' => 'france_bleu_provence',
                'name' => 'France Bleu Provence',
                'radio_id' => 124,
                'collection' => 2,
                'current_song' => 'false',
                'url' => 'https://direct.francebleu.fr/live/fbprovence-midfi.mp3?ID=radiofrance',
                'main'         => 'false',
                'enabled'      => 'true',
                'sub_radio' => 177
            ],
            [
                'code_name' => 'france_bleu_rcfm',
                'name' => 'France Bleu RCFM',
                'radio_id' => 124,
                'collection' => 2,
                'current_song' => 'false',
                'url' => 'https://direct.francebleu.fr/live/fbfrequenzamora-midfi.mp3?ID=radiofrance',
                'main'         => 'false',
                'enabled'      => 'true',
                'sub_radio' => 178
            ],
            [
                'code_name' => 'france_bleu_roussillon',
                'name' => 'France Bleu Roussillon',
                'radio_id' => 124,
                'collection' => 2,
                'current_song' => 'false',
                'url' => 'https://direct.francebleu.fr/live/fbroussillon-midfi.mp3?ID=radiofrance',
                'main'         => 'false',
                'enabled'      => 'true',
                'sub_radio' => 179
            ],
            [
                'code_name' => 'france_bleu_saintetienneloire',
                'name' => 'France Bleu Saint-Étienne Loire',
                'radio_id' => 124,
                'collection' => 2,
                'current_song' => 'false',
                'url' => 'https://direct.francebleu.fr/live/fbstetienne-midfi.mp3?ID=radiofrance',
                'main'         => 'false',
                'enabled'      => 'true',
                'sub_radio' => 180
            ],
            [
                'code_name' => 'france_bleu_sudlorraine',
                'name' => 'France Bleu Sud Lorraine',
                'radio_id' => 124,
                'collection' => 2,
                'current_song' => 'false',
                'url' => 'https://direct.francebleu.fr/live/fbsudlorraine-midfi.mp3?ID=radiofrance',
                'main'         => 'false',
                'enabled'      => 'true',
                'sub_radio' => 181
            ],
            [
                'code_name' => 'france_bleu_touraine',
                'name' => 'France Bleu Touraine',
                'radio_id' => 124,
                'collection' => 2,
                'current_song' => 'false',
                'url' => 'https://direct.francebleu.fr/live/fbtouraine-midfi.mp3?ID=radiofrance',
                'main'         => 'false',
                'enabled'      => 'true',
                'sub_radio' => 182
            ],
            [
                'code_name' => 'france_bleu_vaucluse',
                'name' => 'France Bleu Vaucluse',
                'radio_id' => 124,
                'collection' => 2,
                'current_song' => 'false',
                'url' => 'https://direct.francebleu.fr/live/fbvaucluse-midfi.mp3?ID=radiofrance',
                'main'         => 'false',
                'enabled'      => 'true',
                'sub_radio' => 183
            ]
        ];

        for ($i = 0; $i < count($radios); $i++) {
            $connection->exec(
                'INSERT INTO radio (id, category_id, code_name, name, country_code, timezone, share, collection_id) VALUES ('
                .($i + 124).','.$radios[$i]['category'].",'".$radios[$i]['codename']."','".$radios[$i]['name']."','".$radios[$i]['country']."','".$radios[$i]['timezone']."',".$radios[$i]['share'].",".$radios[$i]['collection'].");"
            );
        }

        for ($i = 0; $i < count($subRadios); $i++) {
            $connection->exec(
                'INSERT INTO sub_radio (id, radio_id, code_name, name, main, enabled) VALUES ('
                .($i + 139).','.$subRadios[$i]['radio_id'].",'".$subRadios[$i]['codename']."','".$subRadios[$i]['name']."',".$subRadios[$i]['main'].',true);'
            );
        }

        for ($i = 0; $i < count($stream); $i++) {
            $connection->exec(
                "INSERT INTO radio_stream (code_name, name, url, radio_id, sub_radio_id, current_song,main,enabled) VALUES ('"
                .$stream[$i]['code_name']."','".$stream[$i]['name']."','".$stream[$i]['url']."',".$stream[$i]['radio_id'].','.$stream[$i]['sub_radio'].','.$stream[$i]['current_song'].','.$stream[$i]['main'].','.$stream[$i]['enabled'].')'
            );
        }
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
