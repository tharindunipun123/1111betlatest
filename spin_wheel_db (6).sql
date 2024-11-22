-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 25, 2024 at 12:19 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

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
-- Table structure for table `cricket_bets`
--

CREATE TABLE `cricket_bets` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `match_id` int(11) NOT NULL,
  `bet_type` enum('team1_win','team2_win','draw','full_target_yes','full_target_no','six_over_target_yes','six_over_target_no') NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `multiplier` decimal(5,2) NOT NULL,
  `status` enum('pending','won','lost') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `winnings` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cricket_bets`
--

INSERT INTO `cricket_bets` (`id`, `user_id`, `match_id`, `bet_type`, `amount`, `multiplier`, `status`, `created_at`, `winnings`) VALUES
(1, 1, 1, '', 100.00, 1.00, 'lost', '2024-10-17 09:37:58', NULL),
(2, 1, 2, '', 100.00, 2.00, 'lost', '2024-10-17 11:09:59', NULL),
(3, 1, 4, 'draw', 100.00, 2.00, 'won', '2024-10-17 11:11:52', 200.00),
(4, 1, 5, 'team1_win', 100.00, 2.00, 'won', '2024-10-17 11:33:12', 200.00),
(5, 1, 6, 'team2_win', 400.00, 4.00, 'won', '2024-10-17 11:59:05', 1600.00),
(6, 1, 7, 'team1_win', 100.00, 2.00, 'won', '2024-10-17 13:19:28', 200.00),
(7, 1, 8, 'team1_win', 100.00, 2.00, 'won', '2024-10-17 13:29:04', 200.00);

-- --------------------------------------------------------

--
-- Table structure for table `cricket_matches`
--

CREATE TABLE `cricket_matches` (
  `id` int(11) NOT NULL,
  `team1` varchar(100) NOT NULL,
  `team2` varchar(100) NOT NULL,
  `match_time` datetime NOT NULL,
  `status` enum('upcoming','live','completed') DEFAULT 'upcoming',
  `result` enum('team1_win','team2_win','draw','pending') DEFAULT 'pending',
  `draw_multiplier` decimal(5,2) DEFAULT 1.00,
  `facebook_live_link` varchar(255) DEFAULT NULL,
  `is_locked` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `team1_win_multiplier` decimal(5,2) DEFAULT 1.00,
  `team2_win_multiplier` decimal(5,2) DEFAULT 1.00,
  `full_target_multiplier_yes` decimal(5,2) DEFAULT 2.00,
  `full_target_multiplier_no` decimal(5,2) DEFAULT 2.00,
  `six_over_target_multiplier_yes` decimal(5,2) DEFAULT 2.00,
  `six_over_target_multiplier_no` decimal(5,2) DEFAULT 2.00,
  `full_target_locked` tinyint(1) DEFAULT 0,
  `six_over_target_locked` tinyint(1) DEFAULT 0,
  `full_target_result` enum('pending','yes','no') DEFAULT 'pending',
  `six_over_target_result` enum('pending','yes','no') DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cricket_matches`
--

