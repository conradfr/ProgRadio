<?php declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20190224195327 extends AbstractMigration
{
    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs

        $this->addSql('alter table schedule_entry alter column title type text using title::text');
        $this->addSql('alter table section_entry alter column title type text using title::text');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs

        $this->addSql('alter table schedule_entry alter column title type varchar(150) using title::varchar(150)');
        $this->addSql('alter table section_entry alter column title type varchar(150) using title::varchar(150)');
    }
}
