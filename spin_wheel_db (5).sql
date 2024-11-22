-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 07, 2024 at 12:29 AM
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
-- Table structure for table `betting_results`
--

CREATE TABLE `betting_results` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `round` int(11) NOT NULL,
  `multiplier` float NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `betting_results`
--

INSERT INTO `betting_results` (`id`, `userId`, `round`, `multiplier`, `amount`, `created_at`) VALUES
(1, 7, 1, 2, 20.00, '2024-10-06 20:51:24'),
(2, 7, 1, 4, 20.00, '2024-10-06 20:51:27'),
(3, 7, 1, 5, 20.00, '2024-10-06 20:51:30'),
(4, 7, 1, 7, 20.00, '2024-10-06 20:51:33'),
(5, 7, 1, 10, 20.00, '2024-10-06 20:51:35'),
(6, 7, 1, 20, 20.00, '2024-10-06 20:51:38'),
(7, 7, 2, 4, 50.00, '2024-10-06 20:52:32'),
(8, 7, 2, 5, 50.00, '2024-10-06 20:52:36'),
(9, 7, 3, 2, 200.00, '2024-10-06 20:54:01'),
(10, 7, 3, 4, 100.00, '2024-10-06 20:54:04'),
(11, 7, 3, 7, 200.00, '2024-10-06 20:54:07');

-- --------------------------------------------------------

--
-- Table structure for table `manual_set`
--

