<?php

namespace App\Doctrine\Functions;

use Doctrine\ORM\Query\AST\Functions\FunctionNode;
use Doctrine\ORM\Query\Parser;
use Doctrine\ORM\Query\Lexer;

class Extract extends FunctionNode
{
    public $firstDateExpression;
    public $secondDateExpression;

    public function __construct()
    {
        parent::__construct('EXTRACT');
    }

    /**
     * @param Parser $parser
     *
     * @throws \Doctrine\ORM\Query\QueryException
     */
    public function parse(Parser $parser): void
    {
        $parser->match(Lexer::T_IDENTIFIER);
        $parser->match(Lexer::T_OPEN_PARENTHESIS);

        $this->firstDateExpression = $parser-> ArithmeticPrimary();

        $parser->match(Lexer::T_COMMA);

        $this->secondDateExpression = $parser->ArithmeticPrimary();

        $parser->match(Lexer::T_CLOSE_PARENTHESIS);
    }

    /**
     * @param \Doctrine\ORM\Query\SqlWalker $sqlWalker
     *
     * @return string
     */
    public function getSql(\Doctrine\ORM\Query\SqlWalker $sqlWalker): string
    {
        return "EXTRACT('epoch' FROM "
            . $this->firstDateExpression->dispatch($sqlWalker)
            . ' - '
            . $this->secondDateExpression->dispatch($sqlWalker)
            . ')';
    }
}
