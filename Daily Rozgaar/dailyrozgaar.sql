-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: dailyrozgaar
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `customerid` int NOT NULL AUTO_INCREMENT,
  `fullName` varchar(50) DEFAULT NULL,
  `phoneNumber` varchar(10) DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `profileImage` varchar(255) DEFAULT NULL,
  `zip` varchar(6) NOT NULL,
  `state` varchar(50) DEFAULT NULL,
  `city` varchar(50) DEFAULT NULL,
  `subdivision` varchar(50) DEFAULT NULL,
  `address1` text NOT NULL,
  PRIMARY KEY (`customerid`),
  UNIQUE KEY `phoneNumber` (`phoneNumber`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (9,'Sunil kumarr','7303611016','official.sunilbaghel@gmail.com','Absus@987','image/profile_images/7303611016.png','201007','Uttar Pradesh','Ghaziabad','Mohan Nagar (Ghaziabad)','1187'),(16,'Tushar kumar','9873178538','tushar@gmail.com','Absus@987','image/profile_images/9873178538.jpg','201007','Uttar Pradesh','Ghaziabad','Mohan Nagar (Ghaziabad)','1185');
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `servicerequests`
--

DROP TABLE IF EXISTS `servicerequests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `servicerequests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customerid` int DEFAULT NULL,
  `workerid` int DEFAULT NULL,
  `status` enum('pending','completed','cancelled') DEFAULT 'pending',
  `requestDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `customerid` (`customerid`),
  KEY `workerid` (`workerid`),
  CONSTRAINT `servicerequests_ibfk_1` FOREIGN KEY (`customerid`) REFERENCES `customers` (`customerid`),
  CONSTRAINT `servicerequests_ibfk_2` FOREIGN KEY (`workerid`) REFERENCES `workers` (`workerid`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `servicerequests`
--

LOCK TABLES `servicerequests` WRITE;
/*!40000 ALTER TABLE `servicerequests` DISABLE KEYS */;
INSERT INTO `servicerequests` VALUES (3,9,65,'completed','2025-01-02 10:13:42'),(4,16,65,'completed','2025-01-02 13:34:25'),(5,9,67,'completed','2025-01-02 14:31:15');
/*!40000 ALTER TABLE `servicerequests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workers`
--

DROP TABLE IF EXISTS `workers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `workers` (
  `workerid` int NOT NULL AUTO_INCREMENT,
  `fullName` varchar(50) DEFAULT NULL,
  `phoneNumber` varchar(10) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `aadhaarNumber` varchar(12) DEFAULT NULL,
  `occupation` varchar(15) DEFAULT NULL,
  `address1` text,
  `zip` varchar(6) DEFAULT NULL,
  `state` varchar(30) DEFAULT NULL,
  `city` varchar(50) DEFAULT NULL,
  `subdivision` varchar(50) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `aadhaarImage` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`workerid`),
  UNIQUE KEY `phoneNumber` (`phoneNumber`)
) ENGINE=InnoDB AUTO_INCREMENT=68 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workers`
--

LOCK TABLES `workers` WRITE;
/*!40000 ALTER TABLE `workers` DISABLE KEYS */;
INSERT INTO `workers` VALUES (65,'Sunil kumar','9873178540','2002-09-12','123694545456','Labour','asasasasa','201007','Uttar Pradesh','Ghaziabad','Mohan Nagar (Ghaziabad)','image/profile_images/9873178540.png','image/aadhaar_cards/9873178540.png','123620009873'),(66,'Sunil kumar','9873178525','2000-05-12','123694545456','Labour','1185','201007','Uttar Pradesh','Ghaziabad','Mohan Nagar (Ghaziabad)','image/profile_images/9873178525.jpg','image/aadhaar_cards/9873178525.png','123620009873'),(67,'vikas','9873178515','2002-05-12','123694545456','Labour','1185','201007','Uttar Pradesh','Ghaziabad','Mohan Nagar (Ghaziabad)','image/profile_images/9873178516.png','image/aadhaar_cards/9873178516.png','123620029873');
/*!40000 ALTER TABLE `workers` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-01-02 20:49:06
