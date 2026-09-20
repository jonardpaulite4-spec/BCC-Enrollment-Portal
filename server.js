const express = require("express");
const cors = require("cors");
const os = require("os");
const pool = require("./db");
require("dotenv").config();

const app = express();
const allowedOrigins = (process.env.CORS_ORIGINS || "").split(",").map(v => v.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("CORS origin not allowed"));
  },
  credentials: true,
}));
app.use(express.json({ limit: "15mb" }));
app.use(express.static(__dirname, { index: "index.html" }));

const PORT = process.env.PORT || 4000;

/* ---------------------------------------------------------------------
   Helpers — mysql2 can return JSON columns already parsed depending on
   version/config, so parseJson() is defensive either way. Row <-> API
   shape converters keep DB (snake_case) separate from the frontend's
   camelCase state shape.
--------------------------------------------------------------------- */
function parseJson(val, fallback) {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "string") {
    try { return JSON.parse(val); } catch { return fallback; }
  }
  return val;
}
function autoId(prefix) {
  const year = new Date().getFullYear().toString().slice(-2);
  return `${prefix}-${year}-${Math.floor(1000 + Math.random() * 9000)}`;
}
function asyncRoute(fn) {
  return (req, res) => fn(req, res).catch((err) => {
    console.error(err);
    res.status(500).json({ error: err.message });
  });
}

/* ---- Students ---- */
function studentRowToApi(r) {
  return {
    id: r.id, name: r.name, email: r.email, mobile: r.mobile, birthday: r.birthday, address: r.address,
    emergencyContactName: r.emergency_contact_name, emergencyContactNumber: r.emergency_contact_number,
    program: r.program, major: r.major, yearLevel: r.year_level, academicYear: r.academic_year,
    semester: r.semester, section: r.section, status: r.status, enrollmentType: r.enrollment_type || "Freshman", instructor: r.instructor,
    schedule: r.schedule, roomLab: r.room_lab,
    subjects: parseJson(r.subjects, []), attendance: parseJson(r.attendance, {}),
    notifications: parseJson(r.notifications, []), docs: parseJson(r.docs, []),
  };
}
function studentApiToRow(s) {
  return [
    s.name, s.email || null, s.mobile || null, s.birthday || null, s.address || null,
    s.emergencyContactName || null, s.emergencyContactNumber || null, s.program || null, s.major || null,
    s.yearLevel || null, s.academicYear || null, s.semester || null, s.section || null, s.status || "Pending",
    s.enrollmentType || "Freshman",
    s.instructor || null, s.schedule || null, s.roomLab || null,
    JSON.stringify(s.subjects || []), JSON.stringify(s.attendance || {}),
    JSON.stringify(s.notifications || []), JSON.stringify(s.docs || []),
  ];
}

