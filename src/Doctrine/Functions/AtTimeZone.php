<?php

declare(strict_types=1);

namespace App\Doctrine\Functions;

use Doctrine\ORM\Query\AST\Functions\FunctionNode;
use Doctrine\ORM\Query\Parser;
use Doctrine\ORM\Query\QueryException;
use Doctrine\ORM\Query\SqlWalker;
use Doctrine\ORM\Query\TokenType;

class AtTimeZone extends FunctionNode
{
    public $dateExpression;
    public $timezoneExpression;

    public function __construct()
    {
        parent::__construct('AT_TIME_ZONE');
    }

    /**
     * @throws QueryException
     */
    public function parse(Parser $parser): void
    {
        $parser->match(TokenType::T_IDENTIFIER);
        $parser->match(TokenType::T_OPEN_PARENTHESIS);
        $this->dateExpression = $parser->ArithmeticPrimary();
        $parser->match(TokenType::T_COMMA); // (5)
        $this->timezoneExpression = $parser->StringPrimary();
        $parser->match(TokenType::T_CLOSE_PARENTHESIS);
    }

    public function getSql(SqlWalker $sqlWalker): string
    {
        return $this->dateExpression->dispatch($sqlWalker).' AT TIME ZONE ( '
            .$this->timezoneExpression->dispatch($sqlWalker).
            ')';
    }
}
