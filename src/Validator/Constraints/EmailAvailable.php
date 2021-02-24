<?php

declare(strict_types=1);

namespace App\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

/**
* @Annotation
*/
class EmailAvailable extends Constraint
{
  public string $message = "Cet email n'est pas disponible.";
}
