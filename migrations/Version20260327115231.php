<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260327115231 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            INSERT INTO public.stream_song (id, code_name)
                SELECT ROW_NUMBER() OVER () + 23, r.code_name
                FROM radio r
                         INNER JOIN radio_stream rs ON rs.radio_id = r.id
                WHERE rs.current_song = true
                  AND r.code_name NOT IN (SELECT code_name FROM public.stream_song)
                GROUP BY r.id;
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
