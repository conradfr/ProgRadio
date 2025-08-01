<?php

declare(strict_types=1);

namespace App\Controller\Admin;

use App\Entity\Radio;
use App\Entity\RadioStream;
use App\Entity\SubRadio;
use EasyCorp\Bundle\EasyAdminBundle\Router\AdminUrlGenerator;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use EasyCorp\Bundle\EasyAdminBundle\Config\Dashboard;
use EasyCorp\Bundle\EasyAdminBundle\Config\MenuItem;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractDashboardController;
use Symfony\Component\HttpFoundation\Response;
use EasyCorp\Bundle\EasyAdminBundle\Attribute\AdminDashboard;

#[IsGranted('ROLE_ADMIN')]
#[AdminDashboard(routePath: '/easy-admin', routeName: 'easy_admin')]
class DashboardController extends AbstractDashboardController
{
    public function index(): Response
    {
        return $this->redirectToRoute('easy_admin_radio_stream_index');
    }

    public function configureDashboard(): Dashboard
    {
        return Dashboard::new()
            ->setTitle('Progradio');
    }

    public function configureMenuItems(): iterable
    {
        yield MenuItem::linkToDashboard('Dashboard', 'fa fa-home');
        yield MenuItem::linkToRoute('RadioStream', 'fas fa-list', 'easy_admin_radio_stream_index');
        yield MenuItem::linkToRoute('Radio', 'fas fa-list', 'easy_admin_radio_index');
        yield MenuItem::linkToRoute('SubRadio', 'fas fa-list', 'easy_admin_sub_radio_index');
    }
}
