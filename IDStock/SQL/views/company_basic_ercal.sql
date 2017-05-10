CREATE 
    ALGORITHM = UNDEFINED 
    DEFINER = `idclouddb`@`%` 
    SQL SECURITY DEFINER
VIEW `company_basic_ercal` AS
    SELECT 
        `company_earning_cal`.`symbol` AS `symbol`,
        `company_basic`.`name` AS `name`,
        `company_basic`.`market_cap` AS `market_cap`,
        `company_basic`.`ipoyear` AS `ipoyear`,
        `company_basic`.`sector` AS `sector`,
        `company_basic`.`industry` AS `industry`,
        `company_earning_cal`.`erdate` AS `erdate`,
        `company_earning_cal`.`erdetails` AS `erdetails`,
        `company_data`.`price` AS `price`,
        `company_data`.`pe` AS `pe`,
        `company_data`.`eps` AS `eps`,
        `industry_stat`.`average_return` AS `industry_return`,
        `industry_stat`.`z_value` AS `z_val`,
        `industry_stat`.`sample_count` AS `sample_count`
    FROM
        (((`company_earning_cal`
        JOIN `company_basic` ON ((`company_earning_cal`.`symbol` = `company_basic`.`symbol`)))
        JOIN `company_data` ON ((`company_basic`.`symbol` = CONVERT( `company_data`.`symbol` USING UTF8))))
        JOIN `industry_stat` ON ((`industry_stat`.`industry` = `company_basic`.`industry`)))