CREATE 
    ALGORITHM = UNDEFINED 
    DEFINER = `idclouddb`@`%` 
    SQL SECURITY DEFINER
VIEW `industry_stat` AS
    SELECT DISTINCT
        `company_basic_ercal_history`.`industry` AS `industry`,
        ROUND(AVG(`company_basic_ercal_history`.`percent_twoday`),
                2) AS `average_return`,
        ROUND((AVG(`company_basic_ercal_history`.`percent_twoday`) / STD(`company_basic_ercal_history`.`percent_twoday`)),
                2) AS `z_value`,
        COUNT(`company_basic_ercal_history`.`industry`) AS `sample_count`
    FROM
        `company_basic_ercal_history`
    WHERE
        (`company_basic_ercal_history`.`rdate` >= (NOW() - INTERVAL 4 MONTH))
    GROUP BY `company_basic_ercal_history`.`industry`