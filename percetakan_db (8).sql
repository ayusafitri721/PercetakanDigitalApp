-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 23, 2025 at 03:58 PM
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
-- Database: `percetakan_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id_log` int(11) NOT NULL,
  `id_user` int(11) DEFAULT NULL,
  `aksi` varchar(100) NOT NULL,
  `tabel_terkait` varchar(50) DEFAULT NULL,
  `id_terkait` int(11) DEFAULT NULL,
  `deskripsi` text DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `tanggal_aksi` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id_category` int(11) NOT NULL,
  `nama_category` varchar(100) NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `urutan` int(11) DEFAULT 0,
  `status_aktif` tinyint(1) DEFAULT 1,
  `tanggal_dibuat` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id_category`, `nama_category`, `deskripsi`, `icon`, `urutan`, `status_aktif`, `tanggal_dibuat`) VALUES
(1, 'Banner & Spanduk', 'Banner, spanduk, backdrop untuk event', '🎯', 1, 1, '2025-11-23 14:15:43'),
(2, 'Kartu & ID Card', 'Kartu nama, ID card, member card', '💳', 2, 1, '2025-11-23 14:15:43'),
(3, 'Brosur & Flyer', 'Brosur promosi, flyer, leaflet', '📄', 3, 1, '2025-11-23 14:15:43'),
(4, 'Undangan', 'Undangan pernikahan, acara, dll', '💌', 4, 1, '2025-11-23 14:15:43'),
(5, 'Stiker & Label', 'Stiker custom, label produk', '🏷️', 5, 1, '2025-11-23 14:15:43');

-- --------------------------------------------------------

--
-- Table structure for table `deliveries`
--

