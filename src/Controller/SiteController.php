<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Collection;
use App\Entity\Contact;
use App\Entity\Radio;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\Routing\Route as RouteObject;
use App\Form\ContactType;

class SiteController extends AbstractController
{
    protected const LANG = ['fr', 'en'];

    /**
     * @Route(
     *     "/faq",
     *     name="faq_legacy"
     * )
     */
    public function faq_legacy(EntityManagerInterface $em, Request $request): RedirectResponse
    {
        return $this->redirectToRoute('faq', ['_locale' => 'fr'], 301);
    }

    /**
     * @Route(
     *     "/{_locale}/faq",
     *     name="faq",
     *     defaults={
     *      "priority": "0.2",
     *      "changefreq": "monthly"
     *      }
     * )
     */
    public function faq
    (EntityManagerInterface $em, Request $request): Response
    {
        $favorites = $request->attributes->get('favorites', []);
        $radios = $em->getRepository(Radio::class)->getActiveRadios($favorites);
        $collections = $em->getRepository(Collection::class)->getCollections($favorites);

        return $this->render('default/faq.html.twig',
            [
                'radios' => $radios,
                'collections' => $collections
            ]
        );
    }

    /**
     * @Route(
     *     "/{_locale}/contact",
     *     name="contact",
     *     defaults={
     *      "priority": "0.1",
     *      "changefreq": "yearly"
     *      }
     * )
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse|Response
     */
    public function contact(MailerInterface $mailer, Request $request)
    {
        $contact = new Contact();
        $form = $this->createForm(ContactType::class, $contact);

        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $contact = $form->getData();

            $email = (new TemplatedEmail())
                ->from('noreply@programmes-radio.io')
                ->to('contact@programmes-radio.io')
                ->subject('Contact page')
                ->htmlTemplate('emails/contact.html.twig')
                ->context([
                    'name' => $contact->getName(),
                    'contact_email' => $contact->getEmail(),
                    'message' => $contact->getMessage()
                ]);

            $mailer->send($email);

            $this->addFlash(
                'success',
                'Votre message a bien été envoyé.'
            );

            return $this->redirectToRoute('contact');
        }

        return $this->render('default/contact.html.twig', ['form' => $form->createView()]);
    }

    /**
     * @Route(
     *     "/{_locale}/legal",
     *     name="legal",
     *     defaults={
     *      "priority": "0.1",
     *      "changefreq": "yearly"
     *      }
     * )
     */
    public function legal(): Response
    {
        return $this->render('default/legal.html.twig', []);
    }

    /**
     * Simple sitemap generator
     *
     * Doesn't use the serializer.
     * While it would have looked cleaner it seems too much work to override full xml output.
     *
     * @Route(
     *     "/sitemap.{_format}",
     *     defaults={"_format": "xml"},
     *     requirements={
     *         "_format": "xml"
     *     }
     * )
     */
    public function sitemap(EntityManagerInterface $em): Response
    {
        // @todo if route list grows, get collection & filter
        $routesToExport = ['app', 'now', 'faq', 'contact'];
        $routes = [];
        foreach ($routesToExport as $entry) {
            $routes[$entry] = $this->get('router')->getRouteCollection()->get($entry);
        }

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL
             . '<?xml-stylesheet type="text/xsl" href="/user/plugins/sitemap/sitemap.xsl"?>' . PHP_EOL
             . '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . PHP_EOL;

        foreach (self::LANG as $locale) {
            foreach ($routes as $name => $route) {
                $xml .= $this->getEntryXml($name, $route, $locale);
            }

            // radio/schedule page
            $radios = $em->getRepository(Radio::class)->getAllCodename();

            $savedRouteAppDefault = $this->get('router')->getRouteCollection()->get('radio')->getDefaults();
            foreach ($radios as $radio) {
                $xml .= $this->getEntryXml('radio', $this->get('router')->getRouteCollection()->get('radio'), $locale,  ['codename' => $radio]);
                // spa radio page
                $routeApp = $this->get('router')->getRouteCollection()->get('radio')->addDefaults(['bangs' => 'radio/' . $radio]);
                $xml .= $this->getEntryXml('app', $routeApp, $locale);
                $this->get('router')->getRouteCollection()->get('radio')->setDefaults($savedRouteAppDefault);
            }
        }

        $xml .= '</urlset>';

        $response = new Response($xml);
        $response->headers->set('Content-Type', 'xml');

        return $response;
    }

    /**
     * @throws \Exception
     */
    protected function getEntryXml(string $name, RouteObject $route, string $locale, array $parameters=[]): string
    {
        $lastMod = new \DateTime();
        $lastModFormat = $lastMod->format('Y-m-d');

        $parameters['_locale'] = $locale;

        $bangs = isset($route->getDefaults()['bangs']) ? explode(',', $route->getDefaults()['bangs']) : [''] ;

        $entries = '';
        foreach ($bangs as $bang) {
            $url = $this->generateUrl($name, $parameters, UrlGeneratorInterface::ABSOLUTE_URL);
            if ($bang !== '') {
                $url .= '#/' . $bang;
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
