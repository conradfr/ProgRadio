<?php

declare(strict_types=1);

use Rector\CodeQuality\Rector\Class_\InlineConstructorDefaultToPropertyRector;
use Rector\Config\RectorConfig;
use Rector\Set\ValueObject\LevelSetList;
use Rector\Set\ValueObject\SetList;
use Rector\Doctrine\Set\DoctrineSetList;
use Rector\Symfony\Set\SensiolabsSetList;
use Rector\Symfony\Set\SymfonySetList;

return static function (RectorConfig $rectorConfig): void {
    $rectorConfig->paths([
        __DIR__ . '/config',
        //__DIR__ . '/node_modules',
        //__DIR__ . '/public',
        __DIR__ . '/src',
        //__DIR__ . '/tests',
    ]);

    // register a single rule
    $rectorConfig->rule(InlineConstructorDefaultToPropertyRector::class);

    $rectorConfig->sets([
        //LevelSetList::UP_TO_PHP_81,
        //DoctrineSetList::ANNOTATIONS_TO_ATTRIBUTES,
        //SymfonySetList::ANNOTATIONS_TO_ATTRIBUTES,
        //SensiolabsSetList::FRAMEWORK_EXTRA_61,
        SetList::DEAD_CODE
    ]);

    // define sets of rules
    //    $rectorConfig->sets([
    //        LevelSetList::UP_TO_PHP_80
    //    ]);
};