CREATE TABLE `manual_set` (
  `id` int(11) NOT NULL,
  `round_number` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rounds`
--

CREATE TABLE `rounds` (
  `id` int(11) NOT NULL,
  `round_number` int(11) NOT NULL,
  `updated_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `winning_multiplier` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rounds`
--

INSERT INTO `rounds` (`id`, `round_number`, `updated_time`, `winning_multiplier`) VALUES
(1, 1, '2024-10-06 20:50:44', 2),
(2, 2, '2024-10-06 20:52:08', 5),
(3, 3, '2024-10-06 20:53:32', 5),
(4, 4, '2024-10-06 20:54:56', 20),
(5, 5, '2024-10-06 20:56:21', 7),
(6, 6, '2024-10-06 20:57:45', 20),
(7, 7, '2024-10-06 20:59:09', 7),
(8, 8, '2024-10-06 21:00:33', 10),
(9, 9, '2024-10-06 21:01:57', 7),
(10, 10, '2024-10-06 21:03:21', 20),
(11, 11, '2024-10-06 21:04:46', 10),
(12, 12, '2024-10-06 21:06:10', 20),
(13, 13, '2024-10-06 21:07:34', 7),
(14, 14, '2024-10-06 21:08:58', 10),
(15, 15, '2024-10-06 21:10:23', 20),
(16, 16, '2024-10-06 21:11:47', 20),
(17, 17, '2024-10-06 21:13:11', 20),
(18, 18, '2024-10-06 21:14:35', 10),
(19, 19, '2024-10-06 21:16:00', 10),
(20, 20, '2024-10-06 21:17:24', 20),
(21, 21, '2024-10-06 21:18:48', 10),
(22, 22, '2024-10-06 21:20:12', 10),
(23, 23, '2024-10-06 21:21:37', 7),
(24, 24, '2024-10-06 21:23:01', 20),
(25, 25, '2024-10-06 21:24:25', 20),
(26, 26, '2024-10-06 21:25:50', 7),
(27, 27, '2024-10-06 21:27:14', 7),
(28, 28, '2024-10-06 21:28:38', 7),
(29, 29, '2024-10-06 21:30:02', 10),
(30, 30, '2024-10-06 21:31:27', 10),
(31, 31, '2024-10-06 21:32:51', 20),
(32, 32, '2024-10-06 21:34:15', 20),
(33, 33, '2024-10-06 21:35:39', 7),
(34, 34, '2024-10-06 21:37:04', 20),
(35, 35, '2024-10-06 21:38:28', 20),
(36, 36, '2024-10-06 21:39:52', 10),
(37, 37, '2024-10-06 21:41:16', 7),
(38, 38, '2024-10-06 21:42:40', 20),
(39, 39, '2024-10-06 21:44:05', 10),
(40, 40, '2024-10-06 21:45:29', 20),
(41, 41, '2024-10-06 21:46:53', 20),
(42, 42, '2024-10-06 21:48:18', 20),
(43, 43, '2024-10-06 21:49:42', 10),
(44, 44, '2024-10-06 21:51:06', 7),
(45, 45, '2024-10-06 21:52:31', 20),
(46, 46, '2024-10-06 21:53:55', 20),
(47, 47, '2024-10-06 21:55:19', 7),
(48, 48, '2024-10-06 21:56:43', 20),
(49, 49, '2024-10-06 21:58:08', 10),
(50, 50, '2024-10-06 21:59:32', 20),
(51, 51, '2024-10-06 22:00:56', 20),
(52, 52, '2024-10-06 22:02:21', 20),
(53, 53, '2024-10-06 22:03:45', 20),
(54, 54, '2024-10-06 22:05:09', 20),
(55, 55, '2024-10-06 22:06:34', 10),
(56, 56, '2024-10-06 22:07:58', 10),
(57, 57, '2024-10-06 22:09:22', 20),
(58, 58, '2024-10-06 22:10:47', 7),
(59, 59, '2024-10-06 22:12:11', 7),
(60, 60, '2024-10-06 22:13:35', 10),
(61, 61, '2024-10-06 22:15:00', 20),
(62, 62, '2024-10-06 22:16:24', 20),
(63, 63, '2024-10-06 22:17:48', NULL),
(64, 1, '2024-10-06 22:18:40', 2),
(65, 1, '2024-10-06 22:21:44', 2),
(66, 2, '2024-10-06 22:23:08', 5),
(67, 3, '2024-10-06 22:24:33', 5),
(68, 4, '2024-10-06 22:25:57', 20),
(69, 5, '2024-10-06 22:27:21', NULL);

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
(1, 'tharindu', '$2a$10$2ra9NA8KPEtCbAoMjjgnBOfKzmoiwA/PWR3UK9bHvUHWbd6FIdAAi', 849.00),
(5, 'mali', '$2a$10$0LB5qRyvkn9Tdfl5E1cZrefhC50LTu1DUWUrzo9BUpIR5MmeI7pJC', 7864.00),
(7, 'tharu', '$2a$10$a2y3ZLepxq/9YqWRE8eyOeDYlLQ5ZhV7l0xAUoxnNp39iBVUC8r..', 3170.00),
(8, 'admin', '$2a$10$MRazUqNkk/oiqDxMlcDpU.dkQRjkMkkCTxXFAnubIEjXmT04x5hCe', 964.00);

-- --------------------------------------------------------

--
-- Table structure for table `win_history`
--

CREATE TABLE `win_history` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `round_number` int(11) NOT NULL,
  `winning_multiplier` decimal(10,2) NOT NULL,
  `win_amount` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `win_history`
--

INSERT INTO `win_history` (`id`, `user_id`, `round_number`, `winning_multiplier`, `win_amount`) VALUES
(1, 7, 1, 20.00, 400.00),
(2, 7, 3, 7.00, 1400.00),
(3, 7, 1, 2.00, 40.00),
(4, 7, 2, 5.00, 250.00);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `betting_results`
--
ALTER TABLE `betting_results`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `manual_set`
--
ALTER TABLE `manual_set`
  ADD PRIMARY KEY (`id`);

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
-- Indexes for table `win_history`
--
ALTER TABLE `win_history`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `betting_results`
--
ALTER TABLE `betting_results`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `manual_set`
--
ALTER TABLE `manual_set`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `rounds`
--
ALTER TABLE `rounds`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=70;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `win_history`
--
ALTER TABLE `win_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
