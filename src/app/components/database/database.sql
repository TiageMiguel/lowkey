-- Lowkey Database
-- Tiago Miguel

--
-- Database: `lowkey-db`
--

-- --------------------------------------------------------

--
-- Creation and use of the database
--

CREATE DATABASE `lowkey-db`;
USE `lowkey-db`;

--
-- Table structure `accounts`
--

CREATE TABLE `accounts` (
    `ID`       int(11)      AUTO_INCREMENT,
    `IAN`      varchar(16)  CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
    `NAME`     varchar(40)  COLLATE utf8_unicode_ci NOT NULL,
    `EMAIL`    varchar(100) COLLATE utf8_unicode_ci NOT NULL,
    `PASSWORD` char(60)     COLLATE utf8_unicode_ci NOT NULL,
    `CREATED`  timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `ONLINE`   tinyint(1)   NOT NULL DEFAULT '0',
    `STATUS`   char(1)      NOT NULL DEFAULT '1',
    PRIMARY KEY (`ID`),
    UNIQUE KEY `IAN`   (`IAN`),
    UNIQUE KEY `EMAIL` (`EMAIL`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Table structure `managers`
--

CREATE TABLE `managers` (
    `USER`  int(11) NOT NULL,
    `CLASS` char(1) NOT NULL DEFAULT 'a',
    CONSTRAINT `managers_ibfk_1` FOREIGN KEY (`USER`) REFERENCES `accounts` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Table structure `online`
--

CREATE TABLE `online` (
    `USER`    int(11)      NOT NULL,
    `SOCKET`  varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
    `SESSION` varchar(255) NOT NULL,
    `DATE`    timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `IP`      varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
    `BROWSER` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
    `OS`      varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
    `MOBILE`  tinyint(1)   NOT NULL DEFAULT '0',
    PRIMARY KEY (`USER`, `SOCKET`, `SESSION`),
    CONSTRAINT `online_ibfk_1` FOREIGN KEY (`USER`) REFERENCES `accounts` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Table structure `twofa`
--

CREATE TABLE `twofa` (
    `USER`     int(11) NOT NULL,
    `2FATOKEN` char(9) NOT NULL DEFAULT '000000000',
    PRIMARY KEY (`USER`),
    CONSTRAINT `security_ibfk_1` FOREIGN KEY (`USER`) REFERENCES `accounts` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Table structure `tokens`
--

CREATE TABLE `tokens` (
    `USER`   int(11)     NOT NULL,
    `TOKEN`  varchar(58) DEFAULT NULL,
    `ACTION` char(1)     NOT NULL DEFAULT 'v',
    PRIMARY KEY (`USER`, `ACTION`),
    CONSTRAINT `tokens_ibfk_1` FOREIGN KEY (`USER`) REFERENCES `accounts` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Table structure `friends`
--

CREATE TABLE `friends` (
    `ME`     int(11)   NOT NULL,
    `FRIEND` int(11)   NOT NULL,
    `STATUS` char(1)   NOT NULL DEFAULT '1',
    `TOKEN`  char(60)  COLLATE utf8_unicode_ci NOT NULL,
    `ACTION` int(11)   NOT NULL,
    `SINCE`  timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`ME`,`FRIEND`,`TOKEN`),
    KEY `TOKEN` (`TOKEN`),
    CONSTRAINT `friends_ibfk_1` FOREIGN KEY (`ME`)     REFERENCES `accounts` (`ID`) ON DELETE CASCADE,
    CONSTRAINT `friends_ibfk_2` FOREIGN KEY (`FRIEND`) REFERENCES `accounts` (`ID`) ON DELETE CASCADE,
    CONSTRAINT `friends_ibfk_3` FOREIGN KEY (`ACTION`) REFERENCES `accounts` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Table structure `messages`
--

CREATE TABLE `messages` (
    `ID`      int(11)      AUTO_INCREMENT,
    `SENDER`  int(11)      NOT NULL,
    `MESSAGE` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
    `TOKEN`   char(60)     CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
    `DATE`    timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `EDITED`  tinyint(1)   NOT NULL DEFAULT '0',
    `VISIBLE` tinyint(1)   NOT NULL DEFAULT '1',
    PRIMARY KEY (`ID`),
    CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`SENDER`) REFERENCES `accounts` (`ID`)   ON DELETE CASCADE,
    CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`TOKEN`)  REFERENCES `friends` (`TOKEN`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Table structure `uploads`
--

CREATE TABLE `uploads` (
    `ID`     int(11)      AUTO_INCREMENT,
    `USER`   int(11)      NOT NULL,
    `SOURCE` varchar(255) NOT NULL,
    `NAME`   varchar(255) NOT NULL,
    PRIMARY KEY (`ID`),
    CONSTRAINT `uploads_ibfk_1` FOREIGN KEY (`USER`) REFERENCES `accounts` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Table structure `pictures`
--

CREATE TABLE `pictures` (
    `USER`  int(11) NOT NULL,
    `PHOTO` int(11) NOT NULL,
    PRIMARY KEY (`USER`),
    CONSTRAINT `pictures_ibfk_1` FOREIGN KEY (`USER`) REFERENCES `accounts` (`ID`) ON DELETE CASCADE,
    CONSTRAINT `pictures_ibfk_2` FOREIGN KEY (`PHOTO`) REFERENCES `uploads` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Table structure `files`
--

CREATE TABLE `files` (
    `ID`     int(11)   AUTO_INCREMENT,
    `SENDER` int(11)   NOT NULL,
    `TOKEN`  char(60)  CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
    `FILE`   int(11)   NOT NULL,
    `DATE`   timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`ID`),
    CONSTRAINT `files_ibfk_1` FOREIGN KEY (`SENDER`) REFERENCES `accounts` (`ID`)   ON DELETE CASCADE,
    CONSTRAINT `files_ibfk_2` FOREIGN KEY (`TOKEN`)  REFERENCES `friends` (`TOKEN`) ON DELETE CASCADE,
    CONSTRAINT `files_ibfk_3` FOREIGN KEY (`FILE`)   REFERENCES `uploads` (`ID`)    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------