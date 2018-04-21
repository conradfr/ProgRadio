<?php

namespace AppBundle\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * RadioRepository
 */
class RadioRepository extends EntityRepository
{
    protected const CACHE_RADIO_TTL = 43200; // half-day

    /**
     * @return array
     */
    public function getRadio($codeName) {
        $query = $this->getEntityManager()->createQuery(
            'SELECT r.codeName as code_name, r.name, r.streamUrl, r.share, c.codeName as category
                FROM AppBundle:Radio r
                  INNER JOIN r.category c
                WHERE r.active = :active
                  AND r.codeName = :codename
            '
        );

        $query->setParameters([
            'active' => true,
            'codename' => $codeName
        ]);

        $result = $query->getOneOrNullResult();

        return $result;
    }

    /**
     * @return array
     */
    public function getActiveRadios() {
        $query = $this->getEntityManager()->createQuery(
            'SELECT r.codeName as code_name, r.name, r.streamUrl, r.share, c.codeName as category
                FROM AppBundle:Radio r
                  INNER JOIN r.category c
                WHERE r.active = :active
            '
        );

        $query->setParameter('active', true);

        $query->useResultCache(true, self::CACHE_RADIO_TTL, 'active_radios');
        $result = $query->getResult();

        return $result;
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
