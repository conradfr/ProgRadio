<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260327185414 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            INSERT INTO public.stream (
                id, img, country_code, name, stream_url, votes, clicks_last_24h, tags,
                stream_song_id, stream_song_code_name, website, enabled, redirect_to,
                playing_error, editing_key, original_stream_url, original_img, original_tags,
                import_updated_at, last_listening_at, force_hls, force_mpd, playing_error_reason,
                source, banned, user_id, created_at, updated_at, score, slogan, description,
                popup, last_overloading_open, checked, force_proxy, own_logo, is_main_radio,
                radio_id, is_sub_radio, sub_radio_id, radio_stream_id, radio_stream_code_name
            )
            SELECT
                gen_random_uuid(),
                NULL,
                r.country_code,
                rs.name,
                rs.url,
                0,
                0,
                NULL,
                CASE WHEN rs.current_song THEN ss.id ELSE NULL END,
                CASE WHEN rs.current_song THEN substr(rs.code_name, length(r.code_name) + 2) ELSE NULL END,
                r.website,
                rs.enabled,
                NULL,
                0,
                NULL,
                rs.url,
                NULL,
                NULL,
                NOW(),
                NULL,
                false,
                false,
                NULL,
                'internal',
                false,
                NULL,
                NOW(),
                NOW(),
                0,
                NULL,
                r.description_fr,
                false,
                NULL,
                NULL,
                false,
                rs.own_logo,
                rs.main,
                r.id,
                rs.sub_radio_id IS NOT NULL,
                rs.sub_radio_id,
                rs.id,
                rs.code_name
            FROM public.radio_stream rs
            JOIN public.radio r ON r.id = rs.radio_id
            LEFT JOIN public.stream_song ss ON ss.code_name = r.code_name AND rs.current_song = true;
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
