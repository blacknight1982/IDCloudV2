CREATE 
    ALGORITHM = UNDEFINED 
    DEFINER = `idclouddb`@`%` 
    SQL SECURITY DEFINER
VIEW `company_basic_ercal_history` AS
    SELECT 
        `company_ercal_history`.`rdate` AS `rdate`,
        `company_ercal_history`.`symbol` AS `symbol`,
        `company_basic`.`name` AS `name`,
        `company_basic`.`sector` AS `sector`,
        `company_basic`.`market_cap` AS `market_cap`,
        `company_ercal_history`.`eps` AS `eps`,
        `company_ercal_history`.`epsf` AS `epsf`,
        `company_ercal_history`.`surprise` AS `surprise`,
        `company_ercal_history`.`price_preer` AS `price_preer`,
        `company_ercal_history`.`price_erday` AS `price_erday`,
        `company_ercal_history`.`price_next` AS `price_next`,
        (((`company_ercal_history`.`price_erday` / `company_ercal_history`.`price_preer`) - 1) * 100) AS `percent_day1`,
        (((`company_ercal_history`.`price_next` / `company_ercal_history`.`price_erday`) - 1) * 100) AS `percent_day2`,
        (((`company_ercal_history`.`price_next` / `company_ercal_history`.`price_preer`) - 1) * 100) AS `percent_twoday`
    FROM
        (`company_ercal_history`
        JOIN `company_basic` ON ((CONVERT( `company_ercal_history`.`symbol` USING UTF8) = `company_basic`.`symbol`)))