app.get("/api/students", asyncRoute(async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM students ORDER BY created_at DESC");
  res.json(rows.map(studentRowToApi));
}));
app.post("/api/students", asyncRoute(async (req, res) => {
  const id = req.body.id || autoId("STU");
  await pool.query(
    `INSERT INTO students (id, name, email, mobile, birthday, address, emergency_contact_name, emergency_contact_number,
      program, major, year_level, academic_year, semester, section, status, enrollment_type, instructor, schedule, room_lab,
      subjects, attendance, notifications, docs) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, ...studentApiToRow(req.body)]
  );
  res.status(201).json({ ...req.body, id });
}));
app.put("/api/students/:id", asyncRoute(async (req, res) => {
  await pool.query(
    `UPDATE students SET name=?, email=?, mobile=?, birthday=?, address=?, emergency_contact_name=?, emergency_contact_number=?,
      program=?, major=?, year_level=?, academic_year=?, semester=?, section=?, status=?, enrollment_type=?, instructor=?, schedule=?, room_lab=?,
      subjects=?, attendance=?, notifications=?, docs=? WHERE id=?`,
    [...studentApiToRow(req.body), req.params.id]
  );
  res.json(req.body);
}));
app.delete("/api/students/:id", asyncRoute(async (req, res) => {
  await pool.query("DELETE FROM students WHERE id=?", [req.params.id]);
  res.status(204).end();
}));

/* ---- Instructors ---- */
function instructorRowToApi(r) {
  return { id: r.id, name: r.name, email: r.email, subjects: parseJson(r.subjects, []), notifications: parseJson(r.notifications, []) };
}
app.get("/api/instructors", asyncRoute(async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM instructors ORDER BY created_at DESC");
  res.json(rows.map(instructorRowToApi));
}));
app.post("/api/instructors", asyncRoute(async (req, res) => {
  const id = req.body.id || autoId("INS");
  const { name, email, subjects = [], notifications = [] } = req.body;
  await pool.query("INSERT INTO instructors (id, name, email, subjects, notifications) VALUES (?, ?, ?, ?, ?)",
    [id, name, email, JSON.stringify(subjects), JSON.stringify(notifications)]);
  res.status(201).json({ ...req.body, id });
}));
app.put("/api/instructors/:id", asyncRoute(async (req, res) => {
  const { name, email, subjects = [], notifications = [] } = req.body;
  await pool.query("UPDATE instructors SET name=?, email=?, subjects=?, notifications=? WHERE id=?",
    [name, email, JSON.stringify(subjects), JSON.stringify(notifications), req.params.id]);
  res.json(req.body);
}));
app.delete("/api/instructors/:id", asyncRoute(async (req, res) => {
  await pool.query("DELETE FROM instructors WHERE id=?", [req.params.id]);
  res.status(204).end();
}));

/* ---- Registrars ---- */
app.get("/api/registrars", asyncRoute(async (req, res) => {
  const [rows] = await pool.query("SELECT id, name, email, department, password FROM registrars ORDER BY created_at DESC");
  res.json(rows);
}));
app.post("/api/registrars", asyncRoute(async (req, res) => {
  const id = req.body.id || autoId("REG");
  const { name, email, department = "", password = "" } = req.body;
  await pool.query("INSERT INTO registrars (id, name, email, department, password) VALUES (?, ?, ?, ?, ?)", [id, name, email, department, password]);
  res.status(201).json({ id, name, email, department, password });
}));
app.put("/api/registrars/:id", asyncRoute(async (req, res) => {
  const { name, email, department = "", password } = req.body;
  if (password !== undefined) {
    await pool.query("UPDATE registrars SET name=?, email=?, department=?, password=? WHERE id=?", [name, email, department, password, req.params.id]);
  } else {
    await pool.query("UPDATE registrars SET name=?, email=?, department=? WHERE id=?", [name, email, department, req.params.id]);
  }
  res.json(req.body);
}));
app.delete("/api/registrars/:id", asyncRoute(async (req, res) => {
  await pool.query("DELETE FROM registrars WHERE id=?", [req.params.id]);
  res.status(204).end();
}));

/* ---- Admins ---- */
app.get("/api/admins", asyncRoute(async (req, res) => {
  const [rows] = await pool.query("SELECT id, name, email, password FROM admins ORDER BY created_at DESC");
  res.json(rows);
}));
app.post("/api/admins", asyncRoute(async (req, res) => {
  const id = req.body.id || autoId("ADM");
  const { name, email, password } = req.body;
  await pool.query("INSERT INTO admins (id, name, email, password) VALUES (?, ?, ?, ?)", [id, name, email, password]);
  res.status(201).json({ id, name, email });
}));
app.put("/api/admins/:id", asyncRoute(async (req, res) => {
  const { name, email, password } = req.body;
  if (password) {
    await pool.query("UPDATE admins SET name=?, email=?, password=? WHERE id=?", [name, email, password, req.params.id]);
  } else {
    await pool.query("UPDATE admins SET name=?, email=? WHERE id=?", [name, email, req.params.id]);
  }
  res.json({ id: req.params.id, name, email });
}));
app.delete("/api/admins/:id", asyncRoute(async (req, res) => {
  await pool.query("DELETE FROM admins WHERE id=?", [req.params.id]);
  res.status(204).end();
}));

/* ---- Sections ---- */
app.get("/api/sections", asyncRoute(async (req, res) => {
  const [rows] = await pool.query("SELECT id, name, max_capacity AS maxCapacity FROM sections");
  res.json(rows);
}));
app.post("/api/sections", asyncRoute(async (req, res) => {
  const id = req.body.id || `SEC-${Date.now().toString().slice(-4)}`;
  const { name, maxCapacity = 30 } = req.body;
  await pool.query("INSERT INTO sections (id, name, max_capacity) VALUES (?, ?, ?)", [id, name, maxCapacity]);
  res.status(201).json({ id, name, maxCapacity });
}));
app.put("/api/sections/:id", asyncRoute(async (req, res) => {
  const { name, maxCapacity } = req.body;
  await pool.query("UPDATE sections SET name=?, max_capacity=? WHERE id=?", [name, maxCapacity, req.params.id]);
  res.json(req.body);
}));
app.delete("/api/sections/:id", asyncRoute(async (req, res) => {
  await pool.query("DELETE FROM sections WHERE id=?", [req.params.id]);
  res.status(204).end();
}));

/* ---- Subjects ---- */
app.get("/api/subjects", asyncRoute(async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM subjects");
  res.json(rows);
}));
app.post("/api/subjects", asyncRoute(async (req, res) => {
  const id = req.body.id || `SUBJ-${Date.now().toString().slice(-4)}`;
  const { code, title, units = 3 } = req.body;
  await pool.query("INSERT INTO subjects (id, code, title, units) VALUES (?, ?, ?, ?)", [id, code, title, units]);
  res.status(201).json({ id, code, title, units });
}));
app.put("/api/subjects/:id", asyncRoute(async (req, res) => {
  const { code, title, units } = req.body;
  await pool.query("UPDATE subjects SET code=?, title=?, units=? WHERE id=?", [code, title, units, req.params.id]);
  res.json(req.body);
}));
app.delete("/api/subjects/:id", asyncRoute(async (req, res) => {
  await pool.query("DELETE FROM subjects WHERE id=?", [req.params.id]);
  res.status(204).end();
}));

/* ---- Rooms (name-keyed, not id-keyed — matches the frontend's flat string list) ---- */
app.get("/api/rooms", asyncRoute(async (req, res) => {
  const [rows] = await pool.query("SELECT name FROM rooms ORDER BY id");
  res.json(rows.map((r) => r.name));
}));
app.post("/api/rooms", asyncRoute(async (req, res) => {
  await pool.query("INSERT IGNORE INTO rooms (name) VALUES (?)", [req.body.name]);
  res.status(201).json({ name: req.body.name });
}));
app.put("/api/rooms/:name", asyncRoute(async (req, res) => {
  await pool.query("UPDATE rooms SET name=? WHERE name=?", [req.body.name, decodeURIComponent(req.params.name)]);
  res.json({ name: req.body.name });
}));
app.delete("/api/rooms/:name", asyncRoute(async (req, res) => {
  await pool.query("DELETE FROM rooms WHERE name=?", [decodeURIComponent(req.params.name)]);
  res.status(204).end();
}));

/* ---- Courses (name-keyed) ---- */
app.get("/api/courses", asyncRoute(async (req, res) => {
  const [rows] = await pool.query("SELECT name FROM courses ORDER BY id");
  res.json(rows.map((r) => r.name));
}));
app.post("/api/courses", asyncRoute(async (req, res) => {
  await pool.query("INSERT IGNORE INTO courses (name) VALUES (?)", [req.body.name]);
  res.status(201).json({ name: req.body.name });
}));
app.delete("/api/courses/:name", asyncRoute(async (req, res) => {
  await pool.query("DELETE FROM courses WHERE name=?", [decodeURIComponent(req.params.name)]);
  res.status(204).end();
}));

/* ---- Course majors (composite key "Course::Major") ---- */
app.get("/api/course-majors", asyncRoute(async (req, res) => {
  const [rows] = await pool.query("SELECT course_name AS courseName, major_name AS majorName FROM course_majors");
  res.json(rows);
}));
app.post("/api/course-majors", asyncRoute(async (req, res) => {
  const { courseName, majorName } = req.body;
  await pool.query("INSERT IGNORE INTO course_majors (course_name, major_name) VALUES (?, ?)", [courseName, majorName]);
  res.status(201).json({ courseName, majorName });
}));
app.delete("/api/course-majors/:key", asyncRoute(async (req, res) => {
  const [courseName, majorName] = decodeURIComponent(req.params.key).split("::");
  await pool.query("DELETE FROM course_majors WHERE course_name=? AND major_name=?", [courseName, majorName]);
  res.status(204).end();
}));

/* ---- Announcements (write-only log from the app's perspective) ---- */
app.get("/api/announcements", asyncRoute(async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM announcements ORDER BY created_at DESC LIMIT 200");
  res.json(rows);
}));
app.post("/api/announcements", asyncRoute(async (req, res) => {
  const { title, message, target } = req.body;
  await pool.query("INSERT INTO announcements (title, message, target) VALUES (?, ?, ?)", [title, message, target]);
  res.status(201).json({ title, message, target });
}));

/* ---- Bootstrap: everything the frontend needs in one call ---- */
app.get("/api/bootstrap", asyncRoute(async (req, res) => {
  const [[students], [instructors], [registrars], [admins], [sections], [subjects], [rooms], [courses], [courseMajorRows]] = await Promise.all([
    pool.query("SELECT * FROM students ORDER BY created_at DESC"),
    pool.query("SELECT * FROM instructors ORDER BY created_at DESC"),
    pool.query("SELECT id, name, email, department, password FROM registrars ORDER BY created_at DESC"),
    pool.query("SELECT id, name, email, password FROM admins ORDER BY created_at DESC"),
    pool.query("SELECT id, name, max_capacity AS maxCapacity FROM sections"),
    pool.query("SELECT * FROM subjects"),
    pool.query("SELECT name FROM rooms ORDER BY id"),
    pool.query("SELECT name FROM courses ORDER BY id"),
    pool.query("SELECT course_name, major_name FROM course_majors"),
  ]);

  const courseMajors = {};
  courses.forEach((c) => { courseMajors[c.name] = []; });
  courseMajorRows.forEach((row) => {
    if (!courseMajors[row.course_name]) courseMajors[row.course_name] = [];
    courseMajors[row.course_name].push(row.major_name);
  });

  res.json({
    students: students.map(studentRowToApi),
    instructors: instructors.map(instructorRowToApi),
    registrars,
    admins,
    sections,
    subjects,
    rooms: rooms.map((r) => r.name),
    courses: courses.map((c) => c.name),
    courseMajors,
  });
}));

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.get("/", (req, res) => res.sendFile(require("path").join(__dirname, "index.html")));

async function runMigrations() {
  const migrations = [
    "ALTER TABLE students ADD COLUMN enrollment_type VARCHAR(40) DEFAULT 'Freshman'",
    "ALTER TABLE registrars ADD COLUMN password VARCHAR(255) NULL",
  ];
  for (const sql of migrations) {
    try {
      await pool.query(sql);
    } catch (err) {
      if (!/duplicate column|1060/i.test(err.message)) throw err;
    }
  }
}

// Vercel imports the Express app as a serverless/Fluid Function.
// Local development still uses the normal HTTP listener.
if (process.env.VERCEL) {
  module.exports = app;
} else {
  runMigrations().then(() => {
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`BAAO CC portal API listening on port ${PORT}`);
      console.log(`Local:   http://localhost:${PORT}`);
      for (const [name, entries] of Object.entries(os.networkInterfaces())) {
        for (const entry of entries || []) {
          if (entry.family === "IPv4" && !entry.internal) console.log(`Network: http://${entry.address}:${PORT}`);
        }
      }
    });
    server.on("error", (err) => {
      console.error("Unable to listen on port", PORT, err.message);
      process.exitCode = 1;
    });
  }).catch((err) => {
    console.error("Unable to start the API:", err.message);
    process.exitCode = 1;
  });
}

