<?php declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20190217105844 extends AbstractMigration implements ContainerAwareInterface
{
    private $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }


    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs

        $this->addSql('INSERT INTO collection (id, code_name, name, priority, sort_field, sort_order) VALUES (2, \'francebleu\', \'France Bleu\', 1, \'code_name\', \'asc\')');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }

    public function postUp(Schema $schema): void
    {
        $connection = $this->container->get('doctrine.orm.entity_manager')->getConnection();

        // RADIOS

        $radios = [
            [
                'codename' => 'francebleu_paris',
                'name' => 'France Bleu Paris',
                'category' => 1,
                'collection' => 2,
                'share' => 0.0,
                'stream' => 'https://direct.francebleu.fr/ts/fb1071-midfi.mp3'
            ],
            [
                'codename' => 'francebleu_nord',
                'name' => 'France Bleu Nord',
                'category' => 1,
                'collection' => 2,
                'share' => 0.0,
                'stream' => 'https://direct.francebleu.fr/ts/fbnord-midfi.mp3'
            ],
            [
                'codename' => 'francebleu_alsace',
                'name' => 'France Bleu Alsace',
                'category' => 1,
                'collection' => 2,
                'share' => 0.0,
                'stream' => 'https://direct.francebleu.fr/ts/fbalsace-midfi.mp3'
            ],
            [
                'codename' => 'francebleu_armorique',
                'name' => 'France Bleu Armorique',
                'category' => 1,
                'collection' => 2,
                'share' => 0.0,
                'stream' => 'https://direct.francebleu.fr/live/fbarmorique-midfi.mp3?ID=radiofrance'
            ],
            [
                'codename' => 'francebleu_auxerre',
                'name' => 'France Bleu Auxerre',
                'category' => 1,
                'collection' => 2,
                'share' => 0.0,
                'stream' => 'https://direct.francebleu.fr/live/fbauxerre-midfi.mp3?ID=radiofrance'
            ],
            [
                'codename' => 'francebleu_azur',
                'name' => 'France Bleu Azur',
                'category' => 1,
                'collection' => 2,
                'share' => 0.0,
                'stream' => 'https://direct.francebleu.fr/live/fbazur-midfi.mp3?ID=radiofrance'
            ],
            [
                'codename' => 'francebleu_bearn',
                'name' => 'France Bleu Béarn',
                'category' => 1,
                'collection' => 2,
                'share' => 0.0,
                'stream' => 'https://direct.francebleu.fr/live/fbbearn-midfi.mp3?ID=radiofrance'
            ]
        ];

        for ($i=0;$i<count($radios);$i++) {
            $connection->exec(
                'INSERT INTO radio (id, category_id, code_name, stream_url, name, share, collection_id) VALUES ('
                .($i+23).','.$radios[$i]['category'].",'".$radios[$i]['codename']."','".$radios[$i]['stream']."','".$radios[$i]['name']."',".$radios[$i]['share'].",".$radios[$i]['collection'].");"
            );
        }
    }
}
