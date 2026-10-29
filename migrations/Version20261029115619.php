<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20261029115619 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add name_ru, name_he and name_bg to collection and category';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE collection ADD name_RU VARCHAR(100), ADD name_HE VARCHAR(100), ADD name_BG VARCHAR(100)');
        $this->addSql('ALTER TABLE category ADD name_RU VARCHAR(100), ADD name_HE VARCHAR(100), ADD name_BG VARCHAR(100)');

        // code_name => [ru, he, bg], translated from name_fr
        $collections = [
            'nationwide' => ['Общенациональные радиостанции', 'תחנות רדיו ארציות', 'Национални радиостанции'],
            'regional' => ['Региональные радиостанции', 'תחנות רדיו אזוריות', 'Регионални радиостанции'],
            'international' => ['Международные радиостанции', 'תחנות רדיו בינלאומיות', 'Международни радиостанции'],
            'favorites' => ['Моё избранное', 'המועדפים שלי', 'Моите любими'],
            'domtom' => ['Заморская Франция', 'צרפת שמעבר לים', 'Отвъдморска Франция'],
            'local' => ['Местные радиостанции', 'תחנות רדיו מקומיות', 'Местни радиостанции'],
            'belgium' => ['Бельгия', 'בלגיה', 'Белгия'],
            'web' => ['DAB+ и веб', 'DAB+ ואינטרנט', 'DAB+ и уеб'],
            'switzerland' => ['Швейцария', 'שווייץ', 'Швейцария'],
        ];

        $categories = [
            'news_talk' => ['Новостные и разговорные', 'חדשות ושיחות', 'Новинарски и говорни'],
            'music' => ['Музыкальные', 'מוזיקה', 'Музикални'],
            'culture' => ['Культура', 'תרבות', 'Култура'],
        ];

        foreach ($collections as $codeName => [$ru, $he, $bg]) {
            $this->addSql(
                'UPDATE collection SET name_ru = ?, name_he = ?, name_bg = ? WHERE code_name = ?',
                [$ru, $he, $bg, $codeName]
            );
        }

        foreach ($categories as $codeName => [$ru, $he, $bg]) {
            $this->addSql(
                'UPDATE category SET name_ru = ?, name_he = ?, name_bg = ? WHERE code_name = ?',
                [$ru, $he, $bg, $codeName]
            );
        }

        // wrong existing values: "Huisartsen" (= general practitioners), "Muziek-", "Zwitsers" (= Swiss), en left in french
        $fixes = [
            ['category', 'news_talk', 'News & Talk', 'Nieuws & talk'],
            ['category', 'music', 'Music', 'Muziek'],
            ['collection', 'switzerland', null, 'Zwitserland'],
        ];

        foreach ($fixes as [$table, $codeName, $en, $nl]) {
            if ($en !== null) {
                $this->addSql("UPDATE $table SET name_en = ? WHERE code_name = ?", [$en, $codeName]);
            }

            $this->addSql("UPDATE $table SET name_nl = ? WHERE code_name = ?", [$nl, $codeName]);
        }
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
