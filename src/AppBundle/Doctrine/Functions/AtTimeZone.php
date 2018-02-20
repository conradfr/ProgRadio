<?php

namespace AppBundle\Doctrine\Functions;

use Doctrine\ORM\Query\AST\Functions\FunctionNode;
use Doctrine\ORM\Query\Parser;
use Doctrine\ORM\Query\Lexer;
use Doctrine\ORM\Query\SqlWalker;

class AtTimeZone extends FunctionNode
{
    public $dateExpression = null;
    public $timezoneExpression = null;

    public function __construct()
    {
        $this->name = 'AT_TIME_ZONE';
    }

    public function parse(Parser $parser)
    {
        $parser->match(Lexer::T_IDENTIFIER); // (2)
        $parser->match(Lexer::T_OPEN_PARENTHESIS); // (3)
        $this->dateExpression = $parser->ArithmeticPrimary(); // (4)
        $parser->match(Lexer::T_COMMA); // (5)
        $this->timezoneExpression = $parser->StringPrimary(); // (6)
        $parser->match(Lexer::T_CLOSE_PARENTHESIS); // (3)
    }

    public function getSql(SqlWalker $sqlWalker)
    {
        return $this->dateExpression->dispatch($sqlWalker).' AT TIME ZONE ( '
            .$this->timezoneExpression->dispatch($sqlWalker).
            ')';
    }
}
