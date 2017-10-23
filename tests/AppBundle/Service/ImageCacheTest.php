<?php
declare(strict_types=1);

use AppBundle\Service\ImageCache;
use PHPUnit\Framework\TestCase;

final class ImageCacheTest extends TestCase
{
    protected static $imagesPath;
    protected static $constBasePath;
    protected static $constImagePath;
    protected static $cache;
    protected static $createdDir;

    public static function setUpBeforeClass()
    {
       self::$cache = new ImageCache(dirname(__FILE__));

       $refx = new ReflectionClass(self::$cache);
       self::$constImagePath = $refx->getConstant('IMAGE_PATH');

       $prop = $refx->getProperty('basePath');
       $prop->setAccessible(true);
       self::$constBasePath = $prop->getValue(self::$cache);

       self::$createdDir = substr(self::$cache->getCachePath('void'), 0, -4);
       @mkdir(self::$createdDir, 0777, true);
    }

    public static function removeDirectory($path) {
        $files = glob($path . '/*');
        foreach ($files as $file) {
           if (is_dir($file)) { self::removeDirectory($file); };
        }

        @rmdir($path);
        return;
    }

    public static function tearDownAfterClass()
    {
        self::removeDirectory(dirname(__FILE__));
    }


    public function testGetImageName(): void
    {
        $imageName = self::$cache->getImageName('http://resize3-europe1.ladmedia.fr/r/140,140,FFFFFF,center-middle/img/var/europe1/storage/images/europe1/animateurs/philippe-vandel/43818854-2-fre-FR/Philippe-Vandel.png', 'europe1');

        // assert that your calculator added the numbers correctly!
        $this->assertEquals('europe1_Philippe-Vandel.png', $imageName);
    }

    public function testGetCachePath(): void
    {
        $cachePath = self::$cache->getCachePath('europe1_Philippe-Vandel.png');

        // assert that your calculator added the numbers correctly!
        $this->assertEquals(self::$constBasePath . self::$constImagePath . 'europe1_Philippe-Vandel.png', $cachePath);
    }

    public function testGetCachePathWithSlash(): void
    {
        $cache = new ImageCache('/test/');
        $cachePath = $cache->getCachePath('europe1_Philippe-Vandel.png');

        // assert that your calculator added the numbers correctly!
        $this->assertEquals('/test/' . self::$constImagePath . 'europe1_Philippe-Vandel.png', $cachePath);
    }

    public function testHasCacheWhenFileDoesNotExist(): void
    {
        @unlink(self::$cache->getCachePath('test.png'));

        $hasCache = self::$cache->hasCache('test.png');

        $this->assertFalse($hasCache);
    }

    public function testHasCacheAndFileNotDeletedWhenFileDoesExist(): void
    {
        $file = self::$cache->getCachePath('test.png');
        @file_put_contents($file, 'test');
        touch($file); // now

        $hasCache = self::$cache->hasCache('test.png');

        $this->assertTrue($hasCache);

        $this->assertFileExists($file);

        @unlink($file);
    }

    public function testHasCacheAndFileDeletedWhenTTLisOver(): void
    {
        $file = self::$cache->getCachePath('test.png');
        @file_put_contents($file, 'test');
        touch($file, 1104537600);

        $hasCache = self::$cache->hasCache('test.png');

        $this->assertFalse($hasCache);

        $this->assertFileNotExists($file);
    }

    public function testThumbnailsAreDeleted(): void
    {
        $refx = new ReflectionClass(self::$cache);
        $dirs = $refx->getConstant('THUMBNAIL_PATHS');
        for($i=0;$i<count($dirs);$i++) {
            mkdir(self::$constBasePath . $dirs[$i], 0777, true);
            file_put_contents(self::$constBasePath . $dirs[$i] . 'test.png', 'test');
            $this->assertFileExists(self::$constBasePath . $dirs[$i] . 'test.png');
        }

        self::$cache->deleteThumbnails('test.png');

        for($i=0;$i<count($dirs);$i++) {
            $this->assertFileNotExists(self::$constBasePath . $dirs[$i] . 'test.png');
        }
    }
}