CREATE TABLE `deliveries` (
  `id_delivery` int(11) NOT NULL,
  `id_order` int(11) NOT NULL,
  `id_kurir` int(11) DEFAULT NULL,
  `metode_pengiriman` enum('ambil_sendiri','kurir_internal','ekspedisi') DEFAULT 'ambil_sendiri',
  `nama_penerima` varchar(100) DEFAULT NULL,
  `no_telepon_penerima` varchar(20) DEFAULT NULL,
  `alamat_lengkap` text DEFAULT NULL,
  `kode_pos` varchar(10) DEFAULT NULL,
  `kota` varchar(100) DEFAULT NULL,
  `provinsi` varchar(100) DEFAULT NULL,
  `ongkos_kirim` decimal(10,2) DEFAULT 0.00,
  `status_pengiriman` enum('pending','dikemas','dikirim','transit','tiba','selesai') DEFAULT 'pending',
  `tanggal_kirim` timestamp NULL DEFAULT NULL,
  `tanggal_tiba` timestamp NULL DEFAULT NULL,
  `catatan_pengiriman` text DEFAULT NULL,
  `foto_bukti_kirim` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `design_files`
--

CREATE TABLE `design_files` (
  `id_file` int(11) NOT NULL,
  `id_order` int(11) NOT NULL,
  `nama_file` varchar(255) NOT NULL,
  `file_url` varchar(500) NOT NULL,
  `ukuran_file` bigint(20) DEFAULT NULL,
  `tipe_file` varchar(50) DEFAULT NULL,
  `keterangan` text DEFAULT NULL,
  `is_result` tinyint(1) DEFAULT 0 COMMENT '0=file customer, 1=file hasil operator',
  `status_validasi` enum('pending','approved','rejected') DEFAULT 'approved',
  `catatan_validasi` text DEFAULT NULL,
  `tanggal_upload` timestamp NOT NULL DEFAULT current_timestamp(),
  `tanggal_validasi` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `design_files`
--

INSERT INTO `design_files` (`id_file`, `id_order`, `nama_file`, `file_url`, `ukuran_file`, `tipe_file`, `keterangan`, `is_result`, `status_validasi`, `catatan_validasi`, `tanggal_upload`, `tanggal_validasi`) VALUES
(1, 1, 'LOGO_BANGKIT_CELL_page-0001-removebg-preview.png', 'http://localhost/api-percetakan/uploads/design_files/DESAIN_1_1_1763907510.png', 71717, 'png', NULL, 0, 'pending', NULL, '2025-11-23 14:18:30', NULL),
(2, 2, 'DESAIN_1_1_1763907510.png', 'http://localhost/api-percetakan/uploads/design_files/DESAIN_2_2_1763907818.png', 71717, 'png', NULL, 0, 'pending', NULL, '2025-11-23 14:23:38', NULL),
(3, 2, 'LOGO_BANGKIT_CELL_page-0001-removebg-preview.png', 'http://localhost/api-percetakan/uploads/design_files/DESAIN_2_3_1763907818.png', 71717, 'png', NULL, 0, 'pending', NULL, '2025-11-23 14:23:38', NULL),
(4, 2, 'LOGO_BANGKIT_CELL_page-0001-removebg-preview.png', 'http://localhost/api-percetakan/uploads/design_files/DESAIN_2_4_1763907818.png', 71717, 'png', NULL, 0, 'pending', NULL, '2025-11-23 14:23:38', NULL),
(5, 3, 'DESAIN_1_1_1763907510.png', 'http://localhost/api-percetakan/uploads/design_files/DESAIN_3_5_1763907887.png', 71717, 'png', NULL, 0, 'pending', NULL, '2025-11-23 14:24:47', NULL),
(6, 4, 'DESAIN_1_1_1763907510.png', 'http://localhost/api-percetakan/uploads/design_files/DESAIN_4_6_1763907926.png', 71717, 'png', NULL, 0, 'pending', NULL, '2025-11-23 14:25:26', NULL),
(7, 5, 'DESAIN_1_1_1763907510.png', 'http://localhost/api-percetakan/uploads/design_files/DESAIN_5_7_1763908020.png', 71717, 'png', NULL, 0, 'pending', NULL, '2025-11-23 14:27:00', NULL),
(8, 6, 'LOGO_BANGKIT_CELL_page-0001-removebg-preview.png', 'http://localhost/api-percetakan/uploads/design_files/DESAIN_6_8_1763908430.png', 71717, 'png', NULL, 0, 'pending', NULL, '2025-11-23 14:33:50', NULL),
(9, 7, 'DESAIN_1_1_1763907510.png', 'http://localhost/api-percetakan/uploads/design_files/DESAIN_7_9_1763908489.png', 71717, 'png', NULL, 0, 'pending', NULL, '2025-11-23 14:34:49', NULL),
(10, 8, 'DESAIN_1_1_1763907510 (1).png', 'http://localhost/api-percetakan/uploads/design_files/DESAIN_8_10_1763908516.png', 71717, 'png', NULL, 0, 'pending', NULL, '2025-11-23 14:35:16', NULL),
(11, 9, 'DESAIN_1_1_1763907510 (1).png', 'http://localhost/api-percetakan/uploads/design_files/DESAIN_9_11_1763908655.png', 71717, 'png', NULL, 0, 'pending', NULL, '2025-11-23 14:37:35', NULL),
(12, 10, 'DESAIN_1_1_1763907510 (2).png', 'http://localhost/api-percetakan/uploads/design_files/DESAIN_10_12_1763908786.png', 71717, 'png', NULL, 0, 'pending', NULL, '2025-11-23 14:39:46', NULL),
(13, 11, 'DESAIN_1_1_1763907510 (2).png', 'http://localhost/api-percetakan/uploads/design_files/DESAIN_11_13_1763908968.png', 71717, 'png', NULL, 0, 'pending', NULL, '2025-11-23 14:42:48', NULL),
(14, 12, 'DESAIN_1_1_1763907510 (2).png', 'http://localhost/api-percetakan/uploads/design_files/DESAIN_12_14_1763909018.png', 71717, 'png', NULL, 0, 'pending', NULL, '2025-11-23 14:43:38', NULL),
(15, 13, 'Screenshot 2025-11-11 130643 (1).png', 'http://localhost/api-percetakan/uploads/design_files/DESAIN_13_15_1763909145.png', 112560, 'png', NULL, 0, '', NULL, '2025-11-23 14:45:45', NULL),
(16, 14, 'DESAIN_1_1_1763907510.png', 'http://localhost/api-percetakan/uploads/design_files/DESAIN_14_16_1763909173.png', 71717, 'png', NULL, 0, 'pending', NULL, '2025-11-23 14:46:13', NULL),
(17, 15, '31188.jpg', 'http://localhost/api-percetakan/uploads/design_files/DESAIN_15_17_1763909631.jpg', 129332, 'jpg', NULL, 0, 'pending', NULL, '2025-11-23 14:53:51', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `loyalty_points`
--

CREATE TABLE `loyalty_points` (
  `id_point` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `id_order` int(11) DEFAULT NULL,
  `jenis` enum('dapat','pakai','kadaluarsa') NOT NULL,
  `jumlah_point` int(11) NOT NULL,
  `saldo_point` int(11) NOT NULL DEFAULT 0,
  `keterangan` text DEFAULT NULL,
  `tanggal_transaksi` timestamp NOT NULL DEFAULT current_timestamp(),
  `tanggal_kadaluarsa` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `materials`
--

CREATE TABLE `materials` (
  `id_material` int(11) NOT NULL,
  `nama_bahan` varchar(100) NOT NULL,
  `jenis_bahan` enum('kertas','tinta','plastik','laminasi','lainnya') DEFAULT 'lainnya',
  `stok_awal` int(11) DEFAULT 0,
  `stok_sisa` int(11) DEFAULT 0,
  `stok_minimum` int(11) DEFAULT 10,
  `satuan` varchar(20) DEFAULT 'pcs',
  `harga_per_unit` decimal(10,2) DEFAULT 0.00,
  `supplier` varchar(100) DEFAULT NULL,
  `tanggal_update` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `materials`
--

INSERT INTO `materials` (`id_material`, `nama_bahan`, `jenis_bahan`, `stok_awal`, `stok_sisa`, `stok_minimum`, `satuan`, `harga_per_unit`, `supplier`, `tanggal_update`) VALUES
(1, 'Art Paper 150gsm A4', 'kertas', 1000, 800, 200, 'lembar', 500.00, 'Paper Supplier Indo', '2025-11-23 14:15:43'),
(2, 'Tinta Cyan', 'tinta', 50, 35, 10, 'botol', 150000.00, 'Tinta Jaya', '2025-11-23 14:15:43'),
(3, 'Vinyl Putih', 'plastik', 100, 75, 20, 'meter', 25000.00, 'Vinyl Indonesia', '2025-11-23 14:15:43'),
(4, 'Laminasi Glossy', 'laminasi', 200, 150, 50, 'meter', 15000.00, 'Laminate Pro', '2025-11-23 14:15:43');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id_notif` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `judul` varchar(200) NOT NULL,
  `pesan` text NOT NULL,
  `tipe` enum('order','payment','delivery','promo','system') DEFAULT 'order',
  `link_terkait` varchar(500) DEFAULT NULL,
  `status_baca` tinyint(1) DEFAULT 0,
  `tanggal_kirim` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id_order` int(11) NOT NULL,
  `kode_order` varchar(50) NOT NULL,
  `id_user` int(11) NOT NULL,
  `id_kasir` int(11) DEFAULT NULL,
  `jenis_order` enum('online','offline') DEFAULT 'online',
  `kecepatan_pengerjaan` enum('normal','express') DEFAULT 'normal',
  `subtotal` decimal(10,2) DEFAULT 0.00,
  `diskon` decimal(10,2) DEFAULT 0.00,
  `ongkir` decimal(10,2) DEFAULT 0.00,
  `total_harga` decimal(10,2) DEFAULT 0.00,
  `status_order` enum('pending','dibayar','diproses','validasi','cetak','selesai','dikirim','dibatalkan','siap') DEFAULT 'pending',
  `catatan_pelanggan` text DEFAULT NULL,
  `catatan_internal` text DEFAULT NULL,
  `tanggal_order` timestamp NOT NULL DEFAULT current_timestamp(),
  `tanggal_selesai` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id_order`, `kode_order`, `id_user`, `id_kasir`, `jenis_order`, `kecepatan_pengerjaan`, `subtotal`, `diskon`, `ongkir`, `total_harga`, `status_order`, `catatan_pelanggan`, `catatan_internal`, `tanggal_order`, `tanggal_selesai`) VALUES
(1, 'ORD-20251123151830-001', 6, 3, 'offline', 'normal', 75000.00, 0.00, 0.00, 75000.00, 'selesai', '', 'TUNAI - Diterima: Rp 75,000 - Kembalian: Rp 0', '2025-11-23 14:18:30', '2025-11-23 14:18:54'),
(2, 'ORD-20251123152338-002', 7, 3, 'offline', 'normal', 7500.00, 750.00, 0.00, 6750.00, 'selesai', 'Beli 5 items, diskon 10%!', 'QRIS - Rp 6,750', '2025-11-23 14:23:38', '2025-11-23 14:23:59'),
(3, 'ORD-20251123152447-003', 8, 3, 'offline', 'normal', 7.00, 0.00, 0.00, 7.00, 'diproses', '', 'TRANSFER BANK - BCA - Rp 7', '2025-11-23 14:24:47', NULL),
(4, 'ORD-20251123152526-004', 9, 3, 'offline', 'normal', 1500.00, 0.00, 0.00, 1500.00, 'diproses', '', 'QRIS - Rp 1,500', '2025-11-23 14:25:26', NULL),
(5, 'ORD-20251123152700-005', 10, 3, 'offline', 'normal', 75000.00, 0.00, 0.00, 75000.00, 'diproses', '', 'QRIS - Rp 75,000', '2025-11-23 14:27:00', NULL),
(6, 'ORD-20251123153350-006', 11, 3, 'offline', 'express', 500.00, 0.00, 0.00, 500.00, 'diproses', '', 'TRANSFER BANK - BCA - Rp 750', '2025-11-23 14:33:50', NULL),
(7, 'ORD-20251123153449-007', 12, 3, 'offline', 'normal', 5000.00, 0.00, 0.00, 5000.00, 'diproses', '', 'TRANSFER BANK - BCA - Rp 5,000', '2025-11-23 14:34:49', NULL),
(8, 'ORD-20251123153516-008', 13, 3, 'offline', 'express', 7.00, 0.00, 0.00, 7.00, 'diproses', '', 'TUNAI - Diterima: Rp 10.5 - Kembalian: Rp 0', '2025-11-23 14:35:16', NULL),
(9, 'ORD-20251123153735-009', 14, 3, 'offline', 'normal', 500.00, 0.00, 0.00, 500.00, 'diproses', '', 'QRIS - Rp 500', '2025-11-23 14:37:35', NULL),
(10, 'ORD-20251123153945-010', 15, 3, 'offline', 'normal', 1500.00, 0.00, 0.00, 1500.00, 'diproses', '', 'TRANSFER BANK - BCA - Rp 1,500', '2025-11-23 14:39:45', NULL),
(11, 'ORD-20251123154248-011', 16, 3, 'offline', 'normal', 75000.00, 0.00, 0.00, 75000.00, 'diproses', '', 'QRIS - Rp 75,000', '2025-11-23 14:42:48', NULL),
(12, 'ORD-20251123154337-012', 17, 3, 'offline', 'normal', 28.00, 2.80, 0.00, 25.20, 'selesai', 'Beli 4 items, diskon 10%!', 'TRANSFER BANK - BCA - Rp 25.2', '2025-11-23 14:43:37', '2025-11-23 14:44:04'),
(13, 'ORD-20251123154545-013', 19, 3, 'offline', 'normal', 7.00, 0.00, 0.00, 7.00, 'diproses', '', 'QRIS - Rp 7', '2025-11-23 14:45:45', NULL),
(14, 'ORD-20251123154613-014', 20, 3, 'offline', 'normal', 500.00, 0.00, 0.00, 500.00, 'diproses', '', 'TRANSFER BANK - BCA - Rp 500', '2025-11-23 14:46:13', NULL),
(15, 'ORD-20251123155351-015', 21, NULL, 'online', 'normal', 7.00, 0.00, 15000.00, 15007.00, 'selesai', '', '', '2025-11-23 14:53:51', '2025-11-23 14:55:56');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id_item` int(11) NOT NULL,
  `id_order` int(11) NOT NULL,
  `id_product` int(11) NOT NULL,
  `nama_product` varchar(100) NOT NULL,
  `ukuran` varchar(50) DEFAULT NULL,
  `jumlah` int(11) NOT NULL,
  `harga_satuan` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `keterangan` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id_item`, `id_order`, `id_product`, `nama_product`, `ukuran`, `jumlah`, `harga_satuan`, `subtotal`, `keterangan`) VALUES
(1, 1, 2, 'Kartu Nama Premium', 'Standard', 1, 75000.00, 75000.00, ''),
(2, 2, 3, 'Brosur A5', 'Standard', 1, 1500.00, 1500.00, ''),
(3, 2, 3, 'Brosur A5', 'Standard', 1, 1500.00, 1500.00, ''),
(4, 2, 3, 'Brosur A5', 'Standard', 3, 1500.00, 4500.00, ''),
(5, 3, 6, 'Brosur', 'Standard', 1, 7.00, 7.00, ''),
(6, 4, 3, 'Brosur A5', 'Standard', 1, 1500.00, 1500.00, ''),
(7, 5, 2, 'Kartu Nama Premium', 'Standard', 1, 75000.00, 75000.00, ''),
(8, 6, 5, 'Stiker Vinyl', 'Standard', 1, 500.00, 500.00, ''),
(9, 7, 4, 'Undangan Softcover', 'Standard', 1, 5000.00, 5000.00, ''),
(10, 8, 6, 'Brosur', 'Standard', 1, 7.00, 7.00, ''),
(11, 9, 5, 'Stiker Vinyl', 'Standard', 1, 500.00, 500.00, ''),
(12, 10, 3, 'Brosur A5', 'Standard', 1, 1500.00, 1500.00, ''),
(13, 11, 2, 'Kartu Nama Premium', 'Standard', 1, 75000.00, 75000.00, ''),
(14, 12, 6, 'Brosur', 'Standard', 4, 7.00, 28.00, ''),
(15, 13, 6, 'Brosur', 'Standard', 1, 7.00, 7.00, ''),
(16, 14, 5, 'Stiker Vinyl', 'Standard', 1, 500.00, 500.00, ''),
(17, 15, 6, 'Brosur', '2x1', 1, 7.00, 7.00, 'Material: 340gsm\nKecepatan: normal\n');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id_payment` int(11) NOT NULL,
  `id_order` int(11) NOT NULL,
  `metode_pembayaran` enum('transfer','cash','e-wallet','kartu_kredit','qris') NOT NULL,
  `nama_bank` varchar(50) DEFAULT NULL,
  `nomor_rekening` varchar(50) DEFAULT NULL,
  `nama_pemilik` varchar(100) DEFAULT NULL,
  `jumlah_bayar` decimal(10,2) NOT NULL,
  `bukti_bayar` varchar(500) DEFAULT NULL,
  `status_pembayaran` enum('pending','diterima','ditolak') DEFAULT 'pending',
  `id_admin_konfirmasi` int(11) DEFAULT NULL,
  `tanggal_bayar` timestamp NOT NULL DEFAULT current_timestamp(),
  `tanggal_konfirmasi` timestamp NULL DEFAULT NULL,
  `catatan` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id_payment`, `id_order`, `metode_pembayaran`, `nama_bank`, `nomor_rekening`, `nama_pemilik`, `jumlah_bayar`, `bukti_bayar`, `status_pembayaran`, `id_admin_konfirmasi`, `tanggal_bayar`, `tanggal_konfirmasi`, `catatan`) VALUES
(1, 1, 'cash', '', '', 'halo', 75000.00, '', 'diterima', NULL, '2025-11-23 14:18:30', NULL, NULL),
(2, 2, '', '', '', 'HALOOOO', 6750.00, '', '', NULL, '2025-11-23 14:23:38', NULL, NULL),
(3, 3, 'transfer', 'BCA', '', 'asas', 7.00, '', '', NULL, '2025-11-23 14:24:47', NULL, NULL),
(4, 4, 'qris', '', '', 'aa', 1500.00, '', '', NULL, '2025-11-23 14:25:26', NULL, NULL),
(5, 5, 'qris', '', '', 'azhel', 75000.00, '', '', NULL, '2025-11-23 14:27:00', NULL, NULL),
(6, 6, 'transfer', 'BCA', '', 'sasa', 750.00, '', '', NULL, '2025-11-23 14:33:50', NULL, NULL),
(7, 7, 'transfer', 'BCA', '', 'adas', 5000.00, '', '', NULL, '2025-11-23 14:34:49', NULL, NULL),
(8, 8, 'cash', '', '', 'sasa', 10.50, '', 'diterima', NULL, '2025-11-23 14:35:16', NULL, NULL),
(9, 9, 'qris', '', '', 'sasas', 500.00, '', 'diterima', NULL, '2025-11-23 14:37:35', NULL, NULL),
(10, 10, 'transfer', 'BCA', '', 'adad', 1500.00, '', '', NULL, '2025-11-23 14:39:46', NULL, NULL),
(11, 11, 'qris', '', '', 'asasa', 75000.00, '', 'diterima', NULL, '2025-11-23 14:42:48', NULL, NULL),
(12, 12, 'transfer', 'BCA', '', 'asa', 25.20, '', 'diterima', NULL, '2025-11-23 14:43:38', NULL, NULL),
(13, 13, 'qris', '', '', 'asas', 7.00, '', 'diterima', NULL, '2025-11-23 14:45:45', NULL, NULL),
(14, 14, 'transfer', 'BCA', '', 'aa', 500.00, '', 'diterima', NULL, '2025-11-23 14:46:13', NULL, NULL),
(15, 15, 'transfer', '', '', '', 15007.00, 'http://localhost/api-percetakan/uploads/payment_proofs/BUKTI_15_1763909632.jpg', 'diterima', NULL, '2025-11-23 14:53:52', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `price_variants`
--

CREATE TABLE `price_variants` (
  `id_variant` int(11) NOT NULL,
  `id_product` int(11) NOT NULL,
  `ukuran` varchar(50) DEFAULT NULL,
  `min_qty` int(11) DEFAULT 1,
  `max_qty` int(11) DEFAULT NULL,
  `harga_per_unit` decimal(10,2) NOT NULL,
  `kecepatan` enum('normal','express') DEFAULT 'normal',
  `markup_persen` decimal(5,2) DEFAULT 0.00,
  `tanggal_dibuat` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `production_queue`
--

CREATE TABLE `production_queue` (
  `id_queue` int(11) NOT NULL,
  `id_order` int(11) NOT NULL,
  `id_operator` int(11) DEFAULT NULL,
  `prioritas` int(11) DEFAULT 0,
  `status_produksi` enum('antrian','dikerjakan','hold','selesai') DEFAULT 'antrian',
  `waktu_masuk` timestamp NOT NULL DEFAULT current_timestamp(),
  `waktu_mulai` timestamp NULL DEFAULT NULL,
  `waktu_selesai` timestamp NULL DEFAULT NULL,
  `estimasi_selesai` timestamp NULL DEFAULT NULL,
  `catatan_produksi` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id_product` int(11) NOT NULL,
  `id_category` int(11) DEFAULT NULL,
  `nama_product` varchar(100) NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `media_cetak` varchar(100) DEFAULT NULL,
  `ukuran_standar` varchar(50) DEFAULT NULL,
  `satuan` varchar(20) DEFAULT 'lembar',
  `harga_dasar` decimal(10,2) DEFAULT 0.00,
  `gambar_preview` varchar(255) DEFAULT NULL,
  `status_aktif` tinyint(1) DEFAULT 1,
  `tanggal_dibuat` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id_product`, `id_category`, `nama_product`, `deskripsi`, `media_cetak`, `ukuran_standar`, `satuan`, `harga_dasar`, `gambar_preview`, `status_aktif`, `tanggal_dibuat`) VALUES
(1, 1, 'Banner Standar', 'Banner untuk promosi outdoor/indoor', 'Flexi Korea', '2x1 meter', 'meter', 50000.00, NULL, 1, '2025-11-23 14:15:43'),
(2, 2, 'Kartu Nama Premium', 'Kartu nama dengan laminasi glossy', 'Art Paper 310gsm', '9x5.5 cm', 'box', 75000.00, NULL, 1, '2025-11-23 14:15:43'),
(3, 3, 'Brosur A5', 'Brosur promosi ukuran A5', 'Art Paper 150gsm', 'A5', 'lembar', 1500.00, NULL, 1, '2025-11-23 14:15:43'),
(4, 4, 'Undangan Softcover', 'Undangan pernikahan softcover', 'Art Carton 260gsm', '14x20 cm', 'pcs', 5000.00, NULL, 1, '2025-11-23 14:15:43'),
(5, 5, 'Stiker Vinyl', 'Stiker vinyl cutting', 'Vinyl', 'Custom', 'cm2', 500.00, NULL, 1, '2025-11-23 14:15:43'),
(6, 3, 'Brosur', 'oke bagus', '340gsm', '2x1', 'lembar', 7.00, 'uploads/products/product_6923180a2001a_1763907594.jpg', 1, '2025-11-23 14:19:54');

-- --------------------------------------------------------

--
-- Table structure for table `promotions`
--

CREATE TABLE `promotions` (
  `id_promo` int(11) NOT NULL,
  `kode_promo` varchar(50) NOT NULL,
  `nama_promo` varchar(100) NOT NULL,
  `jenis` enum('persentase','nominal') DEFAULT 'persentase',
  `nilai_diskon` decimal(10,2) NOT NULL,
  `min_pembelian` decimal(10,2) DEFAULT 0.00,
  `max_penggunaan` int(11) DEFAULT NULL,
  `jumlah_terpakai` int(11) DEFAULT 0,
  `tanggal_mulai` date NOT NULL,
  `tanggal_akhir` date NOT NULL,
  `status_aktif` tinyint(1) DEFAULT 1,
  `tanggal_dibuat` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `result_files`
--

CREATE TABLE `result_files` (
  `id_result` int(11) NOT NULL,
  `id_order` int(11) NOT NULL,
  `nama_file` varchar(255) NOT NULL,
  `file_url` varchar(500) NOT NULL,
  `ukuran_file` bigint(20) DEFAULT NULL,
  `tipe_file` varchar(50) DEFAULT NULL,
  `keterangan` text DEFAULT NULL,
  `uploaded_by` varchar(50) DEFAULT 'operator',
  `tanggal_upload` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `result_files`
--

INSERT INTO `result_files` (`id_result`, `id_order`, `nama_file`, `file_url`, `ukuran_file`, `tipe_file`, `keterangan`, `uploaded_by`, `tanggal_upload`) VALUES
(1, 1, '692317ce8f5d3_1763907534.png', 'http://localhost/api-percetakan/uploads/result_files/692317ce8f5d3_1763907534.png', 71717, 'image/png', 'File hasil untuk: Kartu Nama Premium (1 pcs) - Item ID: 1', 'operator', '2025-11-23 14:18:54'),
(2, 2, '692318ffd0e82_1763907839.png', 'http://localhost/api-percetakan/uploads/result_files/692318ffd0e82_1763907839.png', 71717, 'image/png', 'File hasil untuk: Brosur A5 (1 pcs) - Item ID: 2', 'operator', '2025-11-23 14:23:59'),
(3, 2, '692318ffd9bac_1763907839.png', 'http://localhost/api-percetakan/uploads/result_files/692318ffd9bac_1763907839.png', 71717, 'image/png', 'File hasil untuk: Brosur A5 (1 pcs) - Item ID: 3', 'operator', '2025-11-23 14:23:59'),
(4, 2, '692318ffdfd4b_1763907839.png', 'http://localhost/api-percetakan/uploads/result_files/692318ffdfd4b_1763907839.png', 71717, 'image/png', 'File hasil untuk: Brosur A5 (3 pcs) - Item ID: 4', 'operator', '2025-11-23 14:23:59'),
(5, 12, '69231db4746c0_1763909044.png', 'http://localhost/api-percetakan/uploads/result_files/69231db4746c0_1763909044.png', 71717, 'image/png', 'File hasil untuk: Brosur (4 pcs) - Item ID: 14', 'operator', '2025-11-23 14:44:04'),
(6, 15, '692320398c8ec_1763909689.png', 'http://localhost/api-percetakan/uploads/result_files/692320398c8ec_1763909689.png', 112560, 'image/png', 'File hasil untuk: Brosur (1 pcs) - Item ID: 17', 'operator', '2025-11-23 14:54:49');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id_review` int(11) NOT NULL,
  `id_order` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` between 1 and 5),
  `komentar` text DEFAULT NULL,
  `tanggal_review` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id_setting` int(11) NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `deskripsi` text DEFAULT NULL,
  `tanggal_update` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id_setting`, `setting_key`, `setting_value`, `deskripsi`, `tanggal_update`) VALUES
(1, 'company_name', 'PT Percetakan Besar', 'Nama perusahaan', '2025-11-23 14:15:43'),
(2, 'company_phone', '021-1234567', 'Telepon perusahaan', '2025-11-23 14:15:43'),
(3, 'company_email', 'info@percetakan.com', 'Email perusahaan', '2025-11-23 14:15:43'),
(4, 'company_address', 'Jl. Contoh No. 123, Jakarta', 'Alamat perusahaan', '2025-11-23 14:15:43'),
(5, 'min_order_amount', '50000', 'Minimal pemesanan (Rp)', '2025-11-23 14:15:43'),
(6, 'loyalty_point_rate', '100', 'Poin per Rp 100 ribu', '2025-11-23 14:15:43'),
(7, 'default_capacity', '50', 'Kapasitas harian default', '2025-11-23 14:15:43');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id_user` int(11) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','kasir','operator','kurir','pelanggan') DEFAULT 'pelanggan',
  `no_telepon` varchar(20) DEFAULT NULL,
  `alamat` text DEFAULT NULL,
  `foto_profil` varchar(255) DEFAULT NULL,
  `status_aktif` tinyint(1) DEFAULT 1,
  `tanggal_daftar` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id_user`, `nama`, `email`, `password_hash`, `role`, `no_telepon`, `alamat`, `foto_profil`, `status_aktif`, `tanggal_daftar`) VALUES
(1, 'Admin Utama', 'admin@percetakan.com', '$2y$10$yVpAC/GvUqz.GFO7le0poOm6LjXyO8Pc8p5fAcBRpPeaACrEvJsjK', 'admin', '081234567890', NULL, NULL, 1, '2025-11-23 14:15:43'),
(2, 'Kasir 1', 'kasir@percetakan.com', '$2y$10$I0tYN1yVvkW4UR8rXWxXR.j4pOYl08bwYytgkEiTcf9Hw4AepVKsS', 'kasir', '081234567891', NULL, NULL, 1, '2025-11-23 14:15:43'),
(3, 'Operator Cetak', 'operator@percetakan.com', '$2y$10$JkLOSPYyoqoSkd9bL8ZqtO9MTRg.KTbDwAi545WEOWRgDsv7OQVv2', 'operator', '081234567892', NULL, NULL, 1, '2025-11-23 14:15:43'),
(4, 'Kurir 1', 'kurir@gmail.com', '$2y$10$.fz01oKyzpKMXiAIroTA5uRWtCZEePQVXEREA7E.HrSobOWtYQbjy', 'kurir', '081234567893', NULL, NULL, 1, '2025-11-23 14:15:43'),
(5, 'Customer Test', 'customer@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pelanggan', '081234567894', NULL, NULL, 1, '2025-11-23 14:15:43'),
(6, 'CUS-001 - halo', 'cus-001@guest.local', '$2y$10$N0xG264fzo8hzbzLh/QtRu5WURBUUfJnikzYCYWl6gtcOpPz9jZx2', 'pelanggan', '', '', NULL, 1, '2025-11-23 14:18:30'),
(7, 'CUS-002 - HALOOOO', 'cus-002@guest.local', '$2y$10$odn5PBamemN54U00u//8BO1dHVJK37nsPzkRqrUh1BZcXtD1psWyO', 'pelanggan', '', '', NULL, 1, '2025-11-23 14:23:38'),
(8, 'CUS-003 - asas', 'cus-003@guest.local', '$2y$10$lfO3w1roERBOi1r6kaqBru1Sru9B5z31ziUcgdktgjdTVOcMOTMo.', 'pelanggan', '', '', NULL, 1, '2025-11-23 14:24:47'),
(9, 'CUS-004 - aa', 'cus-004@guest.local', '$2y$10$td.5/EI.49IxQkoM8b2sEucKasAeX3VOhNGDwKx8iSGyoaw3yCSJ2', 'pelanggan', '', '', NULL, 1, '2025-11-23 14:25:26'),
(10, 'CUS-005 - azhel', 'cus-005@guest.local', '$2y$10$UitUMjHSMzeKPCeITsy6F.Fp5cSuseohXRqUF0ztgkSHwZ/1j36qa', 'pelanggan', '', '', NULL, 1, '2025-11-23 14:27:00'),
(11, 'CUS-006 - sasa', 'cus-006@guest.local', '$2y$10$5C2YiZYbj58GlNtf7THsPOiqyHGz1AN7mFJe.L8CyI1G3TXmfsF7C', 'pelanggan', '', '', NULL, 1, '2025-11-23 14:33:50'),
(12, 'CUS-007 - adas', 'cus-007@guest.local', '$2y$10$bOCT1Zc96Pc1XeWtQw9/9.C7hOaoG.tnRlZCwf3MSHKdDstXYzPdK', 'pelanggan', '', '', NULL, 1, '2025-11-23 14:34:49'),
(13, 'CUS-008 - sasa', 'cus-008@guest.local', '$2y$10$n5GiZxhsz6r3bGUgz./pxe/yHP9dQVPEegGq8yTqyW0aCloWnMDTO', 'pelanggan', '', '', NULL, 1, '2025-11-23 14:35:16'),
(14, 'CUS-009 - sasas', 'cus-009@guest.local', '$2y$10$9zV21dQL02sPdJbumCnB/u2o4iEtrFI1Th.j3GVWb8mYUTYIBwYWi', 'pelanggan', '', '', NULL, 1, '2025-11-23 14:37:35'),
(15, 'CUS-010 - adad', 'cus-010@guest.local', '$2y$10$wrwthNECF3H35mpeFASdNO7/i/dILMa5.LGrBXklhB9Sa8iAiqham', 'pelanggan', '', '', NULL, 1, '2025-11-23 14:39:45'),
(16, 'CUS-011 - asasa', 'cus-011@guest.local', '$2y$10$nuR/fKKmAQ1LJ04SE2iWJeKmFh0Fm0/P3oHJKi163e3BsK6rF7VvO', 'pelanggan', '', '', NULL, 1, '2025-11-23 14:42:48'),
(17, 'CUS-012 - asa', 'cus-012@guest.local', '$2y$10$kA6QkjKXPvE/q2a3tzqIveHlmys1nAefhqJNYjSuq/cKFew935IWi', 'pelanggan', '', '', NULL, 1, '2025-11-23 14:43:37'),
(18, 'Ayu Safitri', 'ayusafitri2789@gmail.com', '$2y$10$7/FA27Q8/fiXr8SHgwPK6us1bBmfU3Wu1c6COJqdnc2elhEEqrV8q', 'admin', '0895328651916', 'Jalan Kaja', NULL, 1, '2025-11-23 14:44:35'),
(19, 'CUS-013 - asas', 'cus-013@guest.local', '$2y$10$/kCC/wBUDY3y.3ry5.wWte3mdAQt9SCH/zOB2jZCuHDTfD8SqHBE.', 'pelanggan', '', '', NULL, 1, '2025-11-23 14:45:45'),
(20, 'CUS-014 - aa', 'cus-014@guest.local', '$2y$10$mlHOo9vB3uHVgZRA7VOUk.HF2BlUqnfJrDysBg0KeItN0Z5g46CUi', 'pelanggan', '', '', NULL, 1, '2025-11-23 14:46:13'),
(21, 'halo', 'i@gmail.com', '$2y$10$oSRb5SLgsDMfIBtPcaNBd.9rDZjj5.3SZxgnS1TNPPsrbLDbM9oAG', 'pelanggan', '85921113730', 'ok', NULL, 1, '2025-11-23 14:53:28');

-- --------------------------------------------------------

--
-- Table structure for table `validation_logs`
--

CREATE TABLE `validation_logs` (
  `id_validation` int(11) NOT NULL,
  `id_order` int(11) NOT NULL,
  `validation_type` enum('file','payment','address') NOT NULL,
  `status` enum('pass','fail','warning') NOT NULL,
  `message` text DEFAULT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `validation_logs`
--

INSERT INTO `validation_logs` (`id_validation`, `id_order`, `validation_type`, `status`, `message`, `details`, `created_at`) VALUES
(1, 1, 'file', 'pass', 'APPROVE WITH CAUTION - File OK tapi ada minor issues. Review manual disarankan.', '{\"is_valid\":true,\"confidence_score\":85,\"checks\":[{\"check\":\"Upload Status\",\"status\":\"pass\",\"value\":\"File berhasil diupload\"},{\"check\":\"File Size\",\"status\":\"pass\",\"value\":\"0.07 MB\"},{\"check\":\"File Format\",\"status\":\"pass\",\"value\":\"PNG\"},{\"check\":\"MIME Type\",\"status\":\"pass\",\"value\":\"image\\/png\"},{\"check\":\"File Integrity\",\"status\":\"pass\",\"value\":\"File dapat dibaca\"},{\"check\":\"Image Resolution\",\"status\":\"warning\",\"value\":\"500x500px\"},{\"check\":\"Image Validation\",\"status\":\"pass\",\"value\":\"Image structure valid\"}],\"errors\":[],\"warnings\":[\"Resolusi rendah (500x500px, ~109 DPI). Hasil cetak mungkin kurang tajam. Minimum rekomendasi: 1000x1000px\"],\"recommendation\":\"APPROVE WITH CAUTION - File OK tapi ada minor issues. Review manual disarankan.\",\"validated_at\":\"2025-11-23 15:18:30\"}', '2025-11-23 14:18:30'),
(2, 2, 'file', 'pass', 'APPROVE WITH CAUTION - File OK tapi ada minor issues. Review manual disarankan.', '{\"is_valid\":true,\"confidence_score\":85,\"checks\":[{\"check\":\"Upload Status\",\"status\":\"pass\",\"value\":\"File berhasil diupload\"},{\"check\":\"File Size\",\"status\":\"pass\",\"value\":\"0.07 MB\"},{\"check\":\"File Format\",\"status\":\"pass\",\"value\":\"PNG\"},{\"check\":\"MIME Type\",\"status\":\"pass\",\"value\":\"image\\/png\"},{\"check\":\"File Integrity\",\"status\":\"pass\",\"value\":\"File dapat dibaca\"},{\"check\":\"Image Resolution\",\"status\":\"warning\",\"value\":\"500x500px\"},{\"check\":\"Image Validation\",\"status\":\"pass\",\"value\":\"Image structure valid\"}],\"errors\":[],\"warnings\":[\"Resolusi rendah (500x500px, ~109 DPI). Hasil cetak mungkin kurang tajam. Minimum rekomendasi: 1000x1000px\"],\"recommendation\":\"APPROVE WITH CAUTION - File OK tapi ada minor issues. Review manual disarankan.\",\"validated_at\":\"2025-11-23 15:23:38\"}', '2025-11-23 14:23:38'),
(3, 2, 'file', 'pass', 'APPROVE WITH CAUTION - File OK tapi ada minor issues. Review manual disarankan.', '{\"is_valid\":true,\"confidence_score\":85,\"checks\":[{\"check\":\"Upload Status\",\"status\":\"pass\",\"value\":\"File berhasil diupload\"},{\"check\":\"File Size\",\"status\":\"pass\",\"value\":\"0.07 MB\"},{\"check\":\"File Format\",\"status\":\"pass\",\"value\":\"PNG\"},{\"check\":\"MIME Type\",\"status\":\"pass\",\"value\":\"image\\/png\"},{\"check\":\"File Integrity\",\"status\":\"pass\",\"value\":\"File dapat dibaca\"},{\"check\":\"Image Resolution\",\"status\":\"warning\",\"value\":\"500x500px\"},{\"check\":\"Image Validation\",\"status\":\"pass\",\"value\":\"Image structure valid\"}],\"errors\":[],\"warnings\":[\"Resolusi rendah (500x500px, ~109 DPI). Hasil cetak mungkin kurang tajam. Minimum rekomendasi: 1000x1000px\"],\"recommendation\":\"APPROVE WITH CAUTION - File OK tapi ada minor issues. Review manual disarankan.\",\"validated_at\":\"2025-11-23 15:23:38\"}', '2025-11-23 14:23:38'),
(4, 2, 'file', 'pass', 'APPROVE WITH CAUTION - File OK tapi ada minor issues. Review manual disarankan.', '{\"is_valid\":true,\"confidence_score\":85,\"checks\":[{\"check\":\"Upload Status\",\"status\":\"pass\",\"value\":\"File berhasil diupload\"},{\"check\":\"File Size\",\"status\":\"pass\",\"value\":\"0.07 MB\"},{\"check\":\"File Format\",\"status\":\"pass\",\"value\":\"PNG\"},{\"check\":\"MIME Type\",\"status\":\"pass\",\"value\":\"image\\/png\"},{\"check\":\"File Integrity\",\"status\":\"pass\",\"value\":\"File dapat dibaca\"},{\"check\":\"Image Resolution\",\"status\":\"warning\",\"value\":\"500x500px\"},{\"check\":\"Image Validation\",\"status\":\"pass\",\"value\":\"Image structure valid\"}],\"errors\":[],\"warnings\":[\"Resolusi rendah (500x500px, ~109 DPI). Hasil cetak mungkin kurang tajam. Minimum rekomendasi: 1000x1000px\"],\"recommendation\":\"APPROVE WITH CAUTION - File OK tapi ada minor issues. Review manual disarankan.\",\"validated_at\":\"2025-11-23 15:23:38\"}', '2025-11-23 14:23:38'),
(5, 3, 'file', 'pass', 'APPROVE WITH CAUTION - File OK tapi ada minor issues. Review manual disarankan.', '{\"is_valid\":true,\"confidence_score\":85,\"checks\":[{\"check\":\"Upload Status\",\"status\":\"pass\",\"value\":\"File berhasil diupload\"},{\"check\":\"File Size\",\"status\":\"pass\",\"value\":\"0.07 MB\"},{\"check\":\"File Format\",\"status\":\"pass\",\"value\":\"PNG\"},{\"check\":\"MIME Type\",\"status\":\"pass\",\"value\":\"image\\/png\"},{\"check\":\"File Integrity\",\"status\":\"pass\",\"value\":\"File dapat dibaca\"},{\"check\":\"Image Resolution\",\"status\":\"warning\",\"value\":\"500x500px\"},{\"check\":\"Image Validation\",\"status\":\"pass\",\"value\":\"Image structure valid\"}],\"errors\":[],\"warnings\":[\"Resolusi rendah (500x500px, ~109 DPI). Hasil cetak mungkin kurang tajam. Minimum rekomendasi: 1000x1000px\"],\"recommendation\":\"APPROVE WITH CAUTION - File OK tapi ada minor issues. Review manual disarankan.\",\"validated_at\":\"2025-11-23 15:24:47\"}', '2025-11-23 14:24:47'),
(6, 4, 'file', 'pass', 'APPROVE WITH CAUTION - File OK tapi ada minor issues. Review manual disarankan.', '{\"is_valid\":true,\"confidence_score\":85,\"checks\":[{\"check\":\"Upload Status\",\"status\":\"pass\",\"value\":\"File berhasil diupload\"},{\"check\":\"File Size\",\"status\":\"pass\",\"value\":\"0.07 MB\"},{\"check\":\"File Format\",\"status\":\"pass\",\"value\":\"PNG\"},{\"check\":\"MIME Type\",\"status\":\"pass\",\"value\":\"image\\/png\"},{\"check\":\"File Integrity\",\"status\":\"pass\",\"value\":\"File dapat dibaca\"},{\"check\":\"Image Resolution\",\"status\":\"warning\",\"value\":\"500x500px\"},{\"check\":\"Image Validation\",\"status\":\"pass\",\"value\":\"Image structure valid\"}],\"errors\":[],\"warnings\":[\"Resolusi rendah (500x500px, ~109 DPI). Hasil cetak mungkin kurang tajam. Minimum rekomendasi: 1000x1000px\"],\"recommendation\":\"APPROVE WITH CAUTION - File OK tapi ada minor issues. Review manual disarankan.\",\"validated_at\":\"2025-11-23 15:25:26\"}', '2025-11-23 14:25:26'),
(7, 5, 'file', 'pass', 'APPROVE WITH CAUTION - File OK tapi ada minor issues. Review manual disarankan.', '{\"is_valid\":true,\"confidence_score\":85,\"checks\":[{\"check\":\"Upload Status\",\"status\":\"pass\",\"value\":\"File berhasil diupload\"},{\"check\":\"File Size\",\"status\":\"pass\",\"value\":\"0.07 MB\"},{\"check\":\"File Format\",\"status\":\"pass\",\"value\":\"PNG\"},{\"check\":\"MIME Type\",\"status\":\"pass\",\"value\":\"image\\/png\"},{\"check\":\"File Integrity\",\"status\":\"pass\",\"value\":\"File dapat dibaca\"},{\"check\":\"Image Resolution\",\"status\":\"warning\",\"value\":\"500x500px\"},{\"check\":\"Image Validation\",\"status\":\"pass\",\"value\":\"Image structure valid\"}],\"errors\":[],\"warnings\":[\"Resolusi rendah (500x500px, ~109 DPI). Hasil cetak mungkin kurang tajam. Minimum rekomendasi: 1000x1000px\"],\"recommendation\":\"APPROVE WITH CAUTION - File OK tapi ada minor issues. Review manual disarankan.\",\"validated_at\":\"2025-11-23 15:27:00\"}', '2025-11-23 14:27:00'),
(8, 6, 'file', 'pass', 'APPROVE WITH CAUTION - File OK tapi ada minor issues. Review manual disarankan.', '{\"is_valid\":true,\"confidence_score\":85,\"checks\":[{\"check\":\"Upload Status\",\"status\":\"pass\",\"value\":\"File berhasil diupload\"},{\"check\":\"File Size\",\"status\":\"pass\",\"value\":\"0.07 MB\"},{\"check\":\"File Format\",\"status\":\"pass\",\"value\":\"PNG\"},{\"check\":\"MIME Type\",\"status\":\"pass\",\"value\":\"image\\/png\"},{\"check\":\"File Integrity\",\"status\":\"pass\",\"value\":\"File dapat dibaca\"},{\"check\":\"Image Resolution\",\"status\":\"warning\",\"value\":\"500x500px\"},{\"check\":\"Image Validation\",\"status\":\"pass\",\"value\":\"Image structure valid\"}],\"errors\":[],\"warnings\":[\"Resolusi rendah (500x500px, ~109 DPI). Hasil cetak mungkin kurang tajam. Minimum rekomendasi: 1000x1000px\"],\"recommendation\":\"APPROVE WITH CAUTION - File OK tapi ada minor issues. Review manual disarankan.\",\"validated_at\":\"2025-11-23 15:33:50\"}', '2025-11-23 14:33:50'),
(9, 7, 'file', 'pass', 'APPROVE WITH CAUTION - File OK tapi ada minor issues. Review manual disarankan.', '{\"is_valid\":true,\"confidence_score\":85,\"checks\":[{\"check\":\"Upload Status\",\"status\":\"pass\",\"value\":\"File berhasil diupload\"},{\"check\":\"File Size\",\"status\":\"pass\",\"value\":\"0.07 MB\"},{\"check\":\"File Format\",\"status\":\"pass\",\"value\":\"PNG\"},{\"check\":\"MIME Type\",\"status\":\"pass\",\"value\":\"image\\/png\"},{\"check\":\"File Integrity\",\"status\":\"pass\",\"value\":\"File dapat dibaca\"},{\"check\":\"Image Resolution\",\"status\":\"warning\",\"value\":\"500x500px\"},{\"check\":\"Image Validation\",\"status\":\"pass\",\"value\":\"Image structure valid\"}],\"errors\":[],\"warnings\":[\"Resolusi rendah (500x500px, ~109 DPI). Hasil cetak mungkin kurang tajam. Minimum rekomendasi: 1000x1000px\"],\"recommendation\":\"APPROVE WITH CAUTION - File OK tapi ada minor issues. Review manual disarankan.\",\"validated_at\":\"2025-11-23 15:34:49\"}', '2025-11-23 14:34:49'),
(10, 8, 'file', 'pass', 'APPROVE WITH CAUTION - File OK tapi ada minor issues. Review manual disarankan.', '{\"is_valid\":true,\"confidence_score\":85,\"checks\":[{\"check\":\"Upload Status\",\"status\":\"pass\",\"value\":\"File berhasil diupload\"},{\"check\":\"File Size\",\"status\":\"pass\",\"value\":\"0.07 MB\"},{\"check\":\"File Format\",\"status\":\"pass\",\"value\":\"PNG\"},{\"check\":\"MIME Type\",\"status\":\"pass\",\"value\":\"image\\/png\"},{\"check\":\"File Integrity\",\"status\":\"pass\",\"value\":\"File dapat dibaca\"},{\"check\":\"Image Resolution\",\"status\":\"warning\",\"value\":\"500x500px\"},{\"check\":\"Image Validation\",\"status\":\"pass\",\"value\":\"Image structure valid\"}],\"errors\":[],\"warnings\":[\"Resolusi rendah (500x500px, ~109 DPI). Hasil cetak mungkin kurang tajam. Minimum rekomendasi: 1000x1000px\"],\"recommendation\":\"APPROVE WITH CAUTION - File OK tapi ada minor issues. Review manual disarankan.\",\"validated_at\":\"2025-11-23 15:35:16\"}', '2025-11-23 14:35:16'),
(11, 9, 'file', 'pass', 'APPROVE WITH CAUTION - File OK tapi ada minor issues. Review manual disarankan.', '{\"is_valid\":true,\"confidence_score\":85,\"checks\":[{\"check\":\"Upload Status\",\"status\":\"pass\",\"value\":\"File berhasil diupload\"},{\"check\":\"File Size\",\"status\":\"pass\",\"value\":\"0.07 MB\"},{\"check\":\"File Format\",\"status\":\"pass\",\"value\":\"PNG\"},{\"check\":\"MIME Type\",\"status\":\"pass\",\"value\":\"image\\/png\"},{\"check\":\"File Integrity\",\"status\":\"pass\",\"value\":\"File dapat dibaca\"},{\"check\":\"Image Resolution\",\"status\":\"warning\",\"value\":\"500x500px\"},{\"check\":\"Image Validation\",\"status\":\"pass\",\"value\":\"Image structure valid\"}],\"errors\":[],\"warnings\":[\"Resolusi rendah (500x500px, ~109 DPI). Hasil cetak mungkin kurang tajam. Minimum rekomendasi: 1000x1000px\"],\"recommendation\":\"APPROVE WITH CAUTION - File OK tapi ada minor issues. Review manual disarankan.\",\"validated_at\":\"2025-11-23 15:37:35\"}', '2025-11-23 14:37:35'),
(12, 10, 'file', 'pass', 'APPROVE WITH CAUTION - File OK tapi ada minor issues. Review manual disarankan.', '{\"is_valid\":true,\"confidence_score\":85,\"checks\":[{\"check\":\"Upload Status\",\"status\":\"pass\",\"value\":\"File berhasil diupload\"},{\"check\":\"File Size\",\"status\":\"pass\",\"value\":\"0.07 MB\"},{\"check\":\"File Format\",\"status\":\"pass\",\"value\":\"PNG\"},{\"check\":\"MIME Type\",\"status\":\"pass\",\"value\":\"image\\/png\"},{\"check\":\"File Integrity\",\"status\":\"pass\",\"value\":\"File dapat dibaca\"},{\"check\":\"Image Resolution\",\"status\":\"warning\",\"value\":\"500x500px\"},{\"check\":\"Image Validation\",\"status\":\"pass\",\"value\":\"Image structure valid\"}],\"errors\":[],\"warnings\":[\"Resolusi rendah (500x500px, ~109 DPI). Hasil cetak mungkin kurang tajam. Minimum rekomendasi: 1000x1000px\"],\"recommendation\":\"APPROVE WITH CAUTION - File OK tapi ada minor issues. Review manual disarankan.\",\"validated_at\":\"2025-11-23 15:39:46\"}', '2025-11-23 14:39:46'),
(13, 11, 'file', 'pass', 'APPROVE WITH CAUTION - File OK tapi ada minor issues. Review manual disarankan.', '{\"is_valid\":true,\"confidence_score\":85,\"checks\":[{\"check\":\"Upload Status\",\"status\":\"pass\",\"value\":\"File berhasil diupload\"},{\"check\":\"File Size\",\"status\":\"pass\",\"value\":\"0.07 MB\"},{\"check\":\"File Format\",\"status\":\"pass\",\"value\":\"PNG\"},{\"check\":\"MIME Type\",\"status\":\"pass\",\"value\":\"image\\/png\"},{\"check\":\"File Integrity\",\"status\":\"pass\",\"value\":\"File dapat dibaca\"},{\"check\":\"Image Resolution\",\"status\":\"warning\",\"value\":\"500x500px\"},{\"check\":\"Image Validation\",\"status\":\"pass\",\"value\":\"Image structure valid\"}],\"errors\":[],\"warnings\":[\"Resolusi rendah (500x500px, ~109 DPI). Hasil cetak mungkin kurang tajam. Minimum rekomendasi: 1000x1000px\"],\"recommendation\":\"APPROVE WITH CAUTION - File OK tapi ada minor issues. Review manual disarankan.\",\"validated_at\":\"2025-11-23 15:42:48\"}', '2025-11-23 14:42:48'),
(14, 12, 'file', 'pass', 'APPROVE WITH CAUTION - File OK tapi ada minor issues. Review manual disarankan.', '{\"is_valid\":true,\"confidence_score\":85,\"checks\":[{\"check\":\"Upload Status\",\"status\":\"pass\",\"value\":\"File berhasil diupload\"},{\"check\":\"File Size\",\"status\":\"pass\",\"value\":\"0.07 MB\"},{\"check\":\"File Format\",\"status\":\"pass\",\"value\":\"PNG\"},{\"check\":\"MIME Type\",\"status\":\"pass\",\"value\":\"image\\/png\"},{\"check\":\"File Integrity\",\"status\":\"pass\",\"value\":\"File dapat dibaca\"},{\"check\":\"Image Resolution\",\"status\":\"warning\",\"value\":\"500x500px\"},{\"check\":\"Image Validation\",\"status\":\"pass\",\"value\":\"Image structure valid\"}],\"errors\":[],\"warnings\":[\"Resolusi rendah (500x500px, ~109 DPI). Hasil cetak mungkin kurang tajam. Minimum rekomendasi: 1000x1000px\"],\"recommendation\":\"APPROVE WITH CAUTION - File OK tapi ada minor issues. Review manual disarankan.\",\"validated_at\":\"2025-11-23 15:43:38\"}', '2025-11-23 14:43:38'),
(15, 13, 'file', 'pass', 'AUTO APPROVE - File berkualitas tinggi, siap produksi.', '{\"is_valid\":true,\"confidence_score\":100,\"checks\":[{\"check\":\"Upload Status\",\"status\":\"pass\",\"value\":\"File berhasil diupload\"},{\"check\":\"File Size\",\"status\":\"pass\",\"value\":\"0.11 MB\"},{\"check\":\"File Format\",\"status\":\"pass\",\"value\":\"PNG\"},{\"check\":\"MIME Type\",\"status\":\"pass\",\"value\":\"image\\/png\"},{\"check\":\"File Integrity\",\"status\":\"pass\",\"value\":\"File dapat dibaca\"},{\"check\":\"Image Resolution\",\"status\":\"pass\",\"value\":\"1643x1079px (~234 DPI)\"},{\"check\":\"Image Validation\",\"status\":\"pass\",\"value\":\"Image structure valid\"}],\"errors\":[],\"warnings\":[],\"recommendation\":\"AUTO APPROVE - File berkualitas tinggi, siap produksi.\",\"validated_at\":\"2025-11-23 15:45:45\"}', '2025-11-23 14:45:45'),
(16, 14, 'file', 'pass', 'APPROVE WITH CAUTION - File OK tapi ada minor issues. Review manual disarankan.', '{\"is_valid\":true,\"confidence_score\":85,\"checks\":[{\"check\":\"Upload Status\",\"status\":\"pass\",\"value\":\"File berhasil diupload\"},{\"check\":\"File Size\",\"status\":\"pass\",\"value\":\"0.07 MB\"},{\"check\":\"File Format\",\"status\":\"pass\",\"value\":\"PNG\"},{\"check\":\"MIME Type\",\"status\":\"pass\",\"value\":\"image\\/png\"},{\"check\":\"File Integrity\",\"status\":\"pass\",\"value\":\"File dapat dibaca\"},{\"check\":\"Image Resolution\",\"status\":\"warning\",\"value\":\"500x500px\"},{\"check\":\"Image Validation\",\"status\":\"pass\",\"value\":\"Image structure valid\"}],\"errors\":[],\"warnings\":[\"Resolusi rendah (500x500px, ~109 DPI). Hasil cetak mungkin kurang tajam. Minimum rekomendasi: 1000x1000px\"],\"recommendation\":\"APPROVE WITH CAUTION - File OK tapi ada minor issues. Review manual disarankan.\",\"validated_at\":\"2025-11-23 15:46:13\"}', '2025-11-23 14:46:13'),
(17, 15, 'file', 'pass', 'APPROVE WITH CAUTION - File OK tapi ada minor issues. Review manual disarankan.', '{\"is_valid\":true,\"confidence_score\":85,\"checks\":[{\"check\":\"Upload Status\",\"status\":\"pass\",\"value\":\"File berhasil diupload\"},{\"check\":\"File Size\",\"status\":\"pass\",\"value\":\"0.12 MB\"},{\"check\":\"File Format\",\"status\":\"pass\",\"value\":\"JPG\"},{\"check\":\"MIME Type\",\"status\":\"pass\",\"value\":\"image\\/jpeg\"},{\"check\":\"File Integrity\",\"status\":\"pass\",\"value\":\"File dapat dibaca\"},{\"check\":\"Image Resolution\",\"status\":\"warning\",\"value\":\"899x1600px\"},{\"check\":\"Image Validation\",\"status\":\"pass\",\"value\":\"Image structure valid\"}],\"errors\":[],\"warnings\":[\"Resolusi rendah (899x1600px, ~276 DPI). Hasil cetak mungkin kurang tajam. Minimum rekomendasi: 1000x1000px\"],\"recommendation\":\"APPROVE WITH CAUTION - File OK tapi ada minor issues. Review manual disarankan.\",\"validated_at\":\"2025-11-23 15:53:51\"}', '2025-11-23 14:53:51'),
(18, 15, 'payment', 'pass', 'APPROVE WITH CAUTION - Pembayaran kemungkinan valid, verifikasi manual disarankan.', '{\"is_valid\":true,\"confidence_score\":85,\"extracted_data\":{\"amount\":31144,\"sender_name\":\"Customer\",\"bank\":\"UNKNOWN\",\"date\":\"2025-11-23\",\"reference_number\":\"6354D08A68\",\"ocr_confidence\":91},\"checks\":[{\"check\":\"File Format\",\"status\":\"pass\",\"value\":\"JPG\"},{\"check\":\"File Size\",\"status\":\"pass\",\"value\":\"0.1 MB\"},{\"check\":\"OCR Extraction\",\"status\":\"pass\",\"value\":\"Data extracted with 91% confidence\"},{\"check\":\"Amount Validation\",\"status\":\"pass\",\"value\":\"Rp 31.144 (validation skipped for testing)\"},{\"check\":\"Date Validation\",\"status\":\"pass\",\"value\":\"23 Nov 2025 (1 days ago)\"},{\"check\":\"Bank Validation\",\"status\":\"warning\",\"value\":\"Bank not detected\"},{\"check\":\"Sender Name\",\"status\":\"warning\",\"value\":\"Not detected\"}],\"errors\":[],\"warnings\":[\"Tidak dapat mendeteksi bank tujuan dari gambar\",\"Tidak dapat mendeteksi nama pengirim dari gambar\"],\"recommendation\":\"APPROVE WITH CAUTION - Pembayaran kemungkinan valid, verifikasi manual disarankan.\",\"validated_at\":\"2025-11-23 15:53:52\"}', '2025-11-23 14:53:52');

-- --------------------------------------------------------

--
-- Table structure for table `work_calendar`
--

CREATE TABLE `work_calendar` (
  `id_calendar` int(11) NOT NULL,
  `tanggal` date NOT NULL,
  `kapasitas_harian` int(11) DEFAULT 50,
  `order_terjadwal` int(11) DEFAULT 0,
  `status_hari` enum('buka','tutup','libur') DEFAULT 'buka',
  `catatan` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id_log`),
  ADD KEY `idx_user` (`id_user`),
  ADD KEY `idx_tanggal` (`tanggal_aksi`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id_category`);

--
-- Indexes for table `deliveries`
--
ALTER TABLE `deliveries`
  ADD PRIMARY KEY (`id_delivery`),
  ADD KEY `idx_order` (`id_order`),
  ADD KEY `idx_kurir` (`id_kurir`),
  ADD KEY `idx_status` (`status_pengiriman`);

--
-- Indexes for table `design_files`
--
ALTER TABLE `design_files`
  ADD PRIMARY KEY (`id_file`),
  ADD KEY `idx_order` (`id_order`),
  ADD KEY `idx_status` (`status_validasi`);

--
-- Indexes for table `loyalty_points`
--
ALTER TABLE `loyalty_points`
  ADD PRIMARY KEY (`id_point`),
  ADD KEY `id_order` (`id_order`),
  ADD KEY `idx_user` (`id_user`),
  ADD KEY `idx_jenis` (`jenis`),
  ADD KEY `idx_tanggal` (`tanggal_transaksi`);

--
-- Indexes for table `materials`
--
ALTER TABLE `materials`
  ADD PRIMARY KEY (`id_material`),
  ADD KEY `idx_jenis` (`jenis_bahan`),
  ADD KEY `idx_stok` (`stok_sisa`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id_notif`),
  ADD KEY `idx_user` (`id_user`),
  ADD KEY `idx_status` (`status_baca`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id_order`),
  ADD UNIQUE KEY `kode_order` (`kode_order`),
  ADD KEY `id_kasir` (`id_kasir`),
  ADD KEY `idx_kode` (`kode_order`),
  ADD KEY `idx_user` (`id_user`),
  ADD KEY `idx_status` (`status_order`),
  ADD KEY `idx_tanggal` (`tanggal_order`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id_item`),
  ADD KEY `idx_order` (`id_order`),
  ADD KEY `idx_product` (`id_product`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id_payment`),
  ADD KEY `id_admin_konfirmasi` (`id_admin_konfirmasi`),
  ADD KEY `idx_order` (`id_order`),
  ADD KEY `idx_status` (`status_pembayaran`);

--
-- Indexes for table `price_variants`
--
ALTER TABLE `price_variants`
  ADD PRIMARY KEY (`id_variant`),
  ADD KEY `idx_product` (`id_product`);

--
-- Indexes for table `production_queue`
--
ALTER TABLE `production_queue`
  ADD PRIMARY KEY (`id_queue`),
  ADD KEY `idx_order` (`id_order`),
  ADD KEY `idx_operator` (`id_operator`),
  ADD KEY `idx_status` (`status_produksi`),
  ADD KEY `idx_prioritas` (`prioritas`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id_product`),
  ADD KEY `idx_category` (`id_category`),
  ADD KEY `idx_status` (`status_aktif`);

--
-- Indexes for table `promotions`
--
ALTER TABLE `promotions`
  ADD PRIMARY KEY (`id_promo`),
  ADD UNIQUE KEY `kode_promo` (`kode_promo`),
  ADD KEY `idx_kode` (`kode_promo`),
  ADD KEY `idx_tanggal` (`tanggal_mulai`,`tanggal_akhir`);

--
-- Indexes for table `result_files`
--
ALTER TABLE `result_files`
  ADD PRIMARY KEY (`id_result`),
  ADD KEY `idx_order` (`id_order`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id_review`),
  ADD KEY `idx_order` (`id_order`),
  ADD KEY `idx_user` (`id_user`),
  ADD KEY `idx_rating` (`rating`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id_setting`),
  ADD UNIQUE KEY `setting_key` (`setting_key`),
  ADD KEY `idx_key` (`setting_key`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id_user`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`);

--
-- Indexes for table `validation_logs`
--
ALTER TABLE `validation_logs`
  ADD PRIMARY KEY (`id_validation`),
  ADD KEY `idx_order` (`id_order`),
  ADD KEY `idx_type` (`validation_type`);

--
-- Indexes for table `work_calendar`
--
ALTER TABLE `work_calendar`
  ADD PRIMARY KEY (`id_calendar`),
  ADD UNIQUE KEY `tanggal` (`tanggal`),
  ADD KEY `idx_tanggal` (`tanggal`),
  ADD KEY `idx_status` (`status_hari`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id_log` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id_category` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `deliveries`
--
ALTER TABLE `deliveries`
  MODIFY `id_delivery` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `design_files`
--
ALTER TABLE `design_files`
  MODIFY `id_file` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `loyalty_points`
--
ALTER TABLE `loyalty_points`
  MODIFY `id_point` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `materials`
--
ALTER TABLE `materials`
  MODIFY `id_material` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id_notif` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id_order` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id_item` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id_payment` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `price_variants`
--
ALTER TABLE `price_variants`
  MODIFY `id_variant` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `production_queue`
--
ALTER TABLE `production_queue`
  MODIFY `id_queue` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id_product` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `promotions`
--
ALTER TABLE `promotions`
  MODIFY `id_promo` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `result_files`
--
ALTER TABLE `result_files`
  MODIFY `id_result` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id_review` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id_setting` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `validation_logs`
--
ALTER TABLE `validation_logs`
  MODIFY `id_validation` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `work_calendar`
--
ALTER TABLE `work_calendar`
  MODIFY `id_calendar` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE SET NULL;

--
-- Constraints for table `deliveries`
--
ALTER TABLE `deliveries`
  ADD CONSTRAINT `deliveries_ibfk_1` FOREIGN KEY (`id_order`) REFERENCES `orders` (`id_order`) ON DELETE CASCADE,
  ADD CONSTRAINT `deliveries_ibfk_2` FOREIGN KEY (`id_kurir`) REFERENCES `users` (`id_user`) ON DELETE SET NULL;

--
-- Constraints for table `design_files`
--
ALTER TABLE `design_files`
  ADD CONSTRAINT `design_files_ibfk_1` FOREIGN KEY (`id_order`) REFERENCES `orders` (`id_order`) ON DELETE CASCADE;

--
-- Constraints for table `loyalty_points`
--
ALTER TABLE `loyalty_points`
  ADD CONSTRAINT `loyalty_points_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE,
  ADD CONSTRAINT `loyalty_points_ibfk_2` FOREIGN KEY (`id_order`) REFERENCES `orders` (`id_order`) ON DELETE SET NULL;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`),
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`id_kasir`) REFERENCES `users` (`id_user`) ON DELETE SET NULL;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`id_order`) REFERENCES `orders` (`id_order`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`id_product`) REFERENCES `products` (`id_product`);

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`id_order`) REFERENCES `orders` (`id_order`) ON DELETE CASCADE,
  ADD CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`id_admin_konfirmasi`) REFERENCES `users` (`id_user`) ON DELETE SET NULL;

--
-- Constraints for table `price_variants`
--
ALTER TABLE `price_variants`
  ADD CONSTRAINT `price_variants_ibfk_1` FOREIGN KEY (`id_product`) REFERENCES `products` (`id_product`) ON DELETE CASCADE;

--
-- Constraints for table `production_queue`
--
ALTER TABLE `production_queue`
  ADD CONSTRAINT `production_queue_ibfk_1` FOREIGN KEY (`id_order`) REFERENCES `orders` (`id_order`) ON DELETE CASCADE,
  ADD CONSTRAINT `production_queue_ibfk_2` FOREIGN KEY (`id_operator`) REFERENCES `users` (`id_user`) ON DELETE SET NULL;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`id_category`) REFERENCES `categories` (`id_category`) ON DELETE SET NULL;

--
-- Constraints for table `result_files`
--
ALTER TABLE `result_files`
  ADD CONSTRAINT `result_files_ibfk_1` FOREIGN KEY (`id_order`) REFERENCES `orders` (`id_order`) ON DELETE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`id_order`) REFERENCES `orders` (`id_order`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE;

--
-- Constraints for table `validation_logs`
--
ALTER TABLE `validation_logs`
  ADD CONSTRAINT `validation_logs_ibfk_1` FOREIGN KEY (`id_order`) REFERENCES `orders` (`id_order`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
