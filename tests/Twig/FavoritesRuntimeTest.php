<?php
namespace App\Tests\Twig;

use App\Twig\ReleaseVersion;
use PHPUnit\Framework\TestCase;

class FavoritesRuntimeTest extends TestCase
{
    public function testHasRelaseVersion()
    {
        $releaseVersion = new ReleaseVersion();
        $_SERVER['SCRIPT_FILENAME'] = '/var/www/progradio/releases/123456/public/index.php';
        $result = $releaseVersion->releaseVersion();

        $this->assertEquals(123456, $result);
    }

    public function testHasNoReleaseVersion()
    {
        $releaseVersion = new ReleaseVersion();
        $_SERVER['SCRIPT_FILENAME'] = '/var/www/progradio/public/index.php';
        $result = $releaseVersion->releaseVersion();

        $this->assertEquals('progradio', $result);
    }
}
