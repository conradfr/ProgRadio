<?php

namespace AppBundle\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * RadioRepository
 */
class RadioRepository extends EntityRepository
{
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

        $result = $query->getResult();

       return array_column($result, 'codeName');
    }

    /**
     * @param \DateTime $dateTime
     * @param array $radios array of radio codename, if null get all radios
     *
     * @return array
     */
    public function getDaySchedule(\DateTime $dateTime, array $radios=null)
    {
        $dateTime->setTime('00', '00', '00');
        $dateTimeEnd = clone $dateTime;
        $dateTimeEnd->add(\DateInterval::createfromdatestring('+1 day'));


        $qb = $this->getEntityManager()->createQueryBuilder();
        $qb->select('r.codeName, se.title, se.host,se.description, se.pictureUrl as picture_url, se.dateTimeStart as start_at')
            ->from('AppBundle:ScheduleEntry', 'se')
            ->innerJoin('se.radio', 'r')
            ->where('se.dateTimeStart >= :datetime_start')
            ->andWhere('se.dateTimeStart < :datetime_end ')
            ->andWhere('r.active = :active')
            ->orderBy('se.dateTimeStart', 'ASC')
        ;

        $qb->setParameters([
            'datetime_start' => $dateTime,
            'datetime_end' => $dateTimeEnd,
            'active' => true
        ]);


        if (!empty($radios)) {
            $qb->andWhere('r.codeName IN (:radios)');
            $qb->setParameter('radios', $radios);
        }


        $result = $qb->getQuery()->getResult();

        $export = [];
        foreach ($result as $row) {
            $radio = $row['codeName'];
            unset($row['codeName']);

            $export[$radio][] = $row;
        }

        return $export;
    }
}
