<?php

namespace App\Doctrine\Functions;

use Doctrine\ORM\Query\AST\Functions\FunctionNode;
use Doctrine\ORM\Query\Parser;
use Doctrine\ORM\Query\Lexer;
use Doctrine\ORM\Query\SqlWalker;

class Timezone extends FunctionNode
{
    public $dateExpression;
    public $timezoneExpression;

    public function __construct()
    {
        parent::__construct('TIMEZONE');
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
        $this->dateExpression = $parser->ArithmeticPrimary();
        $parser->match(Lexer::T_COMMA); // (5)
        $this->timezoneExpression = $parser->StringPrimary();
        $parser->match(Lexer::T_CLOSE_PARENTHESIS);
    }

    /**
     * @param SqlWalker $sqlWalker
     *
     * @return string
     */
    public function getSql(SqlWalker $sqlWalker): string
    {
        return 'TIMEZONE(' . $this->dateExpression->dispatch($sqlWalker) . ', '
            . $this->timezoneExpression->dispatch($sqlWalker) . ')';
    }
}
