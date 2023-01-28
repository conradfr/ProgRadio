<?php

namespace App\Doctrine\Functions;

use Doctrine\ORM\Query\AST\Functions\FunctionNode;
use Doctrine\ORM\Query\Parser;
use Doctrine\ORM\Query\Lexer;
use Doctrine\ORM\Query\SqlWalker;

class AtTimeZone extends FunctionNode
{
    public $dateExpression;
    public $timezoneExpression;

    public function __construct()
    {
        parent::__construct('AT_TIME_ZONE');
    }

    /**
     * @throws \Doctrine\ORM\Query\QueryException
     */
    public function parse(Parser $parser): void
    {
        $parser->match(Lexer::T_IDENTIFIER);
        $parser->match(Lexer::T_OPEN_PARENTHESIS);
        $this->dateExpression = $parser->ArithmeticPrimary();
        $parser->match(Lexer::T_COMMA); // (5)
        $this->timezoneExpression = $parser->StringPrimary();
        $parser->match(Lexer::T_CLOSE_PARENTHESIS);
    }

    public function getSql(SqlWalker $sqlWalker): string
    {
        return $this->dateExpression->dispatch($sqlWalker).' AT TIME ZONE ( '
            .$this->timezoneExpression->dispatch($sqlWalker).
            ')';
    }
}
