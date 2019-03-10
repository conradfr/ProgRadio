<?php

namespace App\Doctrine\Functions;

use Doctrine\ORM\Query\AST\Functions\FunctionNode;
use Doctrine\ORM\Query\Parser;
use Doctrine\ORM\Query\Lexer;

class Extract extends FunctionNode
{
    public $firstDateExpression = null;
    public $secondDateExpression = null;

    public function __construct()
    {
        parent::__construct('EXTRACT');
    }

    public function parse(Parser $parser)
    {
        $parser->match(Lexer::T_IDENTIFIER);
        $parser->match(Lexer::T_OPEN_PARENTHESIS);

        $this->firstDateExpression = $parser-> ArithmeticPrimary();

        $parser->match(Lexer::T_COMMA);

        $this->secondDateExpression = $parser->ArithmeticPrimary();

        $parser->match(Lexer::T_CLOSE_PARENTHESIS);
    }

    public function getSql(\Doctrine\ORM\Query\SqlWalker $sqlWalker)
    {
        return "EXTRACT('epoch' FROM "
            . $this->firstDateExpression->dispatch($sqlWalker)
            . ' - '
            . $this->secondDateExpression->dispatch($sqlWalker)
            . ')';
    }
}
