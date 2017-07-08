<?php

namespace AppBundle\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * RadioRepository
 */
class RadioRepository extends EntityRepository
{
    const CACHE_RADIO_TTL = 43200; // half-day
    const CACHE_CATEGORY_TTL = 86400; // day

    /**
     * @return array
     */
    public function getActiveRadios() {
        $query = $this->getEntityManager()->createQuery(
            'SELECT r.codeName as code_name, r.name, c.name as category
                FROM AppBundle:Radio r
                  INNER JOIN r.category c
                WHERE r.active = TRUE
            '
        );

        $query->setResultCacheLifetime(self::CACHE_RADIO_TTL);
        $result = $query->getResult();

        return array_column($result, 'codeName');
    }

    /**
     * @return array
     */
    public function getAllCodename($filterbyActive=true) {
        $queryString = 'SELECT r.codeName' . PHP_EOL
                        . 'FROM AppBundle:Radio r' . PHP_EOL;;

        if ($filterbyActive) {
            $queryString .= ' WHERE r.active = TRUE'.PHP_EOL;
        }

        $query = $this->getEntityManager()->createQuery(
            $queryString
        );

        $query->setResultCacheLifetime(self::CACHE_RADIO_TTL);
        $result = $query->getResult();

       return array_column($result, 'codeName');
    }
}
