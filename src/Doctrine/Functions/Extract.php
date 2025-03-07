<?php

declare(strict_types=1);

namespace App\Doctrine\Functions;

use Doctrine\ORM\Query\AST\Functions\FunctionNode;
use Doctrine\ORM\Query\Parser;
use Doctrine\ORM\Query\QueryException;
use Doctrine\ORM\Query\TokenType;

class Extract extends FunctionNode
{
    public $firstDateExpression;
    public $secondDateExpression;

    public function __construct()
    {
        parent::__construct('EXTRACT');
    }

    /**
     * @throws QueryException
     */
    public function parse(Parser $parser): void
    {
        $parser->match(TokenType::T_IDENTIFIER);
        $parser->match(TokenType::T_OPEN_PARENTHESIS);

        $this->firstDateExpression = $parser-> ArithmeticPrimary();

        $parser->match(TokenType::T_COMMA);

        $this->secondDateExpression = $parser->ArithmeticPrimary();

        $parser->match(TokenType::T_CLOSE_PARENTHESIS);
    }

    public function getSql(\Doctrine\ORM\Query\SqlWalker $sqlWalker): string
    {
        return "EXTRACT('epoch' FROM "
            . $this->firstDateExpression->dispatch($sqlWalker)
            . ' - '
            . $this->secondDateExpression->dispatch($sqlWalker)
            . ')';
    }
}
