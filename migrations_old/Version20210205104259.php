<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20210205104259 extends AbstractMigration
{
    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs

        $radios = [
            [
                'code_name'  => 'fip_rock',
                'name'       => 'FIP Rock',
                'radio_id'   => 74,
                'url'        => 'https://stream.radiofrance.fr/fiprock/fiprock_hifi.m3u8?id=radiofrance',
            ],
            [
                'code_name'  => 'fip_jazz',
                'name'       => 'FIP Jazz',
                'radio_id'   => 74,
                'url'        => 'https://stream.radiofrance.fr/fipjazz/fipjazz_hifi.m3u8?id=radiofrance',
            ],
            [
                'code_name'  => 'fip_groove',
                'name'       => 'FIP Groove',
                'radio_id'   => 74,
                'url'        => 'https://stream.radiofrance.fr/fipgroove/fipgroove_hifi.m3u8?id=radiofrance',
            ],
            [
                'code_name'  => 'fip_pop',
                'name'       => 'FIP Pop',
                'radio_id'   => 74,
                'url'        => 'https://stream.radiofrance.fr/fippop/fippop_hifi.m3u8?id=radiofrance',
            ],
            [
                'code_name'  => 'fip_electro',
                'name'       => 'FIP Electro',
                'radio_id'   => 74,
                'url'        => 'https://stream.radiofrance.fr/fipelectro/fipelectro_hifi.m3u8?id=radiofrance',
            ],
            [
                'code_name'  => 'fip_monde',
                'name'       => 'FIP Monde',
                'radio_id'   => 74,
                'url'        => 'https://stream.radiofrance.fr/fipworld/fipworld_hifi.m3u8?id=radiofrance',
            ],
            [
                'code_name'  => 'fip_reggae',
                'name'       => 'FIP Reggae',
                'radio_id'   => 74,
                'url'        => 'https://stream.radiofrance.fr/fipreggae/fipreggae_hifi.m3u8?id=radiofrance',
            ],
            [
                'code_name'  => 'fip_nouveautes',
                'name'       => 'FIP Nouveautés',
                'radio_id'   => 74,
                'url'        => 'https://stream.radiofrance.fr/fipnouveautes/fipnouveautes_hifi.m3u8?id=radiofrance',
            ],

            [
                'code_name'  => 'rireetchansons_nouvelle_generation',
                'name'       => 'Rire & Chansons Nouvelle généraion',
                'radio_id'   => 10,
                'url'        => 'https://scdn.nrjaudio.fm/adwz1/fr/30405/aac_64.mp3?origine=playerrire&aw_0_req.userConsentV2=',
            ],
            [
                'code_name'  => 'rireetchansons_canulars',
                'name'       => 'Rire & Chansons Canulars',
                'radio_id'   => 10,
                'url'        => 'https://scdn.nrjaudio.fm/adwz1/fr/30413/aac_64.mp3?origine=playerrire&aw_0_req.userConsentV2=',
            ],
            [
                'code_name'  => 'rireetchansons_blagues',
                'name'       => 'Rire & Chansons Blagues',
                'radio_id'   => 10,
                'url'        => 'https://scdn.nrjaudio.fm/adwz1/fr/30411/aac_64.mp3?origine=playerrire&aw_0_req.userConsentV2=',
            ],
            [
                'code_name'  => 'rireetchansons_duos',
                'name'       => 'Rire & Chansons Duos',
                'radio_id'   => 10,
                'url'        => 'https://scdn.nrjaudio.fm/adwz1/fr/55601/aac_64.mp3?origine=playerrire&aw_0_req.userConsentV2=',
            ],
            [
                'code_name'  => 'rireetchansons_futurs_talents',
                'name'       => 'Rire & Chansons Futurs talents',
                'radio_id'   => 10,
                'url'        => 'https://scdn.nrjaudio.fm/adwz1/fr/55818/aac_64.mp3?origine=playerrire&aw_0_req.userConsentV2=',
            ],
            [
                'code_name'  => 'rireetchansons_one_woman_show',
                'name'       => 'Rire & Chansons One woman show',
                'radio_id'   => 10,
                'url'        => 'https://scdn.nrjaudio.fm/adwz1/fr/55576/aac_64.mp3?origine=playerrire&aw_0_req.userConsentV2=',
            ],
            [
                'code_name'  => 'rireetchansons_chansons_drole',
                'name'       => 'Rire & Chansons Chansons drôles',
                'radio_id'   => 10,
                'url'        => 'https://scdn.nrjaudio.fm/adwz1/fr/56786/aac_64.mp3?origine=playerrire&aw_0_req.userConsentV2=',
            ],

        ];

        for ($i = 0; $i < count($radios); $i++) {
            $this->addSql("INSERT INTO radio_stream (code_name, name, url, radio_id) VALUES ('"
                . $radios[$i]['code_name']."','".$radios[$i]['name']."','".$radios[$i]['url']."',".$radios[$i]['radio_id']. ')');
        }
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
