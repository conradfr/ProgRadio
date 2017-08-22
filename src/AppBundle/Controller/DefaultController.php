<?php

namespace AppBundle\Controller;

use AppBundle\Service\ScheduleManager;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

class DefaultController extends Controller
{
    /**
     * @Route(
     *     "/",
     *     name="homepage",
     *     defaults={
     *      "priority": "1.0",
     *      "changefreq": "daily"
     *      }
     * )
     */
    public function indexAction(Request $request)
    {
        $em = $this->get('doctrine')->getManager();

        $radios = $em->getRepository('AppBundle:Radio')->getActiveRadios();

        $scheduleManager = $this->get(ScheduleManager::class);
        $schedule = $scheduleManager->getDaySchedule(new \DateTime());

        return $this->render('default/index.html.twig', [
            'schedule' => $schedule,
            'radios' => $radios
        ]);
    }

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
    public function faqAction(Request $request)
    {
        return $this->render('default/faq.html.twig', []);
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
    public function sitemapAction(Request $request)
    {
        // @todo if route list grows, get collection & filter
        $routesToExport = ['homepage'];
        $routes = [];
        foreach ($routesToExport as $entry) {
            $routes[$entry] = $this->get('router')->getRouteCollection()->get($entry);
        }

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL
             . '<?xml-stylesheet type="text/xsl" href="/user/plugins/sitemap/sitemap.xsl"?>' . PHP_EOL
             . '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . PHP_EOL;

        foreach ($routes as $name => $route) {
            $lastMod = new \DateTime();
            $lastModFormat = $lastMod->format('Y-m-d');

            $xml .= '<url>' . PHP_EOL
                . '<loc>' . $this->generateUrl($name, [], UrlGeneratorInterface::ABSOLUTE_URL) . '</loc>' . PHP_EOL
                . '<lastmod>' . $lastModFormat . '</lastmod>' . PHP_EOL
                . '<changefreq>' . $route->getDefaults()['changefreq'] . ' </changefreq>' . PHP_EOL
                . '<priority>' . $route->getDefaults()['priority'] . '</priority>' . PHP_EOL
                . '</url>' . PHP_EOL;
        }

        $xml .= '</urlset>';

        $response = new Response($xml);
        $response->headers->set('Content-Type', 'xml');

        return $response;
    }
}
