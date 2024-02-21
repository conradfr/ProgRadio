<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Collection;
use App\Entity\Contact;
use App\Entity\Radio;
use App\Service\Host;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Contracts\Translation\TranslatorInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\Routing\Route as RouteObject;
use App\Form\ContactType;

class SiteController extends AbstractController
{
   final public const LANG = ['fr', 'en', 'es', 'de', 'pt', 'it', 'pl', 'el', 'ar', 'ro'];

    #[
        Route('/{_locale}/faq',
            name: 'faq_radio_addict',
            host: '{subdomain}.radio-addict.com',
            requirements: ['subdmain' => 'www|local'],
            defaults: [
                'subdomain' => ['subdomain' => 'www'],
                'priority' => '0.2',
                'changefreq' => 'monthly'
            ]
        )
    ]
    public function faqRadioAddict(): Response
    {
        return $this->render('default/faq_radio_addict.html.twig', []);
    }

    #[
        Route('/{_locale}/faq',
            name: 'faq',
            defaults: [
                'priority' => '0.2',
                'changefreq' => 'monthly'
            ]
        )
    ]
    public function faq(EntityManagerInterface $em, Request $request): Response
    {
        $favorites = $request->attributes->get('favorites', []);
        $radios = $em->getRepository(Radio::class)->getActiveRadios();
        $collections = $em->getRepository(Collection::class)->getCollections($favorites);

        return $this->render('default/faq.html.twig',
            [
                'radios' => $radios,
                'collections' => $collections,
            ]
        );
    }

    #[
        Route('/{_locale}/contact',
            name: 'contact',
            defaults: [
                'priority' => '0.1',
                'changefreq' => 'yearly'
            ]
        )
    ]
    public function contact(MailerInterface $mailer, TranslatorInterface $translator, Host $host, Request $request): \Symfony\Component\HttpFoundation\RedirectResponse|Response
    {
        $contact = new Contact();

        $form = $this->createForm(ContactType::class, $contact);

        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $contact = $form->getData();

            $email = (new TemplatedEmail())
                ->from($_ENV['EMAIL_FROM'])
                ->to($_ENV['EMAIL_TO'])
                ->subject('Contact page')
                ->htmlTemplate('emails/contact.html.twig')
                ->context([
                    'name' => $contact->getName(),
                    'contact_email' => $contact->getEmail(),
                    'site' => $host->getRootDomain($request),
                    'message' => $contact->getMessage(),
                ]);

            $mailer->send($email);

            $this->addFlash(
                'success',
                $translator->trans('page.contact.sent')
            );

            return $this->redirectToRoute('contact');
        }

        return $this->render('default/contact.html.twig', ['form' => $form->createView()]);
    }

    #[
        Route('/{_locale}/legal',
            name: 'legal',
            defaults: [
                'priority' => '0.1',
                'changefreq' => 'yearly'
            ]
        )
    ]
    public function legal(): Response
    {
        return $this->render('default/legal.html.twig', []);
    }

    #[Route('/ads.txt', stateless: true)]
    public function adsTxt(EntityManagerInterface $em): Response
    {
        $txt = 'google.com, ' .  getenv('ADSENSE_KEY') .', DIRECT, f08c47fec0942fa0';
        $response = new Response($txt);
        $response->headers->set('Content-Type', 'text/plain');
        return $response;
    }

    #[Route('/app-ads.txt', stateless: true)]
    public function appAdsTxt(EntityManagerInterface $em): Response
    {
        $txt = 'google.com, ' .  getenv('ADMOB_KEY') .', DIRECT, f08c47fec0942fa0';
        $response = new Response($txt);
        $response->headers->set('Content-Type', 'text/plain');
        return $response;
    }

    /*
     * Simple sitemap generator
     *
     * Doesn't use the serializer.
     * While it would have looked cleaner it seems too much work to override full xml output.
     *
     */
    #[
        Route('/sitemap.{_format}',
            stateless: true,
            requirements: ['_format' => "xml"]
        )
    ]
    public function sitemap(Host $host, RouterInterface $router, Request $request, EntityManagerInterface $em): Response
    {
        // @todo move to service

        // @todo if route list grows, get collection & filter
        $routesToExport = $host->isProgRadio($request) === true ? ['app', 'now', 'faq', 'contact'] : ['app', 'faq', 'contact'];
        $routes = [];

        foreach ($routesToExport as $entry) {
            $routes[$entry] = $router->getRouteCollection()->get($entry);
        }

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL
             . '<?xml-stylesheet type="text/xsl" href="/user/plugins/sitemap/sitemap.xsl"?>' . PHP_EOL
             . '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . PHP_EOL;

        foreach (self::LANG as $locale) {
            foreach ($routes as $name => $route) {
                $xml .= $this->getEntryXml($host, $request, $name, $route, $locale);
            }

            // radio/schedule page
            if ($host->isProgRadio($request) === true) {
                $radios = $em->getRepository(Radio::class)->getAllCodename();

                $savedRouteAppDefault = $router->getRouteCollection()->get('radio.'.$locale)->getDefaults();
                /** @var Radio $radio */
                foreach ($radios as $radio => $subRadiosString) {
                    $subRadios = explode(',', (string) $subRadiosString);
                    $xml .= $this->getEntryXml($host, $request,'radio', $router->getRouteCollection()->get('radio.'.$locale), $locale,  ['codeName' => $radio]);

                    if (count($subRadios) > 1) {
                        foreach ($subRadios as $subRadio) {
                            $xml .= $this->getEntryXml($host, $request,'radio_subradio', $router->getRouteCollection()->get('radio.'.$locale), $locale,  ['codeName' => $radio, 'subRadioCodeName' => $subRadio]);
                        }
                    }

                    // spa radio page
                    $routeApp = $router->getRouteCollection()->get('radio.'.$locale)->addDefaults(['bangs' => 'radio/' . $radio]);
                    $xml .= $this->getEntryXml($host, $request,'app', $routeApp, $locale);
                    $router->getRouteCollection()->get('radio.'.$locale)->setDefaults($savedRouteAppDefault);
                }
            }

            // @todo add streams
        }

        $xml .= '</urlset>';

        $response = new Response($xml);
        $response->headers->set('Content-Type', 'xml');

        return $response;
    }

    /**
     * @throws \Exception
     */
    protected function getEntryXml(Host $host, Request $request, string $name, RouteObject $route, string $locale, array $parameters=[]): string
    {
        $lastMod = new \DateTime();
        $lastModFormat = $lastMod->format('Y-m-d');

        $parameters['_locale'] = $locale;

        $bangsAll = $host->getField('bangs', $request);
        $bangs = $bangsAll[$name] ?? [''] ;

        $entries = '';
        foreach ($bangs as $bang) {
            $url = $this->generateUrl($name, $parameters, UrlGeneratorInterface::ABSOLUTE_URL);
            if ($bang !== '') {
                $url .= $bang;
            }

            $entries .= '<url>' . PHP_EOL
                . '<loc>' . $url . '</loc>' . PHP_EOL
                . "<lastmod>$lastModFormat</lastmod>" . PHP_EOL
                . '<changefreq>' . $route->getDefaults()['changefreq'] . '</changefreq>' . PHP_EOL
                . '<priority>' . $route->getDefaults()['priority'] . '</priority>' . PHP_EOL
                . '</url>' . PHP_EOL;
        }

        return $entries;
    }
}
