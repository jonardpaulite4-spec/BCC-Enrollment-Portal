-- =====================================================================
-- Baao Community College — Unified Enrollment Portal
-- MySQL schema + seed data
--
-- Usage:
--   mysql -u root -p < schema.sql
-- =====================================================================

CREATE DATABASE IF NOT EXISTS baaocc_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE baaocc_portal;

-- ---------------------------------------------------------------------
-- Accounts
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS registrars (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  department VARCHAR(150),
  password VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS instructors (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255),
  subjects JSON,           -- array of subject codes, e.g. ["CC 101","CC 105"]
  notifications JSON,      -- array of { id, title, message, date, read }
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150),
  password VARCHAR(255),
  mobile VARCHAR(30),
  birthday VARCHAR(20),
  address VARCHAR(255),
  emergency_contact_name VARCHAR(150),
  emergency_contact_number VARCHAR(30),
  program VARCHAR(200),
  major VARCHAR(200),
  year_level VARCHAR(20),
  academic_year VARCHAR(20),
  semester VARCHAR(30),
  section VARCHAR(100),
  status VARCHAR(30) DEFAULT 'Pending',
  enrollment_type VARCHAR(40) DEFAULT 'Freshman',
  instructor VARCHAR(150),
  schedule VARCHAR(150),
  room_lab VARCHAR(150),
  subjects JSON,           -- array of { id, code, title, units, instructor, schedule, room, grades:{midterm,final} }
  attendance JSON,         -- { "SUBJCODE": { "YYYY-MM-DD": "Present|Absent|..." } }
  notifications JSON,      -- array of { id, title, message, date, read }
  docs JSON,                -- array of { name, status, fileName, fileUri, fileType }
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- Academic catalog (managed by Registrar / Admin)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sections (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  max_capacity INT DEFAULT 30
);

CREATE TABLE IF NOT EXISTS subjects (
  id VARCHAR(20) PRIMARY KEY,
  code VARCHAR(30) NOT NULL,
  title VARCHAR(200) NOT NULL,
  units INT DEFAULT 3
);

CREATE TABLE IF NOT EXISTS rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS course_majors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_name VARCHAR(200) NOT NULL,
  major_name VARCHAR(200) NOT NULL,
  UNIQUE KEY uniq_course_major (course_name, major_name),
  CONSTRAINT fk_course_major_course FOREIGN KEY (course_name) REFERENCES courses(name)
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS announcements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  target VARCHAR(20) NOT NULL, -- students | instructor | both
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- Seed data — mirrors the demo data that ships in app.js so the app
-- looks the same whether it's running off local state or this database.
-- =====================================================================

INSERT IGNORE INTO admins (id, name, email, password) VALUES
  ('ADM-01', 'System Administrator', 'admin@baaocc.edu.ph', 'admin123');

INSERT IGNORE INTO registrars (id, name, email, department, password) VALUES
  ('REG-01', 'Officer Santos', 'officer.santos@baaocc.edu.ph', 'Main Registrar Office', 'registrar123');

INSERT IGNORE INTO instructors (id, name, email, subjects, notifications) VALUES
  ('INS-01', 'Prof. GR Atienza', 'gr.atienza@baaocc.edu.ph', JSON_ARRAY('CC 101', 'CC 105'), JSON_ARRAY()),
  ('INS-02', 'Dr. Maria Santos', 'maria.santos@baaocc.edu.ph', JSON_ARRAY('HCI 101'), JSON_ARRAY()),
  ('INS-03', 'Engr. Ramon Reyes', 'ramon.reyes@baaocc.edu.ph', JSON_ARRAY('CC 102'), JSON_ARRAY());

INSERT IGNORE INTO sections (id, name, max_capacity) VALUES
  ('SEC-101', 'ACT 1-A', 30),
  ('SEC-102', 'BSIT 1-A', 35),
  ('SEC-103', 'BSIT 1-B', 30);

INSERT IGNORE INTO subjects (id, code, title, units) VALUES
  ('CC101', 'CC 101', 'Introduction to Computing', 3),
  ('CC102', 'CC 102', 'Computer Programming 1', 3),
  ('CC105', 'CC 105', 'Information Management', 3),
  ('HCI101', 'HCI 101', 'Human-Computer Interaction', 3),
  ('NSTP1', 'NSTP 1', 'National Service Training Program 1', 3);

INSERT IGNORE INTO rooms (name) VALUES
  ('Lecture Room 101'), ('Lecture Room 102'), ('Computer Lab 1'), ('Computer Lab 2'), ('Multimedia Lab');

INSERT IGNORE INTO courses (name) VALUES
  ('ACT - Associate in Computer Technology'),
  ('BSIT - Information Technology'),
  ('BSED - Secondary Education'),
  ('BEED - Elementary Education'),
  ('BSBA - Business Administration');

INSERT IGNORE INTO course_majors (course_name, major_name) VALUES
  ('ACT - Associate in Computer Technology', 'Application Development'),
  ('ACT - Associate in Computer Technology', 'Networking'),
  ('BSIT - Information Technology', 'Web and Mobile Application Development'),
  ('BSIT - Information Technology', 'Network and Cybersecurity'),
  ('BSED - Secondary Education', 'English'),
  ('BSED - Secondary Education', 'Mathematics'),
  ('BSED - Secondary Education', 'Filipino'),
  ('BEED - Elementary Education', 'General Education'),
  ('BSBA - Business Administration', 'Marketing Management'),
  ('BSBA - Business Administration', 'Human Resource Management');

INSERT IGNORE INTO students (
  id, name, email, mobile, birthday, address, emergency_contact_name, emergency_contact_number,
  program, major, year_level, academic_year, semester, section, status, instructor, schedule, room_lab,
  subjects, attendance, notifications, docs
) VALUES (
  'STU-26-2925', 'Jonard Q. Paulite', 'jonard.paulite@baaocc.edu.ph', '09123456789', '01/15/2005',
  'Zone 3, Baao, Camarines Sur', 'Maria Paulite', '09987654321',
  'ACT - Application Development', '', '1st Year', '2026-2027', '1st Semester', 'ACT 1-A', 'Pending', '', '', '',
  JSON_ARRAY(), JSON_OBJECT(),
  JSON_ARRAY(
    JSON_OBJECT('id', '1', 'title', 'Schedule Pending', 'message', 'Your registration is currently under review by the registrar.', 'date', 'Today', 'read', false),
    JSON_OBJECT('id', '2', 'title', 'Document Upload Required', 'message', 'Please ensure your PSA Birth Certificate is attached.', 'date', 'Yesterday', 'read', false)
  ),
  JSON_ARRAY(
    JSON_OBJECT('name', 'Form 138 / Report Card', 'status', 'Pending', 'fileName', '', 'fileUri', NULL, 'fileType', ''),
    JSON_OBJECT('name', 'Good Moral Certificate', 'status', 'Pending', 'fileName', '', 'fileUri', NULL, 'fileType', ''),
    JSON_OBJECT('name', 'PSA Birth Certificate', 'status', 'Pending', 'fileName', '', 'fileUri', NULL, 'fileType', ''),
    JSON_OBJECT('name', '2x2 ID Photo', 'status', 'Pending', 'fileName', '', 'fileUri', NULL, 'fileType', '')
  )
);