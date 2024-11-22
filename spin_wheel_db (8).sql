-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 22, 2024 at 09:44 PM
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
-- Table structure for table `dice_betting_results`
--

CREATE TABLE `dice_betting_results` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `round` int(11) NOT NULL,
  `multiplier` float NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `dice_rounds`
--

CREATE TABLE `dice_rounds` (
  `id` int(11) NOT NULL,
  `round_number` int(11) NOT NULL,
  `updated_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `winning_multiplier` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(1, 'tharindu', '$2a$10$2ra9NA8KPEtCbAoMjjgnBOfKzmoiwA/PWR3UK9bHvUHWbd6FIdAAi', 1366.00),
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
-- Indexes for table `dice_betting_results`
--
ALTER TABLE `dice_betting_results`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `dice_rounds`
--
ALTER TABLE `dice_rounds`
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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

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
-- AUTO_INCREMENT for table `dice_betting_results`
--
ALTER TABLE `dice_betting_results`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `dice_rounds`
--
ALTER TABLE `dice_rounds`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `win_history`
--
ALTER TABLE `win_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

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
