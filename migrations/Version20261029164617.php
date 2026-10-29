<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20261029164617 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Populate name_da and name_sv of collection and category';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs

        // code_name => [da, sv], translated from name_fr
        // collections had approximate values ("radioapparater" = radio sets, german-like "Regionalradio" ...)
        $collections = [
            'nationwide' => ['Nationale radiostationer', 'Nationella radiokanaler'],
            'regional' => ['Regionale radiostationer', 'Regionala radiokanaler'],
            'international' => ['Internationale radiostationer', 'Internationella radiokanaler'],
            'favorites' => ['Mine favoritter', 'Mina favoriter'],
            'domtom' => ['Oversøisk Frankrig', 'Utomeuropeiska Frankrike'],
            'local' => ['Lokale radiostationer', 'Lokala radiokanaler'],
            'belgium' => ['Belgien', 'Belgien'],
            'web' => ['DAB+ og web', 'DAB+ och webb'],
            'switzerland' => ['Schweiz', 'Schweiz'],
        ];

        // categories were empty
        $categories = [
            'news_talk' => ['Nyheder & debat', 'Nyheter & samtal'],
            'music' => ['Musik', 'Musik'],
            'culture' => ['Kultur', 'Kultur'],
        ];

        foreach ($collections as $codeName => [$da, $sv]) {
            $this->addSql(
                'UPDATE collection SET name_da = ?, name_sv = ? WHERE code_name = ?',
                [$da, $sv, $codeName]
            );
        }

        foreach ($categories as $codeName => [$da, $sv]) {
            $this->addSql(
                'UPDATE category SET name_da = ?, name_sv = ? WHERE code_name = ?',
                [$da, $sv, $codeName]
            );
        }
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
