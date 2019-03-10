<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class SiteControllerTest extends WebTestCase
{
    public function testFaq()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/faq');

        $this->assertEquals(200, $client->getResponse()->getStatusCode());
        $this->assertContains('Foire aux questions', $crawler->filter('h3')->text());

        $this->assertContains('Qu\'est-ce que Programmes-radio.io ?', $crawler->filter('dt')->text());
        $this->assertContains('Programmes-radio.io est un site indépendant centralisant les grilles de programmes des radios françaises.', $crawler->filter('dd')->text());
    }

    public function testSitemap()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/sitemap.xml');

        $this->assertEquals(200, $client->getResponse()->getStatusCode());

        $items = $crawler->filterXPath('//urlset/url/loc')->extract('_text');
        $items2 = $crawler->filterXPath('//urlset/url/lastmod')->extract('_text');
        $this->assertContains('http://localhost/',  $items[0]);
        $this->assertContains(date('Y-m-d'),  $items2[0]);
    }

    public function testContact()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/contact');

        $this->assertEquals(200, $client->getResponse()->getStatusCode());
        $this->assertContains('Contact', $crawler->filter('h3')->text());

        $form = $crawler->selectButton('Envoyer')->form();

        // set some values
        $form['contact[name]'] = 'conradfr';
        $form['contact[message]'] = 'Hey there!';

        // submit the form
        $client->submit($form);
        $crawler = $client->followRedirect();

        $this->assertEquals(200, $client->getResponse()->getStatusCode());
        $this->assertContains('Votre message a bien été envoyé.', $crawler->filter('div.alert-success')->text());
    }
}
