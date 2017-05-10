CREATE 
    ALGORITHM = UNDEFINED 
    DEFINER = `idclouddb`@`%` 
    SQL SECURITY DEFINER
VIEW `industry_stat` AS
    SELECT DISTINCT
        `company_basic_ercal_history`.`industry` AS `industry`,
        AVG(`company_basic_ercal_history`.`percent_twoday`) AS `average_return`,
        (AVG(`company_basic_ercal_history`.`percent_twoday`) / STD(`company_basic_ercal_history`.`percent_twoday`)) AS `z_value`,
        COUNT(`company_basic_ercal_history`.`industry`) AS `sample_count`
    FROM
        `company_basic_ercal_history`
    GROUP BY `company_basic_ercal_history`.`industry`