INSERT INTO `cricket_matches` (`id`, `team1`, `team2`, `match_time`, `status`, `result`, `draw_multiplier`, `facebook_live_link`, `is_locked`, `created_at`, `team1_win_multiplier`, `team2_win_multiplier`, `full_target_multiplier_yes`, `full_target_multiplier_no`, `six_over_target_multiplier_yes`, `six_over_target_multiplier_no`, `full_target_locked`, `six_over_target_locked`, `full_target_result`, `six_over_target_result`) VALUES
(1, 'West Indies', 'Sri lanka', '2024-10-17 15:06:00', 'completed', 'team1_win', 1.00, 'http://localhost/spin/cricket/crickadmin.php', 1, '2024-10-17 09:34:27', 1.00, 1.00, 2.00, 2.00, 2.00, 2.00, 0, 0, 'pending', 'pending'),
(2, 'India', 'Australia', '2024-10-17 15:09:00', 'completed', 'team1_win', 1.50, '', 0, '2024-10-17 09:35:45', 1.00, 1.00, 2.00, 2.00, 2.00, 2.00, 0, 0, 'pending', 'pending'),
(3, 'India', 'Australia', '2024-10-17 15:09:00', 'completed', 'team1_win', 1.00, '', 0, '2024-10-17 11:06:03', 1.00, 1.00, 2.00, 2.00, 2.00, 2.00, 0, 0, 'pending', 'pending'),
(4, 'Banladesh', 'Pakistan', '2024-10-17 16:41:00', 'completed', 'draw', 2.00, 'http://localhost/spin/cricket/crickadmin.php', 0, '2024-10-17 11:11:15', 1.00, 1.00, 2.00, 2.00, 2.00, 2.00, 0, 0, 'pending', 'pending'),
(5, 'Banladesh', 'Pakistan', '2024-10-17 17:01:00', 'completed', 'team1_win', 2.00, 'http://localhost/spin/cricket/crickadmin.php', 0, '2024-10-17 11:31:58', 2.00, 1.50, 2.00, 2.00, 2.00, 2.00, 0, 0, 'pending', 'pending'),
(6, 'new zealedn', 'Sri lanka', '2024-10-17 17:26:00', 'completed', 'team2_win', 3.00, 'http://localhost/spin/cricket/crickadmin.php', 0, '2024-10-17 11:57:20', 3.00, 4.00, 2.00, 2.00, 2.00, 2.00, 0, 0, 'pending', 'pending'),
(7, 'Pakistan', 'Australia', '2024-10-17 18:48:00', 'completed', 'team1_win', 2.00, 'http://localhost/spin/cricket/crickadmin.php', 0, '2024-10-17 13:17:30', 2.00, 1.50, 2.00, 2.00, 2.00, 2.00, 0, 0, 'pending', 'pending'),
(8, 'Banladesh', 'Sri lanka', '2024-10-17 18:55:00', 'completed', 'team1_win', 1.20, 'http://localhost/spin/cricket/crickadmin.php', 0, '2024-10-17 13:25:34', 1.50, NULL, 2.00, 2.00, 2.00, 2.00, 0, 0, 'pending', 'pending'),
(9, '', '', '2024-10-25 02:57:00', 'upcoming', 'pending', 2.00, '', 0, '2024-10-24 21:28:11', 2.00, 2.00, 5.00, 5.00, 5.00, 6.00, 0, 0, 'pending', 'pending');

-- --------------------------------------------------------

--
-- Table structure for table `lucky_betting_results`
--

CREATE TABLE `lucky_betting_results` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `round` int(11) NOT NULL,
  `multiplier` float NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lucky_betting_results`
--

INSERT INTO `lucky_betting_results` (`id`, `userId`, `round`, `multiplier`, `amount`, `created_at`) VALUES
(0, 7, 2, 1, 10.00, '2024-10-17 13:49:26'),
(0, 7, 2, 2, 10.00, '2024-10-17 13:49:28'),
(0, 7, 2, 3, 10.00, '2024-10-17 13:49:30'),
(0, 7, 2, 4, 10.00, '2024-10-17 13:49:32'),
(0, 7, 2, 5, 10.00, '2024-10-17 13:49:34'),
(0, 7, 2, 6, 10.00, '2024-10-17 13:49:36'),
(0, 7, 2, 8, 10.00, '2024-10-17 13:49:38'),
(0, 7, 2, 9, 10.00, '2024-10-17 13:49:40'),
(0, 7, 2, 10, 10.00, '2024-10-17 13:49:42'),
(0, 7, 3, 1, 10.00, '2024-10-17 13:51:10'),
(0, 7, 3, 2, 10.00, '2024-10-17 13:51:12'),
(0, 7, 3, 3, 10.00, '2024-10-17 13:51:14'),
(0, 7, 3, 4, 10.00, '2024-10-17 13:51:16'),
(0, 7, 3, 5, 10.00, '2024-10-17 13:51:17'),
(0, 7, 3, 6, 10.00, '2024-10-17 13:51:20'),
(0, 7, 3, 7, 10.00, '2024-10-17 13:51:23'),
(0, 7, 3, 8, 10.00, '2024-10-17 13:51:25'),
(0, 7, 3, 9, 10.00, '2024-10-17 13:51:28'),
(0, 7, 3, 10, 10.00, '2024-10-17 13:51:30');

-- --------------------------------------------------------

--
-- Table structure for table `lucky_manual_set`
--

CREATE TABLE `lucky_manual_set` (
  `id` int(11) NOT NULL,
  `round_number` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lucky_rounds`
