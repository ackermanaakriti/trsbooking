-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 06, 2025 at 09:11 PM
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
-- Database: `trs_booking`
--

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone_number` varchar(15) NOT NULL,
  `address` text DEFAULT NULL,
  `check_in_date` varchar(500) NOT NULL,
  `check_out_date` varchar(200) NOT NULL,
  `complementaries` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT '[]' CHECK (json_valid(`complementaries`)),
  `total_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `additional_note` text DEFAULT NULL,
  `status` enum('booked','checkedin','checkedout') NOT NULL DEFAULT 'booked',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `total_checkedout_price` decimal(10,2) DEFAULT NULL,
  `checkout_remarks` varchar(255) DEFAULT NULL,
  `grand_total` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `name`, `email`, `phone_number`, `address`, `check_in_date`, `check_out_date`, `complementaries`, `total_price`, `additional_note`, `status`, `created_at`, `updated_at`, `total_checkedout_price`, `checkout_remarks`, `grand_total`) VALUES
(17, 'First user', 'firt@gmail.com', '34567', 'gakfjds', '2025-01-06', '2025-01-16', '[{\"day\":\"2025-01-01\",\"service_name\":[\"riding\",\"lunch\",\"Zipline\",\"Breakfast\"]},{\"day\":\"2025-01-02\",\"service_name\":[\"lunch\",\"Breakfast\",\"Dinner\"]}]', 2000.00, 'Advance: 5000', 'checkedout', '2025-01-04 17:32:12', '2025-01-06 19:57:17', 0.00, NULL, 2000.00),
(18, 'Second user', 'second@gmail.com', '889094830', 'address', '2025-01-01', '2025-01-02', '[{\"day\":\"2025-01-01\",\"service_name\":[\"riding\",\"lunch\"]},{\"day\":\"2025-01-02\",\"service_name\":[\"lunch\"]}]', 799.00, 'fdsd', 'checkedout', '2025-01-04 17:35:09', '2025-01-05 02:54:33', 500.00, NULL, 1299.00),
(20, 'third user', 'third@gmail.com', '1200', 'Shivanagar', '2025-01-01', '2025-01-02', '[{\"day\":\"2025-01-01\",\"service_name\":[\"lunch\",\"dinner\"]},{\"day\":\"2025-01-02\",\"service_name\":[\"lunch\"]}]', 30000.00, '', 'checkedout', '2025-01-05 02:07:50', '2025-01-05 02:57:03', 800.00, NULL, 30800.00);

-- --------------------------------------------------------

--
-- Table structure for table `complementaries`
--

CREATE TABLE `complementaries` (
  `id` int(11) NOT NULL,
  `service_name` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `complementaries`
--

INSERT INTO `complementaries` (`id`, `service_name`, `created_at`, `updated_at`) VALUES
(6, 'Dinner', '2025-01-06 18:41:49', '2025-01-06 18:41:49'),
(7, 'Breakfast', '2025-01-06 19:26:19', '2025-01-06 19:26:19'),
(9, 'Zipline', '2025-01-06 19:27:42', '2025-01-06 19:27:42');

-- --------------------------------------------------------

--
-- Table structure for table `inquiry`
--

CREATE TABLE `inquiry` (
  `id` int(11) NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `customer_phoneno` varchar(15) NOT NULL,
  `remarks` text DEFAULT NULL,
  `status` enum('not booked','booked') DEFAULT 'not booked',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inquiry`
--

INSERT INTO `inquiry` (`id`, `customer_name`, `customer_phoneno`, `remarks`, `status`, `created_at`, `updated_at`) VALUES
(3, 'Amrit Nepane', '98764321', 'from jagate', 'not booked', '2025-01-05 02:02:28', '2025-01-05 02:02:28'),
(4, 'Aakriti Bhandari', '1200', 'from kathmandu', 'booked', '2025-01-05 02:02:41', '2025-01-05 02:07:50');

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE `rooms` (
  `id` int(11) NOT NULL,
  `room_number` varchar(50) NOT NULL,
  `room_name` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `room_status` enum('Active','Inactive') DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rooms`
--

INSERT INTO `rooms` (`id`, `room_number`, `room_name`, `created_at`, `updated_at`, `room_status`) VALUES
(14, '101', 'trisuhli_first room', '2025-01-04 12:35:27', '2025-01-05 02:24:16', 'Inactive'),
(15, 'fdsf', 'sdfds', '2025-01-04 12:35:33', '2025-01-04 12:35:33', 'Active'),
(19, '202', 'room_trishuli', '2025-01-05 02:21:22', '2025-01-05 02:21:22', 'Active');

-- --------------------------------------------------------

--
-- Table structure for table `room_details`
--

CREATE TABLE `room_details` (
  `booking_id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `no_of_person` int(11) DEFAULT NULL,
  `total_price` decimal(10,2) DEFAULT NULL,
  `room_name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `room_details`
--

INSERT INTO `room_details` (`booking_id`, `room_id`, `no_of_person`, `total_price`, `room_name`) VALUES
(18, 15, 100, 300.00, 'sdfds'),
(18, 19, 500, 499.00, 'room_trishuli');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('field_staff','office_staff') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `created_at`) VALUES
(1, 'Aakriti bhandari', 'aakri@gmail.com', '$2y$10$q273H451QN4538tqkmQE0uP8jt9ArXwQnj2W0e/GzBL.AiVSt2bIW', 'office_staff', '2024-12-25 16:23:53'),
(2, 'dsfsd', 'sdfsd@dsfsd.com', '$2a$10$Qt6Yc7W50rKYTPghmcRRIu9lSU3OTMenTYrRTgRpU0dU1OR5m8zDu', 'office_staff', '2025-01-06 19:59:07'),
(4, 'dsfg', 'contactbhojraj@gmail.com', '$2a$10$RmOPquQ0Gj8QnVDxY.TV0OuLT2kxLELC1uwQDqoy6.mcYQQxJ1Aw6', 'office_staff', '2025-01-06 19:59:45');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `complementaries`
--
ALTER TABLE `complementaries`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `inquiry`
--
ALTER TABLE `inquiry`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `room_details`
--
ALTER TABLE `room_details`
  ADD PRIMARY KEY (`booking_id`,`room_id`),
  ADD KEY `room_id` (`room_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `complementaries`
--
ALTER TABLE `complementaries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `inquiry`
--
ALTER TABLE `inquiry`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `room_details`
--
ALTER TABLE `room_details`
  ADD CONSTRAINT `room_details_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`),
  ADD CONSTRAINT `room_details_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
