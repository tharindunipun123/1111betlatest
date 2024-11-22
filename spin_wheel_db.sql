-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 23, 2024 at 04:20 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.0.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `spin_wheel_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `bets`
--

CREATE TABLE `bets` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `round_id` int(11) NOT NULL,
  `bet_amount` decimal(10,2) NOT NULL,
  `bet_multiplier` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bet_history`
--

CREATE TABLE `bet_history` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `round_id` int(11) NOT NULL,
  `winning_multiplier` decimal(10,2) DEFAULT NULL,
  `payout` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bet_history`
--

INSERT INTO `bet_history` (`id`, `user_id`, `round_id`, `winning_multiplier`, `payout`) VALUES
(1, 5, 4, 5.00, 2500.00),
(2, 5, 5, 10.00, 30.00),
(3, 5, 6, 50.00, 400.00),
(4, 5, 7, 5.00, 0.00),
(5, 5, 7, 5.00, 55.00),
(6, 5, 9, 10.00, 40.00),
(7, 5, 9, 5.00, 2500.00),
(8, 5, 10, 5.00, 2625.00),
(9, 5, 10, 5.00, 75.00),
(10, 5, 10, 10.00, 60.00),
(11, 5, 11, 10.00, 180.00);

-- --------------------------------------------------------

--
-- Table structure for table `rounds`
--

CREATE TABLE `rounds` (
  `id` int(11) NOT NULL,
  `round_time` datetime NOT NULL,
  `winning_multiplier` decimal(10,2) DEFAULT NULL,
  `manually_set` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rounds`
--

INSERT INTO `rounds` (`id`, `round_time`, `winning_multiplier`, `manually_set`) VALUES
(1, '2024-09-22 04:30:00', NULL, 0),
(2, '2024-09-22 05:46:51', NULL, 0),
(3, '2024-09-22 05:48:39', 5.00, 0),
(4, '2024-09-22 05:51:39', 10.00, 0),
(5, '2024-09-22 12:21:37', 50.00, 0),
(6, '2024-09-22 12:22:37', 5.00, 0),
(7, '2024-09-22 13:00:37', NULL, 0),
(8, '2024-09-22 13:12:40', NULL, 0),
(9, '2024-09-22 13:23:37', 5.00, 0),
(10, '2024-09-22 13:54:37', 10.00, 0),
(11, '2024-09-22 15:39:42', 30.00, 0),
(12, '2024-09-23 02:31:12', NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `wallet` decimal(10,2) DEFAULT 1000.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password_hash`, `wallet`) VALUES
(1, 'tharindu', '$2a$10$2ra9NA8KPEtCbAoMjjgnBOfKzmoiwA/PWR3UK9bHvUHWbd6FIdAAi', 1000.00),
(5, 'mali', '$2a$10$0LB5qRyvkn9Tdfl5E1cZrefhC50LTu1DUWUrzo9BUpIR5MmeI7pJC', 7864.00);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bets`
--
ALTER TABLE `bets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `round_id` (`round_id`);

--
-- Indexes for table `bet_history`
--
ALTER TABLE `bet_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `round_id` (`round_id`);

--
-- Indexes for table `rounds`
--
ALTER TABLE `rounds`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bets`
--
ALTER TABLE `bets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `bet_history`
--
ALTER TABLE `bet_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `rounds`
--
ALTER TABLE `rounds`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bets`
--
ALTER TABLE `bets`
  ADD CONSTRAINT `bets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `bets_ibfk_2` FOREIGN KEY (`round_id`) REFERENCES `rounds` (`id`);

--
-- Constraints for table `bet_history`
--
ALTER TABLE `bet_history`
  ADD CONSTRAINT `bet_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `bet_history_ibfk_2` FOREIGN KEY (`round_id`) REFERENCES `rounds` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