--

CREATE TABLE `lucky_rounds` (
  `id` int(11) NOT NULL,
  `round_number` int(11) NOT NULL,
  `updated_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `winning_multiplier` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lucky_rounds`
--

INSERT INTO `lucky_rounds` (`id`, `round_number`, `updated_time`, `winning_multiplier`) VALUES
(0, 1, '2024-10-17 13:47:43', 7),
(0, 2, '2024-10-17 13:49:07', 7),
(0, 3, '2024-10-17 13:50:32', 1),
(0, 4, '2024-10-17 13:51:56', 7),
(0, 5, '2024-10-17 13:53:21', 8),
(0, 6, '2024-10-17 13:54:46', 8),
(0, 7, '2024-10-17 13:56:10', 6),
(0, 8, '2024-10-17 13:57:35', 8),
(0, 9, '2024-10-17 13:59:00', 7),
(0, 10, '2024-10-17 14:00:24', 8),
(0, 11, '2024-10-17 14:01:49', 7),
(0, 12, '2024-10-17 14:03:14', 7),
(0, 13, '2024-10-17 14:04:39', 6),
(0, 14, '2024-10-17 14:06:03', 8),
(0, 15, '2024-10-17 14:07:28', 8),
(0, 16, '2024-10-17 14:08:53', 8),
(0, 17, '2024-10-17 14:10:17', 6),
(0, 18, '2024-10-17 14:11:42', 6),
(0, 19, '2024-10-17 14:13:07', 8),
(0, 20, '2024-10-17 14:14:31', 8),
(0, 21, '2024-10-17 14:15:56', 7),
(0, 22, '2024-10-17 14:17:21', 7),
(0, 23, '2024-10-17 14:18:46', 6),
(0, 24, '2024-10-17 14:20:10', 8),
(0, 25, '2024-10-17 14:21:35', 7),
(0, 26, '2024-10-17 14:23:00', 7),
(0, 27, '2024-10-17 14:24:24', 7),
(0, 28, '2024-10-17 14:25:49', 7),
(0, 29, '2024-10-17 14:27:13', 8),
(0, 30, '2024-10-17 14:28:38', 7),
(0, 31, '2024-10-17 14:30:02', 6),
(0, 32, '2024-10-17 14:31:26', 7),
(0, 33, '2024-10-17 14:32:50', 8),
(0, 34, '2024-10-17 14:34:14', 7),
(0, 35, '2024-10-17 14:35:38', 8),
(0, 36, '2024-10-17 14:37:02', 6),
(0, 37, '2024-10-17 14:38:26', 8),
(0, 38, '2024-10-17 14:39:51', 8),
(0, 39, '2024-10-17 14:41:15', 8),
(0, 40, '2024-10-17 14:42:39', 7),
(0, 41, '2024-10-17 14:44:03', 6),
(0, 42, '2024-10-17 14:45:27', 6),
(0, 43, '2024-10-17 15:49:15', 7),
(0, 44, '2024-10-17 15:50:39', 6),
(0, 45, '2024-10-17 15:52:04', 8),
(0, 46, '2024-10-17 15:53:28', 7),
(0, 47, '2024-10-17 15:54:52', 7),
(0, 48, '2024-10-17 15:56:17', 8),
(0, 49, '2024-10-17 15:57:41', 8),
(0, 50, '2024-10-17 15:59:05', 6),
(0, 51, '2024-10-17 16:00:30', 6),
(0, 52, '2024-10-17 16:01:54', 6),
(0, 53, '2024-10-17 16:03:18', 8),
(0, 54, '2024-10-17 16:04:43', 7),
(0, 55, '2024-10-17 16:06:07', 8),
(0, 56, '2024-10-17 16:07:31', 7),
(0, 57, '2024-10-17 16:08:56', 6),
(0, 58, '2024-10-17 16:10:20', 8),
(0, 59, '2024-10-17 16:11:45', 7);

-- --------------------------------------------------------

--
-- Table structure for table `lucky_win_history`
--

CREATE TABLE `lucky_win_history` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `round_number` int(11) NOT NULL,
  `winning_multiplier` decimal(10,2) NOT NULL,
  `win_amount` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lucky_win_history`
--

INSERT INTO `lucky_win_history` (`id`, `user_id`, `round_number`, `winning_multiplier`, `win_amount`) VALUES
(0, 7, 3, 1.00, 80.00);

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
-- Table structure for table `match_teams`
--

CREATE TABLE `match_teams` (
  `id` int(11) NOT NULL,
  `match_id` int(11) NOT NULL,
  `team_name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `match_teams`
--

INSERT INTO `match_teams` (`id`, `match_id`, `team_name`, `created_at`) VALUES
(6, 9, 'angoda', '2024-10-24 21:29:49'),
(7, 9, 'panadura ', '2024-10-24 21:29:49'),
(8, 9, 'polonnaruwa', '2024-10-24 21:29:49'),
(9, 9, 'anurdhapura', '2024-10-24 21:29:49'),
(10, 9, 'mannarama', '2024-10-24 21:29:49');

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
(1, 'tharindu', '$2a$10$2ra9NA8KPEtCbAoMjjgnBOfKzmoiwA/PWR3UK9bHvUHWbd6FIdAAi', 2249.00),
(5, 'mali', '$2a$10$0LB5qRyvkn9Tdfl5E1cZrefhC50LTu1DUWUrzo9BUpIR5MmeI7pJC', 7864.00),
(7, 'tharu', '$2a$10$a2y3ZLepxq/9YqWRE8eyOeDYlLQ5ZhV7l0xAUoxnNp39iBVUC8r..', 115.00),
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
-- Indexes for table `cricket_bets`
--
ALTER TABLE `cricket_bets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `match_id` (`match_id`);

--
-- Indexes for table `cricket_matches`
--
ALTER TABLE `cricket_matches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `manual_set`
--
ALTER TABLE `manual_set`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `match_teams`
--
ALTER TABLE `match_teams`
  ADD PRIMARY KEY (`id`),
  ADD KEY `match_id` (`match_id`);

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
-- AUTO_INCREMENT for table `cricket_bets`
--
ALTER TABLE `cricket_bets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `cricket_matches`
--
ALTER TABLE `cricket_matches`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `manual_set`
--
ALTER TABLE `manual_set`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `match_teams`
--
ALTER TABLE `match_teams`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

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

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cricket_bets`
--
ALTER TABLE `cricket_bets`
  ADD CONSTRAINT `cricket_bets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `cricket_bets_ibfk_2` FOREIGN KEY (`match_id`) REFERENCES `cricket_matches` (`id`);

--
-- Constraints for table `match_teams`
--
ALTER TABLE `match_teams`
  ADD CONSTRAINT `match_teams_ibfk_1` FOREIGN KEY (`match_id`) REFERENCES `cricket_matches` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;