<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Stream;
use App\Entity\StreamSuggestion;
use Doctrine\ORM\EntityRepository;

class StreamSuggestionRepository extends EntityRepository
{
    public function getSuggestions()
    {
        $qb = $this->getEntityManager()->createQueryBuilder();

        $qb->select('ss.id, s.name, s.id as stream_id, ss.createdAt')
            ->from(StreamSuggestion::class, 'ss')
            ->innerJoin('ss.stream', 's');

        return $qb->getQuery()->getResult();
    }
}
