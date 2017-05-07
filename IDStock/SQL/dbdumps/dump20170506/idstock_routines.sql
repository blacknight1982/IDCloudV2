CREATE DATABASE  IF NOT EXISTS `idstock` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `idstock`;
-- MySQL dump 10.13  Distrib 5.7.17, for Win64 (x86_64)
--
-- Host: idclouddb.c6plrus4qs6e.us-west-1.rds.amazonaws.com    Database: idstock
-- ------------------------------------------------------
-- Server version	5.6.27-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Temporary view structure for view `company_tickers_ercal`
--

DROP TABLE IF EXISTS `company_tickers_ercal`;
/*!50001 DROP VIEW IF EXISTS `company_tickers_ercal`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `company_tickers_ercal` AS SELECT 
 1 AS `symbol`,
 1 AS `name`,
 1 AS `market_cap`,
 1 AS `ipoyear`,
 1 AS `sector`,
 1 AS `industry`,
 1 AS `erdate`,
 1 AS `erdetails`,
 1 AS `price`,
 1 AS `pe`,
 1 AS `eps`*/;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `company_tickers_ercal`
--

/*!50001 DROP VIEW IF EXISTS `company_tickers_ercal`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`idclouddb`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `company_tickers_ercal` AS select `company_earning_cal`.`symbol` AS `symbol`,`company_tickers`.`name` AS `name`,`company_tickers`.`market_cap` AS `market_cap`,`company_tickers`.`ipoyear` AS `ipoyear`,`company_tickers`.`sector` AS `sector`,`company_tickers`.`industry` AS `industry`,`company_earning_cal`.`erdate` AS `erdate`,`company_earning_cal`.`erdetails` AS `erdetails`,`company_data`.`price` AS `price`,`company_data`.`pe` AS `pe`,`company_data`.`eps` AS `eps` from ((`company_earning_cal` join `company_tickers` on((`company_earning_cal`.`symbol` = `company_tickers`.`symbol`))) join `company_data` on((`company_tickers`.`symbol` = convert(`company_data`.`symbol` using utf8)))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Dumping events for database 'idstock'
--

--
-- Dumping routines for database 'idstock'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2017-05-06 23:24:03
