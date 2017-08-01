<?php

namespace Application\Migrations;

use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

use AppBundle\Entity\Radio;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20170801125803 extends AbstractMigration implements ContainerAwareInterface
{
    private $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs

    }

    public function postUp(Schema $schema)
    {
        $em = $this->container->get('doctrine.orm.entity_manager');

        // RADIOS

        $radios = [
            [
                'codename' => 'franceinter',
                'name' => 'France Inter',
                'category' => 'news_talk'
            ],
            [
                'codename' => 'franceinfo',
                'name' => 'France Info',
                'category' => 'news_talk'
            ]
        ];

        for ($i=0;$i<count($radios);$i++) {
            $radio = new Radio();

            $radio->setId($i+5);
            $radio->setCodeName($radios[$i]['codename']);
            $radio->setName($radios[$i]['name']);
            $radio->setCategory($em->getRepository('AppBundle\Entity\Category')->findOneByCodeName($radios[$i]['category']));

            $em->persist($radio);

            unset($radio);
        }

        $em->flush();
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
