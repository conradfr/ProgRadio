<?php

$finder = (new PhpCsFixer\Finder())
    ->in(__DIR__)
    ->exclude('var')
;

return (new PhpCsFixer\Config())
    ->setRules([
        '@Symfony' => true,
        'yoda_style' => [
            'equal' => false,       // Disables `if (true === $var)`
            'identical' => false,   // Disables `if (true === $var)`
            'less_and_greater' => false, // Disables `if (5 < $var)`
        ],
        'spacing' => 'one',
    ])
    ->setFinder($finder)
;
