<?php

namespace AppBundle\Service;

/**
 * Class ImageCache
 * @package AppBundle\Service
 *
 * "Dummy" cache for show's pictures & thumbnails
 *
 * Actual image saving is actually done by Guzzle during request for the original file,
 * and LiipImagine for thumbnails
 *
 * Use file creation date to manage TTL and delete accordingly
 */
class ImageCache
{
    protected const IMAGE_PATH = 'web/media/program/';
    protected const THUMBNAIL_PATHS = [
        'web/media/cache/page_thumb/media/program/',
        'web/media/cache/program_thumb/media/program/'
    ];

    protected const CACHE_TTL = 604800; // in seconds = one week

    /** @var string */
    protected $basePath;

    /**
     * @param string $basePath
     */
    public function __construct($basePath)
    {
        $this->basePath = "$basePath/";
    }

    /**
     * Generate unique filename for an image
     * (avoid collision in case of same filename but different radio)
     *
     * @param string $url
     * @param string $radio
     *
     * @return string
     */
    public function getImageName(string $url, string $radio): string
    {
        $urlParts = parse_url($url);
        return $radio . '_' . basename(urldecode($urlParts['path']));
    }

    /**
     * @param string $imageName
     *
     * @return string
     */
    public function getCachePath(string $imageName): string
    {
        return $this->basePath . self::IMAGE_PATH . $imageName;
    }

    /**
     * @param string $imageName
     *
     * @return bool
     */
    public function hasCache(string $imageName): bool
    {
        $filePath = $this->getCachePath($imageName);

        if (file_exists($filePath)) {
            // If TTL is reached invalidate cache by deleting the file
            $createdAt = filemtime($filePath);
            if ((time() - self::CACHE_TTL) > $createdAt) {
                @unlink($filePath);
                return false;
            }

            return true;
        }

        return false;
    }

    /**
     * Triggered by the ImageNew event
     *
     * @param string $imageName
     *
     * @return void
     */
    public function deleteThumbnails(string $imageName): void
    {
        foreach (self::THUMBNAIL_PATHS as $thumbPath) {
            $filePath = $this->basePath . $thumbPath. $imageName;
            if (file_exists($filePath)) {
                @unlink($this->basePath.$thumbPath.$imageName);
            }
        }
    }
}

