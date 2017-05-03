CREATE 
    ALGORITHM = UNDEFINED 
    DEFINER = `idclouddb`@`%` 
    SQL SECURITY DEFINER
VIEW `company_tickers_ercal` AS
    SELECT 
        `company_earning_cal`.`symbol` AS `symbol`,
        `company_tickers`.`name` AS `name`,
        `company_tickers`.`market_cap` AS `market_cap`,
        `company_tickers`.`ipoyear` AS `ipoyear`,
        `company_tickers`.`sector` AS `sector`,
        `company_tickers`.`industry` AS `industry`,
        `company_earning_cal`.`erdate` AS `erdate`,
        `company_earning_cal`.`erdetails` AS `erdetails`,
        `company_data`.`price` AS `price`,
        `company_data`.`pe` AS `pe`,
        `company_data`.`eps` AS `eps`
    FROM
        ((`company_earning_cal`
        JOIN `company_tickers` ON ((`company_earning_cal`.`symbol` = `company_tickers`.`symbol`)))
        JOIN `company_data` ON ((`company_tickers`.`symbol` = CONVERT( `company_data`.`symbol` USING UTF8))))