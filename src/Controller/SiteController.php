<?php

namespace App\Controller;

use App\Entity\Contact;
use Doctrine\ORM\EntityManagerInterface;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

use App\Form\ContactType;

class SiteController extends Controller
{
    /**
     * @Route(
     *     "/faq",
     *     name="faq",
     *     defaults={
     *      "priority": "0.2",
     *      "changefreq": "monthly"
     *      }
     * )
     */
    public function faqAction(Request $request, EntityManagerInterface $em)
    {
        $radios = $em->getRepository('App:Radio')->getActiveRadios();

        return $this->render('default/faq.html.twig', ['radios' => $radios]);
    }

    /**
     * @Route(
     *     "/contact",
     *     name="contact",
     *     defaults={
     *      "priority": "0.1",
     *      "changefreq": "yearly"
     *      }
     * )
     */
    public function contactAction(Request $request, \Swift_Mailer $mailer)
    {
        $contact = new Contact();
        $form = $this->createForm(ContactType::class, $contact);

        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $contact = $form->getData();

            $message = (new \Swift_Message())
                ->setSubject('Contact page')
                ->setFrom('noreply@programmes-radio.io')
                ->setTo('logs@programmes-radio.io')
                ->setBody($this->renderView('default/contactmail.html.twig',
                    [
                        'name' => $contact->getName(),
                        'email' => $contact->getEmail(),
                        'message' => $contact->getMessage()
                    ]
                ),'text/html');

            $mailer->send($message);

            $this->addFlash(
                'success',
                'Votre message a bien été envoyé.'
            );

            return $this->redirectToRoute('contact');
        }

        return $this->render('default/contact.html.twig', ['form' => $form->createView()]);
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
    public function sitemapAction(Request $request, EntityManagerInterface $em)
    {
        // @todo if route list grows, get collection & filter
        $routesToExport = ['homepage', 'now', 'faq', 'contact'];
        $routes = [];
        foreach ($routesToExport as $entry) {
            $routes[$entry] = $this->get('router')->getRouteCollection()->get($entry);
        }

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL
             . '<?xml-stylesheet type="text/xsl" href="/user/plugins/sitemap/sitemap.xsl"?>' . PHP_EOL
             . '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . PHP_EOL;

        foreach ($routes as $name => $route) {
            $xml .= $this->getEntryXml($name, $route);
        }

        // radio/schedule page
        $radios = $em->getRepository('App:Radio')->getAllCodename();

        foreach ($radios as $radio) {
            $xml .= $this->getEntryXml('radio', $this->get('router')->getRouteCollection()->get('radio'),['codename' => $radio]);
        }

        $xml .= '</urlset>';

        $response = new Response($xml);
        $response->headers->set('Content-Type', 'xml');

        return $response;
    }

    protected function getEntryXml($name, $route, $parameters=[]) {
        $lastMod = new \DateTime();
        $lastModFormat = $lastMod->format('Y-m-d');

        return '<url>' . PHP_EOL
            . '<loc>' . $this->generateUrl($name, $parameters, UrlGeneratorInterface::ABSOLUTE_URL) . '</loc>' . PHP_EOL
            . "<lastmod>$lastModFormat</lastmod>" . PHP_EOL
            . '<changefreq>' . $route->getDefaults()['changefreq'] . '</changefreq>' . PHP_EOL
            . '<priority>' . $route->getDefaults()['priority'] . '</priority>' . PHP_EOL
            . '</url>' . PHP_EOL;
    }
}
