<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class DefaultControllerTest extends WebTestCase
{
    public function testHome()
    {
        $_SERVER['HTTP_ACCEPT_LANGUAGE'] = 'fr';
        $client = static::createClient();

        $crawler = $client->request('GET', '/');

        $this->assertEquals(200, $client->getResponse()->getStatusCode());
        $this->assertContains('Toutes les grilles radio, tous les programmes et écoute en ligne', $crawler->filter('title')->text());
    }

    public function testHomeEn()
    {
        $_SERVER['HTTP_ACCEPT_LANGUAGE'] = 'en_US';
        $client = static::createClient();

        $crawler = $client->request('GET', '/');

        $this->assertEquals(200, $client->getResponse()->getStatusCode());
        $this->assertContains('Radio schedules in France, streaming and more !', $crawler->filter('title')->text());
    }

    public function testHomeEs()
    {
        $_SERVER['HTTP_ACCEPT_LANGUAGE'] = 'es';
        $client = static::createClient();

        $crawler = $client->request('GET', '/');

        $this->assertEquals(200, $client->getResponse()->getStatusCode());
        $this->assertContains('Toutes les grilles radio, tous les programmes et écoute en ligne', $crawler->filter('title')->text());
    }
}
