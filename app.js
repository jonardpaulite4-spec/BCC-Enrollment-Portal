/* =====================================================================
   BAAO Community College — Unified Portal (Web Edition)
   Ported from the original React Native mobile app.
   All student / instructor / registrar features preserved.
===================================================================== */

/* ---------------------- Icons (lightweight glyphs) ---------------------- */
const ICON = {
  mail: '&#9993;', lock: '&#128274;', user: '&#128100;', phone: '&#128222;',
  calendar: '&#128197;', pin: '&#128205;', userplus: '&#128101;', phonecall: '&#9742;',
  chevrondown: '&#9662;', chevronright: '&#8250;', chevronleft: '&#8249;',
  bell: '&#128276;', belloff: '&#128276;', usercheck: '&#9989;', clock: '&#128340;',
  check: '&#10003;', checkcircle: '&#10004;', xcircle: '&#10060;', minuscircle: '&#8854;',
  filetext: '&#128196;', image: '&#128247;', eye: '&#128065;', trash: '&#128465;',
  arrowleft: '&#8592;', arrowup: '&#8599;', logout: '&#9099;', shield: '&#128737;',
  bookopen: '&#128214;', users: '&#128101;', home: '&#127968;', plus: '&#10133;',
  search: '&#128269;', close: '&#10005;', layers: '&#128444;', send: '&#128232;',
  briefcase: '&#128188;', circle: '&#9675;', checksquare: '&#9745;', square: '&#9744;',
  edit: '&#9998;', database: '&#128451;', gear: '&#9881;', key: '&#128273;',
};

/* ---------------------- Constants (mirrors typesAndComponents) ---------------------- */
const DEFAULT_SYSTEM_SETTINGS = {
  portalName: "Baao Community College Unified Enrollment Portal",
  institutionName: "Baao Community College",
  location: "San Juan, Baao Camarines Sur",
  academicYear: "2026-2027",
  activeSemester: "1st Semester",
  registration: true,
  documentUpload: true,
  maintenanceMode: false,
  emailNotifications: true,
  loginAlerts: true,
  twoFactor: false,
};

const FEATURES = {};
function loadSystemSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem("bccSystemSettings") || "null");
    return { ...DEFAULT_SYSTEM_SETTINGS, ...(saved || {}) };
  } catch (_) { return { ...DEFAULT_SYSTEM_SETTINGS }; }
}
function applySystemSettings(settings) {
  Object.assign(FEATURES, {
    registration: settings.registration !== false,
    documentUpload: settings.documentUpload !== false,
  });
}
function saveSystemSettings() {
  try { localStorage.setItem("bccSystemSettings", JSON.stringify(state.systemSettings)); } catch (_) {}
  applySystemSettings(state.systemSettings);
}
applySystemSettings(loadSystemSettings());

const INITIAL_SECTIONS = [
  { id: "SEC-101", name: "ACT 1-A", maxCapacity: 30 },
  { id: "SEC-102", name: "BSIT 1-A", maxCapacity: 35 },
  { id: "SEC-103", name: "BSIT 1-B", maxCapacity: 30 },
];

const INITIAL_ROOMS = [
  "Lecture Room 101",
  "Lecture Room 102",
  "Computer Lab 1",
  "Computer Lab 2",
  "Multimedia Lab",
];

const INITIAL_SUBJECTS = [
  { id: "CC101", code: "CC 101", title: "Introduction to Computing", units: 3 },
  { id: "CC102", code: "CC 102", title: "Computer Programming 1", units: 3 },
  { id: "CC105", code: "CC 105", title: "Information Management", units: 3 },
  { id: "HCI101", code: "HCI 101", title: "Human-Computer Interaction", units: 3 },
  { id: "NSTP1", code: "NSTP 1", title: "National Service Training Program 1", units: 3 },
];

const INITIAL_COURSE_OPTIONS = [
  "ACT - Associate in Computer Technology",
  "BSIT - Information Technology",
  "BSED - Secondary Education",
  "BEED - Elementary Education",
  "BSBA - Business Administration",
];

const INITIAL_COURSE_MAJORS = {
  "ACT - Associate in Computer Technology": ["Application Development", "Networking"],
  "BSIT - Information Technology": ["Web and Mobile Application Development", "Network and Cybersecurity"],
  "BSED - Secondary Education": ["English", "Mathematics", "Filipino"],
  "BEED - Elementary Education": ["General Education"],
  "BSBA - Business Administration": ["Marketing Management", "Human Resource Management"],
};

const YEAR_LEVEL_OPTIONS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

const ENROLLMENT_PROCEDURES = {
  Freshman: {
    requirements: [
      "Form 138 (Grade 12 Report Card)",
      "Good Moral Certificate",
      "2 Photocopies of PSA Birth Certificate",
      "2 Photocopies of PSA Marriage Certificate (if married)",
      "Long Brown Envelope",
    ],
    steps: [
      "Submit requirements and exam results",
      "Data profiling (personal information encoding)",
      "Submit checklist to Registrar for printing enrolled subjects",
      "Secure Dean's signature",
      "Proceed to NSTP Office for signature",
      "Return to Registrar for final signing and releasing",
    ],
  },
  Transferee: {
    requirements: [
      "Transcript of Records / Certificate of Grades",
      "Honorable Dismissal",
      "Good Moral Certificate",
      "2 Photocopies of PSA/NSO Birth Certificate",
      "2 Photocopies of PSA/NSO Marriage Certificate (if married)",
      "Long Brown Envelope",
    ],
    steps: [],
  },
  "Old Student": {
    requirements: [],
    steps: [
      "Present clearance to Registrar (if irregular, proceed to Dean for evaluation)",
      "Secure Dean's signature",
      "Return to Registrar for final signing and releasing",
    ],
  },
  "Returning Student": {
    requirements: [],
    steps: [
      "Request evaluation sheet copy from Registrar",
      "Proceed to Dean for evaluation (if changing course, request shifting form)",
      "Data profiling",
      "Printing of enrolled subjects at Registrar",
      "Secure Dean's signature",
      "Return to Registrar for final signing and releasing",
    ],
  },
};
ENROLLMENT_PROCEDURES.Transferee.steps = [...ENROLLMENT_PROCEDURES.Freshman.steps];
const ENROLLMENT_TYPES = Object.keys(ENROLLMENT_PROCEDURES);

const YEAR_LEVEL_DOCS = {
  "1st Year": [
    { name: "Form 138 / Report Card", status: "Pending", fileName: "", fileUri: null, fileType: "" },
    { name: "Good Moral Certificate", status: "Pending", fileName: "", fileUri: null, fileType: "" },
    { name: "PSA Birth Certificate", status: "Pending", fileName: "", fileUri: null, fileType: "" },
    { name: "2x2 ID Photo", status: "Pending", fileName: "", fileUri: null, fileType: "" },
  ],
};

function cloneDocs(yearLevel) {
  const src = YEAR_LEVEL_DOCS[yearLevel] || YEAR_LEVEL_DOCS["1st Year"];
  return src.map((d) => ({ ...d }));
}

function enrollmentDocs(type, yearLevel) {
  const procedure = ENROLLMENT_PROCEDURES[type] || ENROLLMENT_PROCEDURES.Freshman;
  if (!procedure.requirements.length) return cloneDocs(yearLevel);
  return procedure.requirements.map((name) => ({
    name, status: "Pending", fileName: "", fileUri: null, fileType: "",
  }));
}

function autoGenerateId(prefix = "STU") {
  const currentYear = new Date().getFullYear().toString().slice(-2);
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${currentYear}-${randomNum}`;
}

function toDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function todayStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/* ---------------------- Small utilities ---------------------- */
function esc(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function jsAttr(value) {
  return JSON.stringify(value).replace(/"/g, "&quot;");
}
function uid() {
  return Date.now().toString() + Math.floor(Math.random() * 1000);
}

/* alert() replacement matching the mobile Alert.alert(title, message, buttons) pattern */
function appAlert(title, message, onOk) {
  window.alert(message ? `${title}\n\n${message}` : title);
  if (typeof onOk === "function") onOk();
}
function appConfirm(title, message, onConfirm) {
  if (window.confirm(message ? `${title}\n\n${message}` : title)) {
    if (typeof onConfirm === "function") onConfirm();
  }
}

/* =====================================================================
   Global State (mirrors App.js React state)
===================================================================== */
const state = {
  role: "student",
  studentScreen: "login",
  registrarScreen: "login",
  instructorScreen: "login",
  adminScreen: "login",

  activeRegistrarId: "REG-01",
  activeInstructorId: null,
  activeAdminId: "ADM-01",

  systemSettings: loadSystemSettings(),

  adminsList: [
    { id: "ADM-01", name: "System Administrator", email: "admin@baaocc.edu.ph", password: "admin123" },
  ],

  registrarsList: [
    { id: "REG-01", name: "Officer Santos", email: "officer.santos@baaocc.edu.ph", department: "Main Registrar Office" },
  ],

  sectionsList: JSON.parse(JSON.stringify(INITIAL_SECTIONS)),
  availableSubjects: JSON.parse(JSON.stringify(INITIAL_SUBJECTS)),
  roomOptions: [...INITIAL_ROOMS],
  courseOptions: [...INITIAL_COURSE_OPTIONS],
  courseMajors: JSON.parse(JSON.stringify(INITIAL_COURSE_MAJORS)),

  instructorsList: [
    { id: "INS-01", name: "Prof. GR Atienza", email: "gr.atienza@baaocc.edu.ph", subjects: ["CC 101", "CC 105"], notifications: [] },
    { id: "INS-02", name: "Dr. Maria Santos", email: "maria.santos@baaocc.edu.ph", subjects: ["HCI 101"], notifications: [] },
    { id: "INS-03", name: "Engr. Ramon Reyes", email: "ramon.reyes@baaocc.edu.ph", subjects: ["CC 102"], notifications: [] },
  ],

  students: [
    {
      id: "STU-26-2925",
      name: "Jonard Q. Paulite",
      email: "jonard.paulite@baaocc.edu.ph",
      mobile: "09123456789",
      birthday: "09/14/2005",
      address: "Zone 3, Baao, Camarines Sur",
      emergencyContactName: "Maricel Paulite",
      emergencyContactNumber: "09987654321",
      program: "ACT - Application Development",
      major: "",
      yearLevel: "1st Year",
      academicYear: "2026-2027",
      semester: "1st Semester",
      section: "ACT 1-A",
      status: "Pending",
      instructor: "",
      schedule: "",
      roomLab: "",
      subjects: [],
      attendance: {},
      notifications: [
        { id: "1", title: "Schedule Pending", message: "Your registration is currently under review by the registrar.", date: "Today", read: false },
        { id: "2", title: "Document Upload Required", message: "Please ensure your PSA Birth Certificate is attached.", date: "Yesterday", read: false },
      ],
      docs: cloneDocs("1st Year"),
      enrollmentType: "Freshman",
    },
  ],

  /* ---- UI-only ephemeral state ---- */
  ui: {
    studentDashboard: { showCourseModal: false },
    studentNotif: { detailId: null },
    enroll: { activeModal: null, selectedDocIndex: null, previewDocIndex: null },
    instructor: {
      selectedSubject: null,
      selectedSection: null,
      selectedDateKey: toDateKey(todayStart()),
      calendarMonthKey: toDateKey(todayStart()).slice(0, 7),
      studentSearch: "",
      isSubjectModalOpen: false,
      isNotifModalOpen: false,
      notifDetailId: null,
      activeTab: "attendance",
    },
    registrar: {
      selectedStudentId: null,
      assignedSection: "",
      selectedSubjects: [],
      previewDocIndex: null,
      isAddSubjModalOpen: false,
      isAddRoomModalOpen: false,
      isAddSectionModalOpen: false,
      isAddCourseModalOpen: false,
      isAddMajorModalOpen: false,
      isAnnouncementModalOpen: false,
      majorTargetCourse: INITIAL_COURSE_OPTIONS[0],
      announcementTarget: "students",
      expandedSubjectId: null,
    },
    admin: {
      activeTab: "overview",
      editStudentId: null,
      editInstructorId: null,
      editRegistrarId: null,
      editAdminId: null,
      editSectionId: null,
      editSubjectId: null,
      editRoomIndex: null,
      isAddStudentModalOpen: false,
      isAddInstructorModalOpen: false,
      isAddRegistrarModalOpen: false,
      isAddAdminModalOpen: false,
      isAddSectionModalOpen: false,
      isAddSubjModalOpen: false,
      isAddRoomModalOpen: false,
      isAddCourseModalOpen: false,
      isAddMajorModalOpen: false,
      isAnnouncementModalOpen: false,
      majorTargetCourse: INITIAL_COURSE_OPTIONS[0],
      announcementTarget: "students",
      search: "",
      settingsTab: "general",
    },
  },
};

/* Draft values for uncontrolled-style text inputs (kept outside state so typing never triggers a full re-render) */
const drafts = {};
function setDraft(key, value) { drafts[key] = value; }
function getDraft(key, fallback = "") { return drafts[key] !== undefined ? drafts[key] : fallback; }
function clearDrafts(prefix) {
  Object.keys(drafts).forEach((k) => { if (k.startsWith(prefix)) delete drafts[k]; });
}

/* ---------------------- Derived getters ---------------------- */
function getActiveStudent() { return state.students[0]; }
function getActiveRegistrar() { return state.registrarsList.find((r) => r.id === state.activeRegistrarId) || null; }
function getActiveInstructor() { return state.instructorsList.find((i) => i.id === state.activeInstructorId) || null; }
function unreadNotifCount(student) {
  return student && student.notifications ? student.notifications.filter((n) => !n.read).length : 0;
}

/* =====================================================================
   Mutators (mirror App.js handlers)
===================================================================== */
function updateStudent(updated) {
  state.students = state.students.map((s) => (s.id === updated.id ? updated : s));
  syncApi(() => Api.update("students", updated.id, updated));
}
function updateInstructor(updated) {
  state.instructorsList = state.instructorsList.map((i) => (i.id === updated.id ? updated : i));
  syncApi(() => Api.update("instructors", updated.id, updated));
}
function addSubjectGlobal(subj) { state.availableSubjects.push(subj); syncApi(() => Api.create("subjects", subj)); }
function addRoomGlobal(room) { state.roomOptions.push(room); syncApi(() => Api.create("rooms", { name: room })); }
function addSectionGlobal(sec) { state.sectionsList.push(sec); syncApi(() => Api.create("sections", sec)); }
function addCourseGlobal(name) {
  state.courseOptions.push(name);
  state.courseMajors[name] = [];
  syncApi(() => Api.create("courses", { name }));
}
function addMajorGlobal(course, major) {
  state.courseMajors[course] = [...(state.courseMajors[course] || []), major];
  syncApi(() => Api.create("course-majors", { courseName: course, majorName: major }));
}

/* ---- Delete / edit mutators (used by the Admin console — students, instructors,
   registrars, admins, sections, subjects, rooms, courses & majors all get full
   add / edit / delete here, mirrored to MySQL via syncApi when the backend is up). ---- */
function deleteStudentGlobal(id) {
  state.students = state.students.filter((s) => s.id !== id);
  syncApi(() => Api.remove("students", id));
}
function addInstructorGlobal(ins) { state.instructorsList.push(ins); syncApi(() => Api.create("instructors", ins)); }
function deleteInstructorGlobal(id) {
  state.instructorsList = state.instructorsList.filter((i) => i.id !== id);
  syncApi(() => Api.remove("instructors", id));
}
function addRegistrarGlobal(reg) { state.registrarsList.push(reg); syncApi(() => Api.create("registrars", reg)); }
function updateRegistrarGlobal(updated) {
  state.registrarsList = state.registrarsList.map((r) => (r.id === updated.id ? updated : r));
  syncApi(() => Api.update("registrars", updated.id, updated));
}
function deleteRegistrarGlobal(id) {
  state.registrarsList = state.registrarsList.filter((r) => r.id !== id);
  syncApi(() => Api.remove("registrars", id));
}
function addAdminGlobal(adm) { state.adminsList.push(adm); syncApi(() => Api.create("admins", adm)); }
function updateAdminGlobal(updated) {
  state.adminsList = state.adminsList.map((a) => (a.id === updated.id ? updated : a));
  syncApi(() => Api.update("admins", updated.id, updated));
}
function deleteAdminGlobal(id) {
  state.adminsList = state.adminsList.filter((a) => a.id !== id);
  syncApi(() => Api.remove("admins", id));
}
function updateSectionGlobal(updated) {
  state.sectionsList = state.sectionsList.map((s) => (s.id === updated.id ? updated : s));
  syncApi(() => Api.update("sections", updated.id, updated));
}
function deleteSectionGlobal(id) {
  state.sectionsList = state.sectionsList.filter((s) => s.id !== id);
  syncApi(() => Api.remove("sections", id));
}
function updateSubjectGlobal(updated) {
  state.availableSubjects = state.availableSubjects.map((s) => (s.id === updated.id ? updated : s));
  syncApi(() => Api.update("subjects", updated.id, updated));
}
function deleteSubjectGlobal(id) {
  state.availableSubjects = state.availableSubjects.filter((s) => s.id !== id);
  syncApi(() => Api.remove("subjects", id));
}
function updateRoomGlobal(oldName, newName) {
  state.roomOptions = state.roomOptions.map((r) => (r === oldName ? newName : r));
  syncApi(() => Api.update("rooms", encodeURIComponent(oldName), { name: newName }));
}
function deleteRoomGlobal(name) {
  state.roomOptions = state.roomOptions.filter((r) => r !== name);
  syncApi(() => Api.remove("rooms", encodeURIComponent(name)));
}
function deleteCourseGlobal(name) {
  state.courseOptions = state.courseOptions.filter((c) => c !== name);
  delete state.courseMajors[name];
  syncApi(() => Api.remove("courses", encodeURIComponent(name)));
}
function deleteMajorGlobal(course, major) {
  state.courseMajors[course] = (state.courseMajors[course] || []).filter((m) => m !== major);
  syncApi(() => Api.remove("course-majors", encodeURIComponent(`${course}::${major}`)));
}

/* =====================================================================
   Router / Render core
===================================================================== */
function switchRole(role) {
  state.role = role;
  render();
}

function isRoleAuthenticated() {
  return (
    (state.role === "student" && !["login", "register"].includes(state.studentScreen)) ||
    (state.role === "instructor" && state.instructorScreen === "dashboard") ||
    (state.role === "registrar" && state.registrarScreen === "dashboard") ||
    (state.role === "admin" && state.adminScreen === "dashboard")
  );
}

function updateRoleSelectorVisibility() {
  const roleToggle = document.querySelector(".role-toggle-group");
  const authenticated = isRoleAuthenticated();
  if (!roleToggle) return;

  roleToggle.classList.toggle("is-hidden", authenticated);
  roleToggle.setAttribute("aria-hidden", authenticated ? "true" : "false");

  document.querySelectorAll(".role-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.role === state.role);
    btn.tabIndex = authenticated ? -1 : 0;
  });
}

function render() {
  const root = document.getElementById("root");
  let html = "";
  if (state.systemSettings?.maintenanceMode && state.role !== "admin") html = portalMaintenanceScreen();
  else if (state.role === "student") html = renderStudentRole();
  else if (state.role === "instructor") html = renderInstructorRole();
  else if (state.role === "registrar") html = renderRegistrarRole();
  else if (state.role === "admin") html = renderAdminRole();
  root.innerHTML = html;
  updateRoleSelectorVisibility();
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
}

function portalMaintenanceScreen() {
  return `<div class="screen"><div class="auth-shell"><div class="auth-card maintenance-card">
    <div class="auth-logo"><img src="BCC_LOGO.jpg" alt="Baao Community College Logo" /></div>
    <div class="org-subtitle">${esc(state.systemSettings?.institutionName || "BAAO COMMUNITY COLLEGE")}</div>
    <h1 class="auth-title">Portal Maintenance</h1>
    <p class="auth-desc">The campus portal is temporarily unavailable while system maintenance is in progress. Please check again later.</p>
    <button class="btn btn-outline" onclick="switchRole('admin')">Admin Access</button>
  </div></div></div>`;
}

/* Try to hydrate `state` from the MySQL-backed API on startup. If the backend
   (see /server) isn't running, this silently fails and the app keeps using
   the local seed data defined above — so it still works as a standalone demo. */
async function hydrateFromApi() {
  try {
    const data = await Api.bootstrap();
    if (data.students) state.students = data.students;
    if (data.instructors) state.instructorsList = data.instructors;
    if (data.registrars) state.registrarsList = data.registrars;
    if (data.admins) state.adminsList = data.admins;
    if (data.sections) state.sectionsList = data.sections;
    if (data.subjects) state.availableSubjects = data.subjects;
    if (data.rooms) state.roomOptions = data.rooms;
    if (data.courses) state.courseOptions = data.courses;
    if (data.courseMajors) state.courseMajors = data.courseMajors;
  } catch (err) {
    console.info("[api] backend not reachable, using local demo data:", err.message);
  } finally {
    render();
  }
}

document.addEventListener("DOMContentLoaded", hydrateFromApi);

/* =====================================================================
   STUDENT ROLE
===================================================================== */
function renderStudentRole() {
  switch (state.studentScreen) {
    case "login": return studentLoginScreen();
    case "register": return studentRegisterScreen();
    case "dashboard": return studentDashboardScreen();
    case "status": return enrollmentStatusScreen();
    case "enroll": return enrollScreen();
    case "schedule": return studentScheduleScreen();
    case "notifications": return notificationsScreen();
    case "profile": return studentProfileScreen();
    default: return studentLoginScreen();
  }
}

function bottomNav(active, unread) {
  const user = getActiveStudent();
  const items = [
    { key: "dashboard", icon: ICON.home, label: "Dashboard" },
    { key: "status", icon: ICON.checksquare, label: "Enrollment Status" },
    { key: "enroll", icon: ICON.filetext, label: "Requirements" },
    { key: "schedule", icon: ICON.calendar, label: "Class Schedule" },
    { key: "notifications", icon: ICON.bell, label: "Alerts", badge: unread },
    { key: "profile", icon: ICON.user, label: "My Profile" },
  ];
  return `
  <aside class="bottom-nav student-sidebar" aria-label="Student portal navigation">
    <div class="sidebar-student-card">
      <div class="sidebar-avatar">${esc((user?.name || "S").charAt(0))}</div>
      <div class="sidebar-student-copy">
        <div class="sidebar-student-name">${esc(user?.name || "Student")}</div>
        <div class="sidebar-student-id">${esc(user?.id || "")}</div>
      </div>
    </div>
    <div class="sidebar-section-label">STUDENT MENU</div>
    <nav class="sidebar-menu">
      ${items.map((it) => `
        <button class="nav-item ${active === it.key ? "active" : ""}" onclick="goStudentTab(${jsAttr(it.key)})">
          <div class="nav-icon-wrap"><span class="icon">${it.icon}</span></div>
          <span class="nav-label">${it.label}</span>
          ${it.badge ? `<span class="nav-badge">${it.badge}</span>` : ""}
        </button>
      `).join("")}
    </nav>
    <div class="sidebar-footer">
      <button class="sidebar-logout" onclick="state.studentScreen='login'; render();">
        <span class="icon">${ICON.logout}</span><span>Log Out</span>
      </button>
    </div>
  </aside>`;
}
function goStudentTab(tab) { state.studentScreen = tab; render(); }


/* ---------------- Enrollment Status / Process ---------------- */
function enrollmentStatusScreen() {
  const user = getActiveStudent();
  const unread = unreadNotifCount(user);
  const docsUploaded = (user.docs || []).filter((d) => d.fileName).length;
  const docsVerified = (user.docs || []).filter((d) => d.status === "Verified").length;
  const allUploaded = user.docs?.length ? docsUploaded === user.docs.length : false;
  const allVerified = user.docs?.length ? docsVerified === user.docs.length : false;
  const hasSubjects = !!(user.subjects && user.subjects.length);
  const enrolled = String(user.status || "").toLowerCase() === "enrolled";

  const steps = [
    { title: "Account & Student Information", desc: "Student profile and program information are on file.", done: true, current: false },
    { title: "Upload Enrollment Requirements", desc: `${docsUploaded}/${user.docs.length} required documents uploaded.`, done: allUploaded, current: !allUploaded },
    { title: "Registrar Document Verification", desc: `${docsVerified}/${user.docs.length} documents verified by the Registrar.`, done: allVerified, current: allUploaded && !allVerified },
    { title: "Section & Subject Assignment", desc: hasSubjects ? `${user.subjects.length} subject(s) assigned.` : "Waiting for section, subjects, instructor and schedule assignment.", done: hasSubjects, current: allVerified && !hasSubjects },
    { title: "Official Enrollment", desc: enrolled ? "Enrollment is complete." : "Final approval will appear here after Registrar confirmation.", done: enrolled, current: hasSubjects && !enrolled },
  ];

  return `
  <div class="screen">
    <div class="app-bar portal-app-bar student-app-bar">
      <div class="app-bar-left"><span class="app-bar-title">Enrollment Status</span></div>
      <span class="status-chip" style="background:${enrolled ? "var(--success-bg)" : "var(--pending-bg)"};color:${enrolled ? "var(--success)" : "var(--pending)"}">${esc((user.status || "Pending").toUpperCase())}</span>
    </div>
    <div class="content-wrap">
      <div class="enrollment-overview-grid">
        <div class="card-box enrollment-term-card">
          <div class="group-heading">CURRENT ENROLLMENT PERIOD</div>
          <div class="term-grid">
            <label class="term-field">
              <span>Academic Year</span>
              <select onchange="updateStudentEnrollmentTerm('academicYear', this.value)">
                ${["2025-2026","2026-2027","2027-2028"].map((v) => `<option ${String(user.academicYear || "2026-2027") === v ? "selected" : ""}>${v}</option>`).join("")}
              </select>
            </label>
            <label class="term-field">
              <span>Semester</span>
              <select onchange="updateStudentEnrollmentTerm('semester', this.value)">
                ${["1st Semester","2nd Semester","Summer"].map((v) => `<option ${String(user.semester || "1st Semester") === v ? "selected" : ""}>${v}</option>`).join("")}
              </select>
            </label>
          </div>
          <div class="enrollment-facts">
            <div><span>Program</span><b>${esc(user.program)}</b></div>
            <div><span>Year Level</span><b>${esc(user.yearLevel || "Not Set")}</b></div>
            <div><span>Section</span><b>${esc(user.section || "Unassigned")}</b></div>
          </div>
        </div>

        <div class="card-box enrollment-summary-card">
          <div class="group-heading">APPLICATION SUMMARY</div>
          <div class="summary-metric"><span>Documents Uploaded</span><b>${docsUploaded}/${user.docs.length}</b></div>
          <div class="summary-metric"><span>Documents Verified</span><b>${docsVerified}/${user.docs.length}</b></div>
          <div class="summary-metric"><span>Assigned Subjects</span><b>${user.subjects?.length || 0}</b></div>
          <button class="btn btn-accent btn-sm enrollment-action" onclick="goStudentTab('enroll')">Manage Requirements</button>
        </div>
      </div>

      <div class="section-title">Enrollment Process</div>
      <div class="card-box enrollment-timeline">
        ${steps.map((s, i) => `
          <div class="timeline-step ${s.done ? "done" : ""} ${s.current ? "current" : ""}">
            <div class="timeline-marker">${s.done ? ICON.check : i + 1}</div>
            <div class="timeline-copy">
              <div class="timeline-title">${esc(s.title)}</div>
              <div class="timeline-desc">${esc(s.desc)}</div>
            </div>
          </div>
        `).join("")}
      </div>

      <div class="enrollment-help-card">
        <div>
          <div class="enrollment-help-title">Next recommended action</div>
          <div class="enrollment-help-text">${
            !allUploaded ? "Upload all required documents so the Registrar can review your application."
            : !allVerified ? "Your files are ready for Registrar verification. Monitor Alerts for updates."
            : !hasSubjects ? "Requirements are verified. Wait for section and subject assignment."
            : !enrolled ? "Your schedule is assigned. Wait for final enrollment approval."
            : "Your enrollment is complete. Review your class schedule."
          }</div>
        </div>
        <button class="btn btn-primary btn-sm" onclick="goStudentTab('${!allUploaded ? "enroll" : hasSubjects ? "schedule" : "notifications"}')">Open</button>
      </div>
    </div>
    ${bottomNav("status", unread)}
  </div>`;
}

function updateStudentEnrollmentTerm(field, value) {
  const user = getActiveStudent();
  const updated = { ...user, [field]: value };
  const notif = {
    id: uid(),
    title: "Enrollment Period Updated",
    message: `Your ${field === "academicYear" ? "academic year" : "semester"} was set to ${value}.`,
    date: "Just now",
    read: false
  };
  updated.notifications = [notif, ...(user.notifications || [])];
  updateStudent(updated);
  render();
}

/* ---------------- Student Class Schedule ---------------- */
function studentScheduleScreen() {
  const user = getActiveStudent();
  const unread = unreadNotifCount(user);
  const subjects = user.subjects || [];
  const totalUnits = subjects.reduce((sum, s) => sum + (Number(s.units) || 0), 0);

  return `
  <div class="screen">
    <div class="app-bar portal-app-bar student-app-bar">
      <div class="app-bar-left"><span class="app-bar-title">Class Schedule</span></div>
      <div class="schedule-term">${esc(user.academicYear || "2026-2027")} · ${esc(user.semester || "1st Semester")}</div>
    </div>
    <div class="content-wrap">
      <div class="schedule-summary-grid">
        <div class="schedule-stat"><span>Section</span><b>${esc(user.section || "Unassigned")}</b></div>
        <div class="schedule-stat"><span>Subjects</span><b>${subjects.length}</b></div>
        <div class="schedule-stat"><span>Total Units</span><b>${totalUnits}</b></div>
        <div class="schedule-stat"><span>Status</span><b>${esc(user.status || "Pending")}</b></div>
      </div>

      <div class="section-title">Assigned Subjects &amp; Meeting Schedule</div>
      ${subjects.length ? `
        <div class="schedule-list">
          ${subjects.map((subj) => `
            <div class="class-schedule-card">
              <div class="class-code">${esc(subj.code)}</div>
              <div class="class-main">
                <div class="class-title">${esc(subj.title)}</div>
                <div class="class-meta-row">
                  <span>${ICON.clock} ${esc(subj.schedule || "Schedule pending")}</span>
                  <span>${ICON.pin} ${esc(subj.roomLab || "Room pending")}</span>
                  <span>${ICON.usercheck} ${esc(subj.instructor || "Instructor pending")}</span>
                </div>
              </div>
              <div class="class-units">${esc(subj.units)} Units</div>
            </div>
          `).join("")}
        </div>
      ` : `
        <div class="empty-state schedule-empty">
          <span class="icon">${ICON.calendar}</span>
          <div class="title">No class schedule assigned yet.</div>
          <div class="desc">Once the Registrar assigns your section, subjects, instructors, rooms and meeting times, they will appear here automatically.</div>
          <button class="btn btn-outline btn-sm" style="margin-top:14px" onclick="goStudentTab('status')">View Enrollment Status</button>
        </div>
      `}
    </div>
    ${bottomNav("schedule", unread)}
  </div>`;
}

/* ---------------- Login ---------------- */
function studentLoginScreen() {
  return `
  <div class="screen">
    <div class="auth-shell">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-logo"><img src="BCC_LOGO.jpg" alt="Baao Community College Logo" /></div>
          <div class="org-subtitle">BAAO COMMUNITY COLLEGE</div>
          <h1 class="auth-title">Student Portal</h1>
          <p class="auth-desc">Log in to access enrollment and schedules.</p>
        </div>
        <div class="field-group">
          <div class="field"><span class="icon">${ICON.mail}</span><input type="email" placeholder="Email Address" id="stu-login-email" oninput="setDraft('stuLoginEmail', this.value)" value="${esc(getDraft("stuLoginEmail"))}"/></div>
          <div class="field"><span class="icon">${ICON.lock}</span><input type="password" placeholder="Password" id="stu-login-pass" oninput="setDraft('stuLoginPass', this.value)"/></div>
          <button class="btn btn-primary" onclick="studentLoginSubmit()">Log In as Student</button>
        </div>
        ${FEATURES.registration ? `
        <div class="auth-footer">
          <p>Don't have a student account?</p>
          <button class="btn btn-outline" onclick="state.studentScreen='register'; render();">Register as New Student</button>
        </div>` : ""}
      </div>
    </div>
  </div>`;
}
function studentLoginSubmit() {
  const query = getDraft("stuLoginEmail", "").trim().toLowerCase();
  const password = getDraft("stuLoginPass", "");
  const found = state.students.find((s) => s.email && s.email.toLowerCase() === query);

  if (!found) {
    appAlert("No Student Account", "No student account matches that Email Address. Please create an account first.");
    return;
  }
  if (found.password && found.password !== password) {
    appAlert("Invalid Password", "The password you entered is incorrect.");
    return;
  }

  state.activeStudentId = found.id;
  clearDrafts("stuLogin");
  state.studentScreen = "dashboard";
  render();
}

/* ---------------- Register ---------------- */
function studentRegisterScreen() {
  const course = getDraft("stuRegCourse", state.courseOptions[0] || "");
  const majorsForCourse = state.courseMajors[course] || [];
  const major = getDraft("stuRegMajor", majorsForCourse[0] || "");
  const yearLevel = getDraft("stuRegYear", YEAR_LEVEL_OPTIONS[0]);
  const enrollmentType = getDraft("stuRegType", "Freshman");
  const procedure = ENROLLMENT_PROCEDURES[enrollmentType];

  return `
  <div class="screen">
    <div class="app-bar">
      <div class="app-bar-left">
        <button class="back-btn" onclick="state.studentScreen='login'; render();">${ICON.arrowleft}</button>
        <span class="app-bar-title">Student Registration</span>
      </div>
    </div>
    <div class="content-wrap narrow">
      <div class="field-group">
        <div class="field"><span class="icon">${ICON.user}</span><input placeholder="Full Name" oninput="setDraft('stuRegName', this.value)" value="${esc(getDraft("stuRegName"))}"/></div>
        <div class="field"><span class="icon">${ICON.mail}</span><input type="email" placeholder="Email Address" oninput="setDraft('stuRegEmail', this.value)" value="${esc(getDraft("stuRegEmail"))}"/></div>
        <div class="field"><span class="icon">${ICON.phone}</span><input placeholder="Mobile Number" oninput="setDraft('stuRegMobile', this.value)" value="${esc(getDraft("stuRegMobile"))}"/></div>
        <div class="field"><span class="icon">${ICON.calendar}</span><input placeholder="Birthday (MM/DD/YYYY)" oninput="setDraft('stuRegBday', this.value)" value="${esc(getDraft("stuRegBday"))}"/></div>
        <div class="field"><span class="icon">${ICON.pin}</span><input placeholder="Complete Address" oninput="setDraft('stuRegAddr', this.value)" value="${esc(getDraft("stuRegAddr"))}"/></div>
        <div class="field"><span class="icon">${ICON.userplus}</span><input placeholder="Emergency Contact Person" oninput="setDraft('stuRegEmName', this.value)" value="${esc(getDraft("stuRegEmName"))}"/></div>
        <div class="field"><span class="icon">${ICON.phonecall}</span><input placeholder="Emergency Contact Number" oninput="setDraft('stuRegEmNum', this.value)" value="${esc(getDraft("stuRegEmNum"))}"/></div>
        <div class="field"><span class="icon">${ICON.lock}</span><input type="password" placeholder="Password" oninput="setDraft('stuRegPass', this.value)" value="${esc(getDraft("stuRegPass"))}"/></div>

        <div class="section-heading">Course Program</div>
        <div class="chip-row">
          ${state.courseOptions.map((c) => `<div class="chip ${course === c ? "active" : ""}" onclick="selectStudentRegCourse(${jsAttr(c)})">${esc(c)}</div>`).join("")}
        </div>

        <div class="section-heading">Major / Specialization</div>
        <div class="chip-row">
          ${majorsForCourse.length ? majorsForCourse.map((m) => `<div class="chip ${major === m ? "active" : ""}" onclick="setDraft('stuRegMajor', ${jsAttr(m)}); render();">${esc(m)}</div>`).join("")
            : `<span class="muted-note">No major/specialization set up yet for this course.</span>`}
        </div>

        <div class="section-heading">Year Level</div>
        <div class="chip-row">
          ${YEAR_LEVEL_OPTIONS.map((y) => `<div class="chip ${yearLevel === y ? "active" : ""}" onclick="setDraft('stuRegYear', ${jsAttr(y)}); render();">${esc(y)}</div>`).join("")}
        </div>

        <div class="section-heading">Enrollment Type</div>
        <div class="chip-row">
          ${ENROLLMENT_TYPES.map((type) => `<div class="chip ${enrollmentType === type ? "active" : ""}" onclick="setDraft('stuRegType', ${jsAttr(type)}); render();">${esc(type)}</div>`).join("")}
        </div>
        <div class="enrollment-procedure-card">
          <div class="enrollment-procedure-title">${esc(enrollmentType)} Enrollment Procedure</div>
          ${procedure.requirements.length ? `
            <div class="enrollment-procedure-label">Requirements</div>
            <ul>${procedure.requirements.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>
          ` : ""}
          <div class="enrollment-procedure-label">Steps</div>
          <ol>${procedure.steps.map((step) => `<li>${esc(step)}</li>`).join("")}</ol>
        </div>

        <button class="btn btn-accent btn-block-mt" style="margin-bottom:30px" onclick="studentRegisterSubmit()">Create Account</button>
      </div>
    </div>
  </div>`;
}
function selectStudentRegCourse(c) {
  setDraft("stuRegCourse", c);
  setDraft("stuRegMajor", (state.courseMajors[c] || [])[0] || "");
  render();
}
function studentRegisterSubmit() {
  const fullName = getDraft("stuRegName", "").trim();
  if (!fullName) { appAlert("Required Field", "Please enter your full name."); return; }

  const course = getDraft("stuRegCourse", state.courseOptions[0] || "");
  const major = getDraft("stuRegMajor", "");
  const yearLevel = getDraft("stuRegYear", YEAR_LEVEL_OPTIONS[0]);
  const enrollmentType = getDraft("stuRegType", "Freshman");
  const newId = autoGenerateId("STU");

  const newStudent = {
    id: newId,
    name: fullName,
    email: getDraft("stuRegEmail", "") || "student@baaocc.edu.ph",
    password: getDraft("stuRegPass", ""),
    mobile: getDraft("stuRegMobile", "") || "09123456789",
    birthday: getDraft("stuRegBday", "") || "Not Set",
    address: getDraft("stuRegAddr", "") || "Not Set",
    emergencyContactName: getDraft("stuRegEmName", "") || "Not Set",
    emergencyContactNumber: getDraft("stuRegEmNum", "") || "Not Set",
    program: course,
    enrollmentType,
    major: major,
    yearLevel: yearLevel,
    academicYear: "2026-2027",
    semester: "1st Semester",
    section: "Unassigned",
    status: "Pending",
    instructor: "",
    schedule: "",
    roomLab: "",
    subjects: [],
    attendance: {},
    notifications: [
      { id: "1", title: "Account Created", message: "Welcome to BCC! Please complete uploading your document requirements.", date: "Just now", read: false },
    ],
    docs: enrollmentDocs(enrollmentType, yearLevel),
  };

  appAlert("Registration Complete", `Student Account Created!\nID: ${newId}`, () => {
    state.students = [newStudent, ...state.students];
    syncApi(() => Api.create("students", newStudent));
    clearDrafts("stuReg");
    state.studentScreen = "login";
    render();
  });
}

/* ---------------- Dashboard ---------------- */
function studentDashboardScreen() {
  const user = getActiveStudent();
  const verifiedDocs = user.docs.filter((d) => d.status === "Verified").length;
  const progressPercent = user.docs.length ? Math.round((verifiedDocs / user.docs.length) * 100) : 0;
  const unread = unreadNotifCount(user);

  const statusColors = { Present: "success", Absent: "reject", Excuse: "accent", Late: "primary" };

  const subjectsHtml = (user.subjects && user.subjects.length > 0)
    ? user.subjects.map((subj) => {
        const records = Array.isArray(user.attendance?.[subj.id]) ? user.attendance[subj.id] : (user.attendance?.[subj.id] ? [{ date: "Unknown", status: user.attendance[subj.id] }] : []);
        const latest = records[records.length - 1];
        const attStatus = latest?.status || "No Record Yet";
        const attColor = attStatus === "Present" ? "var(--success)" : attStatus === "Absent" ? "var(--reject)" : "var(--muted)";
        const { midterm, final } = getSubjectGrade(user, subj.id);
        const gwa = computeGWA(midterm, final);
        const gStatus = computeGradeStatus(gwa);
        const gc = gradeStatusColors(gStatus);
        return `
        <div class="card-box subject-card">
          <div class="subj-title">${esc(subj.code)} - ${esc(subj.title)}</div>
          <div class="subj-units">${subj.units} Units</div>
          <div class="subj-line"><span>${ICON.usercheck}</span> Instructor: ${esc(subj.instructor || "Pending Assignment")}</div>
          <div class="subj-line"><span>${ICON.pin}</span> Room/Lab: ${esc(subj.roomLab || "Pending Assignment")}</div>
          <div class="subj-line"><span>${ICON.clock}</span> Schedule: ${esc(subj.schedule || "Not Scheduled")}</div>
          <div class="subj-line" style="color:${attColor}"><span>${ICON.checkcircle}</span> Latest Attendance: ${esc(attStatus)}${latest?.date ? " · " + esc(latest.date) : ""}</div>
          ${records.length ? `
          <div style="margin-top:6px">
            <div style="font-size:10px;font-weight:700;color:var(--muted);margin-bottom:4px">Attendance History</div>
            ${records.slice().reverse().map((r) => `
              <div class="attendance-history-row">
                <span>${esc(r.date)}</span>
                <span style="font-weight:700;color:${r.status === "Present" ? "var(--success)" : "var(--reject)"}">${esc(r.status)}</span>
              </div>`).join("")}
          </div>` : ""}
          <div class="grade-summary-row">
            <div class="grade-summary-cell"><div class="field-label-xs">MIDTERM</div><div class="grade-summary-value">${midterm != null ? midterm : "—"}</div></div>
            <div class="grade-summary-cell"><div class="field-label-xs">FINAL</div><div class="grade-summary-value">${final != null ? final : "—"}</div></div>
            <div class="grade-summary-cell"><div class="field-label-xs">GWA</div><div class="grade-summary-value">${gwa != null ? gwa.toFixed(2) : "—"}</div></div>
            <div class="grade-summary-cell"><div class="field-label-xs">STATUS</div><div class="grade-summary-value" style="color:${gc.color}">${gStatus}</div></div>
          </div>
        </div>`;
      }).join("")
    : `<div class="card-box"><span style="font-size:12px;color:var(--muted)">No subjects assigned yet by the Registrar.</span></div>`;

  const overallGWA = computeOverallGWA(user);
  const overallStatus = computeOverallGradeStatus(user);
  const oc = gradeStatusColors(overallStatus);

  return `
  <div class="screen">
    <div class="app-bar portal-app-bar student-app-bar"><div class="app-bar-left"><span class="app-bar-title">Student Dashboard</span></div></div>
    <div class="content-wrap">
      <div class="student-meta-label">STUDENT PROFILE</div>
      <div class="student-name">${esc(user.name)}</div>

      <div class="profile-hero">
        <div class="ring-progress"><span>${progressPercent}%</span></div>
        <div style="flex:1;min-width:0">
          <div class="hero-id">ID: ${esc(user.id)}</div>
          <div class="hero-program-row" onclick="state.ui.studentDashboard.showCourseModal=true; render();">
            <span class="hero-program">${esc(user.program)}</span><span>${ICON.chevrondown}</span>
          </div>
          ${user.major ? `<div class="hero-major">Major: ${esc(user.major)}</div>` : ""}
          <div class="hero-section">SECTION: <b>${esc(user.section || "Unassigned")}</b></div>
          <div class="hero-status">STATUS: ${esc(user.status.toUpperCase())}</div>
          ${user.subjects && user.subjects.length ? `<div class="hero-status" style="color:${oc.color === "var(--muted)" ? "#fff" : "var(--accent)"}">GWA: ${overallGWA != null ? overallGWA.toFixed(2) : "—"} · ACADEMIC STATUS: ${overallStatus.toUpperCase()}</div>` : ""}
        </div>
      </div>

      <div class="section-title">Enrolled Subjects, Grades &amp; Attendance</div>
      ${subjectsHtml}

      ${FEATURES.documentUpload ? `<button class="btn btn-accent" style="margin-bottom:20px" onclick="goStudentTab('enroll')">Manage Document Uploads <span>${ICON.chevronright}</span></button>` : ""}
    </div>

    ${state.ui.studentDashboard.showCourseModal ? courseModal(user) : ""}
    ${bottomNav("dashboard", unread)}
  </div>`;
}

function courseModal(user) {
  return `
  <div class="modal-overlay center">
    <div class="modal-card">
      <h3 class="modal-title" style="margin-bottom:12px">Available Courses</h3>
      ${state.courseOptions.map((c) => {
        const isCurrent = c === user.program;
        return `<div class="course-option-row">
          <span style="color:${isCurrent ? "var(--success)" : "var(--muted)"}">${isCurrent ? ICON.checkcircle : ICON.circle}</span>
          <span style="margin-left:8px;font-size:13px;color:${isCurrent ? "var(--ink)" : "var(--muted)"};font-weight:${isCurrent ? 700 : 400}">
            ${esc(c)}${isCurrent ? "  (Your Program)" : ""}
          </span>
        </div>`;
      }).join("")}
      <button class="btn btn-primary btn-block-mt" onclick="state.ui.studentDashboard.showCourseModal=false; render();">Close</button>
    </div>
  </div>`;
}

/* ---------------- Enroll (Document Upload) ---------------- */
function enrollScreen() {
  const user = getActiveStudent();
  const unread = unreadNotifCount(user);
  const ui = state.ui.enroll;

  return `
  <div class="screen">
    <div class="app-bar portal-app-bar student-app-bar"><div class="app-bar-left"><span class="app-bar-title">Enrollment Requirements</span></div></div>
    <div class="content-wrap">
      <div class="section-title" style="margin-top:0">Required Year Documents</div>
      <div class="card-box">
        ${user.docs.map((doc, idx) => `
          <div class="doc-row">
            <div class="doc-info">
              <div class="doc-name">${esc(doc.name)}</div>
              <div class="doc-file ${doc.status === "Verified" ? "verified" : ""}">${doc.fileName ? esc(doc.fileName) : "No file attached"}</div>
            </div>
            ${doc.fileName ? `<button class="icon-btn-sm" onclick="openDocPreview(${idx})"><span>${ICON.eye}</span>View</button>` : ""}
            <button class="upload-btn-sm ${doc.fileName ? "uploaded" : "pending"}" onclick="openUploadModal(${idx})">${doc.fileName ? "Reupload" : "Upload"}</button>
          </div>
        `).join("")}
      </div>
    </div>

    ${ui.activeModal === "upload" ? uploadChoiceModal() : ""}
    ${ui.previewDocIndex !== null ? docPreviewModal(user.docs[ui.previewDocIndex], "student") : ""}

    ${bottomNav("enroll", unread)}
  </div>`;
}

function openUploadModal(idx) {
  state.ui.enroll.selectedDocIndex = idx;
  state.ui.enroll.activeModal = "upload";
  render();
}
function openDocPreview(idx) {
  state.ui.enroll.previewDocIndex = idx;
  render();
}
function closeEnrollModals() {
  state.ui.enroll.activeModal = null;
  state.ui.enroll.previewDocIndex = null;
  render();
}

function uploadChoiceModal() {
  return `
  <div class="modal-overlay center">
    <div class="modal-card">
      <h3 class="modal-title" style="margin-bottom:12px">Upload File or Image</h3>
      <label class="upload-choice-btn">
        <span class="icon" style="color:var(--accent)">${ICON.image}</span>
        <div>
          <div class="upload-choice-title">Photos &amp; Gallery</div>
          <div class="upload-choice-desc">Select .JPG or .PNG images</div>
        </div>
        <input type="file" accept="image/*" style="display:none" onchange="handleStudentDocUpload(this, 'image')"/>
      </label>
      <label class="upload-choice-btn">
        <span class="icon" style="color:var(--primary)">${ICON.filetext}</span>
        <div>
          <div class="upload-choice-title">Document File</div>
          <div class="upload-choice-desc">Select .PDF files</div>
        </div>
        <input type="file" accept="application/pdf" style="display:none" onchange="handleStudentDocUpload(this, 'pdf')"/>
      </label>
      <button class="btn btn-ghost" onclick="closeEnrollModals()">Cancel</button>
    </div>
  </div>`;
}

function handleStudentDocUpload(inputEl, kind) {
  const file = inputEl.files && inputEl.files[0];
  if (!file) return;
  const idx = state.ui.enroll.selectedDocIndex;
  if (idx === null) return;
  const user = getActiveStudent();
  const docName = user.docs[idx].name;
  const isImage = kind === "image" || file.type.startsWith("image/");

  const finish = (dataUrl) => {
    const updatedDocs = [...user.docs];
    updatedDocs[idx] = { ...updatedDocs[idx], fileName: file.name, fileUri: dataUrl || null, fileType: isImage ? "image" : "pdf" };
    const newNotif = { id: uid(), title: isImage ? "Image Uploaded" : "Document Uploaded", message: `Successfully uploaded ${isImage ? "image" : "file"} for requirement: '${docName}'.`, date: "Just now", read: false };
    updateStudent({ ...user, docs: updatedDocs, notifications: [newNotif, ...(user.notifications || [])] });
    state.ui.enroll.activeModal = null;
    render();
  };

  if (isImage) {
    // Compress photos before syncing them to MySQL. This keeps uploads
    // reliable across phones/tablets while still allowing the Registrar
    // and Admin portals on other devices to preview the same image.
    const reader = new FileReader();
    reader.onload = (e) => {
      const originalDataUrl = e.target.result;
      const img = new Image();
      img.onload = () => {
        const maxDimension = 1600;
        const scale = Math.min(1, maxDimension / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round((img.naturalWidth || img.width) * scale));
        canvas.height = Math.max(1, Math.round((img.naturalHeight || img.height) * scale));
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL("image/jpeg", 0.82);
        const finalDataUrl = compressed.length < originalDataUrl.length ? compressed : originalDataUrl;
        finish(finalDataUrl);
      };
      img.onerror = () => finish(originalDataUrl);
      img.src = originalDataUrl;
    };
    reader.readAsDataURL(file);
  } else {
    finish(null);
  }
}

function deleteStudentDoc(idx) {
  const user = getActiveStudent();
  const doc = user.docs[idx];
  appConfirm("Delete Uploaded Document", `Are you sure you want to remove "${doc.fileName || doc.name}"? You can upload the correct document again afterward.`, () => {
    const updatedDocs = [...user.docs];
    updatedDocs[idx] = { ...updatedDocs[idx], fileName: "", fileUri: "", fileType: "", status: "Pending" };
    const newNotif = { id: uid(), title: "Document Removed", message: `The uploaded file for requirement '${doc.name}' was removed. Please upload the correct document.`, date: "Just now", read: false };
    updateStudent({ ...user, docs: updatedDocs, notifications: [newNotif, ...(user.notifications || [])] });
    state.ui.enroll.previewDocIndex = null;
    state.ui.enroll.activeModal = null;
    render();
  });
}

function docPreviewModal(doc, context) {
  const deleteHandler = context === "student" ? `deleteStudentDoc(${state.ui.enroll.previewDocIndex})` : null;
  const closeHandler = context === "student" ? "closeEnrollModals()" : "closeRegistrarDocPreview()";
  return `
  <div class="modal-overlay center">
    <div class="modal-card" style="text-align:center">
      <h3 class="modal-title" style="margin-bottom:8px">${esc(doc.name)}</h3>
      ${doc.fileUri ? `<img class="preview-image" src="${doc.fileUri}" alt="${esc(doc.fileName)}"/>` : `
        <div class="placeholder-preview-box">
          <span class="icon">${doc.fileType === "image" ? ICON.image : ICON.filetext}</span>
          <span style="font-size:12px;color:var(--ink);font-weight:600">${esc(doc.fileName || "No preview available")}</span>
        </div>`}
      <div style="display:flex;gap:8px;margin-top:14px">
        ${deleteHandler ? `<button class="btn btn-reject" style="background:var(--reject-bg);color:var(--reject);border:1px solid var(--reject)" onclick="${deleteHandler}"><span>${ICON.trash}</span>Delete</button>` : ""}
        <button class="btn btn-primary" onclick="${closeHandler}">Close Preview</button>
      </div>
    </div>
  </div>`;
}
function closeRegistrarDocPreview() { state.ui.registrar.previewDocIndex = null; render(); }

/* ---------------- Notifications ---------------- */
function notificationsScreen() {
  const user = getActiveStudent();
  const unread = unreadNotifCount(user);
  const notifs = user.notifications || [];
  const detailId = state.ui.studentNotif.detailId;
  const detailNotif = detailId ? notifs.find((n) => n.id === detailId) : null;

  return `
  <div class="screen">
    <div class="app-bar portal-app-bar student-app-bar">
      <div class="app-bar-left"><span class="app-bar-title">Notifications &amp; Alerts</span></div>
      ${notifs.length ? `
        <div class="flex-row gap-8">
          <button class="mark-all-btn" onclick="markAllStudentNotifsRead()">Read All</button>
          <button class="delete-all-btn" onclick="confirmClearAllStudentNotifs()">Delete All</button>
        </div>` : ""}
    </div>
    <div class="content-wrap">
      ${notifs.length ? notifs.map((n) => `
        <div class="notif-card ${!n.read ? "unread" : ""}" onclick="openStudentNotifDetail(${jsAttr(n.id)})">
          <div class="notif-header">
            <div class="notif-title-row"><span>${ICON.bell}</span><span class="notif-title">${esc(n.title)}</span>${!n.read ? `<span class="unread-dot"></span>` : ""}</div>
            <span class="notif-date">${esc(n.date)}</span>
            <button class="notif-close" title="Dismiss" onclick="event.stopPropagation(); dismissStudentNotif(${jsAttr(n.id)})">${ICON.close}</button>
          </div>
          <p class="notif-message">${esc(n.message)}</p>
        </div>
      `).join("") : `
        <div class="empty-state"><span class="icon">${ICON.belloff}</span><div class="title">No notifications yet.</div></div>
      `}
    </div>
    ${bottomNav("notifications", unread)}
  </div>
  ${detailNotif ? notifDetailModal(detailNotif, "closeStudentNotifDetail()", `dismissStudentNotif(${jsAttr(detailNotif.id)}); closeStudentNotifDetail();`) : ""}`;
}
function notifDetailModal(notif, closeFn, dismissFn) {
  return `
  <div class="modal-overlay center" onclick="${closeFn}">
    <div class="modal-card" onclick="event.stopPropagation()">
      <div class="modal-header" style="padding:0 0 14px;border-bottom:none;">
        <div class="modal-title flex-row gap-8"><span>${ICON.bell}</span>${esc(notif.title)}</div>
        <button class="modal-close" onclick="${closeFn}">${ICON.close}</button>
      </div>
      <div class="notif-date" style="margin-bottom:12px;">${esc(notif.date)}</div>
      <p class="notif-message" style="font-size:13.5px;line-height:1.6;">${esc(notif.message)}</p>
      <div style="display:flex;gap:10px;margin-top:22px;">
        <button class="btn btn-outline" style="border-color:var(--reject);color:var(--reject);" onclick="${dismissFn}">Delete</button>
        <button class="btn btn-primary" onclick="${closeFn}">Close</button>
      </div>
    </div>
  </div>`;
}
function openStudentNotifDetail(id) {
  const user = getActiveStudent();
  if (!user.notifications) return;
  const target = user.notifications.find((n) => n.id === id);
  if (target && !target.read) {
    const updated = user.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    updateStudent({ ...user, notifications: updated });
  }
  state.ui.studentNotif.detailId = id;
  render();
}
function closeStudentNotifDetail() {
  state.ui.studentNotif.detailId = null;
  render();
}
function markStudentNotifRead(id) {
  const user = getActiveStudent();
  if (!user.notifications) return;
  const target = user.notifications.find((n) => n.id === id);
  if (!target || target.read) return;
  const updated = user.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
  updateStudent({ ...user, notifications: updated });
  render();
}
function markAllStudentNotifsRead() {
  const user = getActiveStudent();
  if (!user.notifications || !user.notifications.length) return;
  const updated = user.notifications.map((n) => ({ ...n, read: true }));
  updateStudent({ ...user, notifications: updated });
  render();
}
function dismissStudentNotif(id) {
  const user = getActiveStudent();
  if (!user.notifications) return;
  const updated = user.notifications.filter((n) => n.id !== id);
  updateStudent({ ...user, notifications: updated });
  render();
}
function confirmClearAllStudentNotifs() {
  const user = getActiveStudent();
  if (!user.notifications || !user.notifications.length) return;
  appConfirm("Delete All Notifications?", "This will permanently remove all notifications. This can't be undone.", () => {
    updateStudent({ ...getActiveStudent(), notifications: [] });
    render();
  });
}

/* ---------------- Profile ---------------- */
function infoField(label, value, full, accent) {
  return `<div class="info-box ${full ? "full" : ""}"><div class="info-label">${label}</div><div class="info-value ${accent ? "accent" : ""}">${esc(value)}</div></div>`;
}
function studentProfileScreen() {
  const user = getActiveStudent();
  const unread = unreadNotifCount(user);
  const overallGWA = computeOverallGWA(user);
  const overallStatus = computeOverallGradeStatus(user);
  return `
  <div class="screen">
    <div class="app-bar portal-app-bar student-app-bar"><div class="app-bar-left"><span class="app-bar-title">Student Information</span></div></div>
    <div class="content-wrap">
      <div class="card-box">
        <div class="profile-avatar-row">
          <div class="avatar-circle">${esc(user.name.charAt(0))}</div>
          <div style="flex:1">
            <div style="font-size:17px;font-weight:700;color:var(--ink)">${esc(user.name)}</div>
            <div style="font-size:11.5px;color:var(--muted)">ID: ${esc(user.id)}</div>
            <span class="status-chip" style="background:${user.status === "Enrolled" ? "var(--success-bg)" : "var(--pending-bg)"};color:${user.status === "Enrolled" ? "var(--success)" : "var(--pending)"}">STATUS: ${esc(user.status.toUpperCase())}</span>
          </div>
        </div>
        <div class="divider"></div>
        <div class="group-heading">ACADEMIC INFORMATION</div>
        <div class="info-grid">
          ${infoField("ACADEMIC PROGRAM", user.program, true)}
          ${user.major ? infoField("MAJOR / SPECIALIZATION", user.major, true) : ""}
          ${infoField("ASSIGNED SECTION", user.section || "Unassigned", false, true)}
          ${infoField("YEAR LEVEL", user.yearLevel)}
          ${infoField("ACADEMIC YEAR", user.academicYear || "2026-2027")}
          ${infoField("SEMESTER", user.semester || "1st Semester")}
          ${infoField("GENERAL WEIGHTED AVERAGE (GWA)", overallGWA != null ? overallGWA.toFixed(2) : "Not yet available", false, true)}
          ${infoField("ACADEMIC STATUS", overallStatus, false, true)}
        </div>
        <div class="divider"></div>
        <div class="group-heading">PERSONAL INFORMATION</div>
        <div class="info-grid">
          ${infoField("CONTACT EMAIL", user.email, true)}
          ${infoField("MOBILE NUMBER", user.mobile)}
          ${infoField("BIRTHDAY", user.birthday || "Not Set")}
          ${infoField("COMPLETE ADDRESS", user.address || "Not Set", true)}
        </div>
        <div class="divider"></div>
        <div class="group-heading">EMERGENCY CONTACT</div>
        <div class="info-grid">
          ${infoField("CONTACT PERSON", user.emergencyContactName || "Not Set")}
          ${infoField("CONTACT NUMBER", user.emergencyContactNumber || "Not Set")}
        </div>
      </div>
      <button class="btn btn-reject" style="margin-top:16px;margin-bottom:24px" onclick="state.studentScreen='login'; render();"><span>${ICON.logout}</span>Log Out</button>
    </div>
    ${bottomNav("profile", unread)}
  </div>`;
}

/* =====================================================================
   INSTRUCTOR ROLE
===================================================================== */
function renderInstructorRole() {
  switch (state.instructorScreen) {
    case "login": return instructorLoginScreen();
    case "register": return instructorRegisterScreen();
    case "dashboard": return instructorDashboardScreen();
    default: return instructorLoginScreen();
  }
}

function instructorLoginScreen() {
  return `
  <div class="screen">
    <div class="auth-shell">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-logo instructor"><img src="BCC_LOGO.jpg" alt="Baao Community College Logo" /></div>
          <div class="org-subtitle">FACULTY PORTAL</div>
          <h1 class="auth-title">Instructor Login</h1>
          <p class="auth-desc">Access assigned classes and mark attendance.</p>
        </div>
        <div class="field-group">
          <div class="field"><span class="icon">${ICON.user}</span><input placeholder="Email" oninput="setDraft('insLoginEmail', this.value)" value="${esc(getDraft("insLoginEmail"))}"/></div>
          <div class="field"><span class="icon">${ICON.lock}</span><input type="password" placeholder="Password" oninput="setDraft('insLoginPass', this.value)"/></div>
          <button class="btn btn-success" onclick="instructorLoginSubmit()">Log In as Instructor</button>
        </div>
        <div class="auth-footer">
          <p>Need an Instructor Account?</p>
          <button class="btn btn-outline" onclick="state.instructorScreen='register'; render();">Create Instructor Account</button>
        </div>
      </div>
    </div>
  </div>`;
}
function instructorLoginSubmit() {
  const query = getDraft("insLoginEmail", "").trim().toLowerCase();
  const password = getDraft("insLoginPass", "");

  // Do not allow login when the fields are empty.
  // Previously an empty email fell back to a seeded instructor name,
  // which allowed the Instructor Portal to open without any input.
  if (!query || !password.trim()) {
    appAlert("Missing Login Details", "Please enter your Email and Password before logging in.");
    return;
  }

  const found =
    state.instructorsList.find((i) => i.email && i.email.toLowerCase() === query) ||
    state.instructorsList.find((i) => i.id && i.id.toLowerCase() === query);

  if (!found) {
    appAlert("No Instructor Account", "No instructor account matches that Email or name. Please create an account first.");
    return;
  }
  if (found.password && found.password !== password) {
    appAlert("Invalid Password", "The password you entered is incorrect.");
    return;
  }

  state.activeInstructorId = found.id;
  state.ui.instructor.selectedSubject = found?.subjects?.[0] || "CC 101";
  state.ui.instructor.selectedSection = null;
  clearDrafts("insLogin");
  state.instructorScreen = "dashboard";
  render();
}

function instructorRegisterScreen() {
  const selected = getDraft("insRegSubjects", []);
  return `
  <div class="screen">
    <div class="app-bar">
      <div class="app-bar-left">
        <button class="back-btn" onclick="state.instructorScreen='login'; render();">${ICON.arrowleft}</button>
        <span class="app-bar-title">Create Instructor Account</span>
      </div>
    </div>
    <div class="content-wrap narrow">
      <div class="field-group">
        <div class="section-heading" style="margin-top:0">Instructor Information</div>
        <div class="field"><span class="icon">${ICON.user}</span><input placeholder="Instructor Full Name (e.g., Prof. GR Atienza)" oninput="setDraft('insRegName', this.value)" value="${esc(getDraft("insRegName"))}"/></div>
        <div class="field"><span class="icon">${ICON.mail}</span><input placeholder="Email Address" oninput="setDraft('insRegEmail', this.value)" value="${esc(getDraft("insRegEmail"))}"/></div>
        <div class="field"><span class="icon">${ICON.lock}</span><input type="password" placeholder="Password" oninput="setDraft('insRegPass', this.value)" value="${esc(getDraft("insRegPass"))}"/></div>

        <div class="section-heading">Select Assigned Subjects</div>
        ${state.availableSubjects.map((sub) => {
          const checked = selected.includes(sub.code);
          return `<div class="doc-check-row">
            <button class="check-toggle" onclick="toggleInstructorRegSubject(${jsAttr(sub.code)})">
              <span class="check-icon">${checked ? ICON.checksquare : ICON.square}</span>
              <span style="font-size:13px;color:var(--ink)">${esc(sub.code)} - ${esc(sub.title)}</span>
            </button>
          </div>`;
        }).join("")}

        <button class="btn btn-success btn-block-mt" onclick="instructorRegisterSubmit()">Create Instructor Account</button>
      </div>
    </div>
  </div>`;
}
function toggleInstructorRegSubject(code) {
  const list = getDraft("insRegSubjects", []);
  const next = list.includes(code) ? list.filter((c) => c !== code) : [...list, code];
  setDraft("insRegSubjects", next);
  render();
}
function instructorRegisterSubmit() {
  const name = getDraft("insRegName", "").trim();
  const password = getDraft("insRegPass", "").trim();
  const email = getDraft("insRegEmail", "").trim();
  const selectedSubjects = getDraft("insRegSubjects", []);

  if (!name || !password) { appAlert("Missing Fields", "Please enter your name and password."); return; }
  if (!email) { appAlert("Missing Email", "Please enter your email address."); return; }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) { appAlert("Invalid Email", "Please enter a valid email address."); return; }
  if (selectedSubjects.length === 0) { appAlert("Missing Subjects", "Please select at least one subject to teach."); return; }

  const newInst = { id: autoGenerateId("INS"), name, email, password, subjects: selectedSubjects, notifications: [] };
  appAlert("Account Created", `Instructor account for ${name} has been created.`, () => {
    addInstructorGlobal(newInst);
    clearDrafts("insReg");
    state.instructorScreen = "login";
    render();
  });
}

/* ---------------- Instructor Dashboard ---------------- */
const STATUS_META = {
  Present: { colorVar: "success", bgVar: "success-bg", icon: ICON.checkcircle },
  Absent: { colorVar: "reject", bgVar: "reject-bg", icon: ICON.xcircle },
  Excuse: { colorVar: "accent", bgVar: "pending-bg", icon: ICON.filetext },
  Late: { colorVar: "primary", bgVar: null, icon: ICON.clock },
  "Not Marked": { colorVar: "muted", bgVar: "bg", icon: ICON.minuscircle },
};
const STATUS_OPTIONS = ["Present", "Absent", "Excuse", "Late"];

function getAttendanceRecords(student, subjectCode) {
  const subject = student.subjects?.find((item) => item.code === subjectCode);
  if (!subject) return [];
  const value = student.attendance?.[subject.id];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value) return [{ date: "Unknown", status: value }];
  return [];
}
function getStudentStatus(student, subjectCode, dateKey) {
  return getAttendanceRecords(student, subjectCode).find((r) => r.date === dateKey)?.status || "Not Marked";
}

/* ---------------- Grades (Midterm / Final -> GWA -> Status) ---------------- */
const PASSING_GWA = 75;

function getSubjectGrade(student, subjectId) {
  const g = student?.grades?.[subjectId];
  return { midterm: g && g.midterm != null ? g.midterm : null, final: g && g.final != null ? g.final : null };
}
function computeGWA(midterm, final) {
  if (midterm == null || final == null || isNaN(midterm) || isNaN(final)) return null;
  return Math.round((midterm * 0.4 + final * 0.6) * 100) / 100;
}
function computeGradeStatus(gwa) {
  if (gwa == null) return "Ongoing";
  return gwa >= PASSING_GWA ? "Passed" : "Failed";
}
function gradeStatusColors(status) {
  if (status === "Passed") return { color: "var(--success)", bg: "var(--success-bg)" };
  if (status === "Failed") return { color: "var(--reject)", bg: "var(--reject-bg)" };
  return { color: "var(--muted)", bg: "var(--bg)" };
}
function computeOverallGWA(student) {
  const subjects = student.subjects || [];
  let totalUnits = 0, weightedSum = 0;
  subjects.forEach((subj) => {
    const { midterm, final } = getSubjectGrade(student, subj.id);
    const gwa = computeGWA(midterm, final);
    if (gwa != null) { totalUnits += subj.units || 0; weightedSum += gwa * (subj.units || 0); }
  });
  return totalUnits ? Math.round((weightedSum / totalUnits) * 100) / 100 : null;
}
function computeOverallGradeStatus(student) {
  const subjects = student.subjects || [];
  if (!subjects.length) return "Ongoing";
  const statuses = subjects.map((subj) => {
    const { midterm, final } = getSubjectGrade(student, subj.id);
    return computeGradeStatus(computeGWA(midterm, final));
  });
  if (statuses.some((s) => s === "Failed")) return "Failed";
  if (statuses.every((s) => s === "Passed")) return "Passed";
  return "Ongoing";
}

function setStudentGrade(studentId, subjectId, field, rawValue) {
  const student = state.students.find((s) => s.id === studentId);
  if (!student) return;
  let value;
  if (rawValue === "" || rawValue === null || rawValue === undefined) {
    value = null;
  } else {
    value = Math.max(0, Math.min(100, parseFloat(rawValue)));
    if (isNaN(value)) { render(); return; }
  }
  const grades = { ...(student.grades || {}) };
  const existing = grades[subjectId] || { midterm: null, final: null };
  grades[subjectId] = { ...existing, [field]: value };

  const subj = student.subjects?.find((s) => s.id === subjectId);
  const gwa = computeGWA(grades[subjectId].midterm, grades[subjectId].final);
  const status = computeGradeStatus(gwa);
  const fieldLabel = field === "midterm" ? "Midterm" : "Final";
  const notif = {
    id: uid(),
    title: "Grade Updated",
    message: `${subj ? subj.code : "Subject"} ${fieldLabel} grade recorded.${gwa != null ? ` GWA: ${gwa.toFixed(2)} (${status}).` : ""}`,
    date: "Just now",
    read: false,
  };
  updateStudent({ ...student, grades, notifications: [notif, ...(student.notifications || [])] });
  render();
}

function instructorDashboardScreen() {
  const instructor = getActiveInstructor();
  const ui = state.ui.instructor;
  const notifications = instructor?.notifications || [];
  const unread = notifications.filter((n) => !n.read).length;
  const safeStudents = state.students;
  const safeSections = state.sectionsList;

  const enrolledStudents = safeStudents.filter((s) => s.subjects?.some((sub) => sub.code === ui.selectedSubject && sub.instructor === instructor?.name));

  const sectionSummaryMap = {};
  enrolledStudents.forEach((s) => { const name = s.section || "Unassigned"; sectionSummaryMap[name] = (sectionSummaryMap[name] || 0) + 1; });
  safeSections.forEach((sec) => { if (sec?.name && sectionSummaryMap[sec.name] == null) sectionSummaryMap[sec.name] = 0; });
  const sectionSummary = Object.entries(sectionSummaryMap).sort((a, b) => a[0].localeCompare(b[0]));

  const sectionStudents = ui.selectedSection ? enrolledStudents.filter((s) => (s.section || "Unassigned") === ui.selectedSection) : [];

  const q = ui.studentSearch.trim().toLowerCase();
  const filteredSectionStudents = !q ? sectionStudents : sectionStudents.filter((s) => [s.name, s.id, s.program, s.section].filter(Boolean).some((v) => String(v).toLowerCase().includes(q)));

  const meetingDates = new Set();
  sectionStudents.forEach((s) => getAttendanceRecords(s, ui.selectedSubject).forEach((r) => { if (/^\d{4}-\d{2}-\d{2}$/.test(r.date || "")) meetingDates.add(r.date); }));

  const dateCounts = { Present: 0, Absent: 0, Excuse: 0, Late: 0, "Not Marked": 0 };
  sectionStudents.forEach((s) => { dateCounts[getStudentStatus(s, ui.selectedSubject, ui.selectedDateKey)] += 1; });

  const [cy, cm] = ui.calendarMonthKey.split("-").map(Number);
  const calendarStart = new Date(cy, cm - 1, 1).getDay();
  const daysInMonth = new Date(cy, cm, 0).getDate();
  const cells = Array(calendarStart).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(cy, cm - 1, d));
  const monthLabel = new Date(cy, cm - 1, 1).toLocaleDateString(undefined, { month: "short", year: "numeric" });

  const header = `
  <div class="content-wrap">
    <div class="dashboard-header-bar">
      <div class="dashboard-header-icon">${ICON.usercheck}</div>
      <div style="flex:1;min-width:0">
        <div class="kicker">INSTRUCTOR WORKSPACE</div>
        <div class="dashboard-title">${esc(instructor?.name || "Faculty Member")}</div>
        <div class="dashboard-subtitle">Manage classes and attendance in one place.</div>
      </div>
      <button class="notification-button" onclick="state.ui.instructor.isNotifModalOpen=true; render();">
        <span class="icon">${ICON.bell}</span>${unread ? `<span class="notification-dot"></span>` : ""}
      </button>
    </div>

    <div class="subject-card-select" onclick="state.ui.instructor.isSubjectModalOpen=true; render();">
      <div class="subject-card-icon">${ICON.bookopen}</div>
      <div style="flex:1;min-width:0">
        <div class="field-label-xs">CURRENT SUBJECT</div>
        <div class="subject-card-value">${esc(ui.selectedSubject || "")}</div>
      </div>
      <span>${ICON.chevrondown}</span>
    </div>

    <div class="stat-grid">
      <div class="summary-card"><div class="summary-label">STUDENTS</div><div class="summary-value">${enrolledStudents.length}</div></div>
      <div class="summary-card"><div class="summary-label">SECTIONS</div><div class="summary-value">${sectionSummary.length}</div></div>
      <div class="summary-card"><div class="summary-label">MEETINGS</div><div class="summary-value">${meetingDates.size}</div></div>
    </div>

    ${!ui.selectedSection ? `
      <div class="panel">
        <div class="panel-header"><div><div class="panel-title">Your Sections</div><div class="panel-hint">Choose a section to manage its attendance.</div></div></div>
        <div class="section-grid">
          ${sectionSummary.map(([name, count]) => `
            <div class="section-card-new" onclick="selectInstructorSection(${jsAttr(name)})">
              <div class="section-card-top-row"><div class="section-icon">${ICON.users}</div><span>${ICON.arrowup}</span></div>
              <div class="section-card-title">${esc(name)}</div>
              <div class="section-card-count">${count}</div>
              <div class="section-card-caption">${count === 1 ? "student" : "students"}</div>
            </div>`).join("")}
        </div>
        ${sectionSummary.length === 0 ? `<div class="empty-card"><span class="icon">${ICON.users}</span><div class="empty-title">No sections yet</div><div class="empty-text">Students assigned to your subject will appear here.</div></div>` : ""}
      </div>
    ` : `
      <div class="panel">
        <div class="panel-header">
          <button class="back-section-button" onclick="state.ui.instructor.selectedSection=null; render();"><span>${ICON.arrowleft}</span>Sections</button>
          <div style="flex:1;min-width:0">
            <div class="workspace-eyebrow">${ui.activeTab === "grades" ? "SECTION GRADES" : "SECTION ATTENDANCE"}</div>
            <div class="workspace-title">${esc(ui.selectedSection)}</div>
            <div class="workspace-meta">${sectionStudents.length} students · ${esc(ui.selectedSubject)}</div>
          </div>
        </div>

        <div class="role-toggle-group instr-tab-group">
          <button class="role-btn ${ui.activeTab !== "grades" ? "active" : ""}" onclick="switchInstructorTab('attendance')"><span>${ICON.checkcircle}</span> Attendance</button>
          <button class="role-btn ${ui.activeTab === "grades" ? "active" : ""}" onclick="switchInstructorTab('grades')"><span>${ICON.filetext}</span> Grades</button>
        </div>

        ${ui.activeTab === "grades" ? `
        <div class="search-box">
          <span class="icon">${ICON.search}</span>
          <input placeholder="Search student name or ID" value="${esc(ui.studentSearch)}" oninput="updateInstructorSearch(this.value)"/>
          ${ui.studentSearch ? `<button class="search-clear" onclick="updateInstructorSearch('')">${ICON.close}</button>` : ""}
        </div>
        <div class="grade-legend-note">Midterm counts 40% and Final counts 60% toward the GWA. A GWA of ${PASSING_GWA} or higher is Passed. Saved grades appear immediately in the Student and Registrar portals.</div>
        ` : `
        <div class="calendar-card">
          <div class="calendar-header">
            <div><div class="calendar-title">Attendance Calendar</div><div class="calendar-hint">Select a meeting date.</div></div>
            <div class="calendar-nav">
              <button class="calendar-nav-btn" onclick="navCalendarMonth(-1)">${ICON.chevronleft}</button>
              <span class="calendar-month-title">${monthLabel}</span>
              <button class="calendar-nav-btn" onclick="navCalendarMonth(1)">${ICON.chevronright}</button>
            </div>
          </div>
          <div class="week-header">${["S","M","T","W","T","F","S"].map((d) => `<span class="week-label">${d}</span>`).join("")}</div>
          <div class="calendar-grid">
            ${cells.map((date) => {
              if (!date) return `<div class="day-cell"></div>`;
              const key = toDateKey(date);
              const selected = key === ui.selectedDateKey;
              const hasAtt = meetingDates.has(key);
              return `<button class="day-cell ${selected ? "selected" : ""}" onclick="selectCalendarDate(${jsAttr(key)})">
                <span class="day-text">${date.getDate()}</span>
                ${hasAtt ? `<span class="day-dot"></span>` : ""}
              </button>`;
            }).join("")}
          </div>
          <div class="calendar-legend">
            <div class="legend-item"><span class="legend-dot" style="background:var(--success)"></span><span class="legend-text">Attendance recorded</span></div>
            <div class="legend-item"><span class="legend-dot" style="background:var(--primary)"></span><span class="legend-text">Selected date</span></div>
          </div>
        </div>

        <div class="selected-date-card">
          <div class="selected-date-icon">${ICON.calendar}</div>
          <div style="flex:1"><div class="field-label-xs">SELECTED MEETING DATE</div><div class="selected-date-value">${ui.selectedDateKey}</div></div>
          <div class="recorded-count">${sectionStudents.length}<span class="recorded-count-label"> students</span></div>
        </div>

        <div class="attendance-summary-grid">
          ${["Present","Absent","Excuse","Late","Not Marked"].map((label) => {
            const meta = STATUS_META[label];
            return `<div class="count-card" style="background:var(--${meta.bgVar || "bg"})"><div class="count-value" style="color:var(--${meta.colorVar})">${dateCounts[label]}</div><div class="count-label" style="color:var(--${meta.colorVar})">${label}</div></div>`;
          }).join("")}
        </div>

        <div class="manage-bar">
          <div style="flex:1;min-width:0"><div class="panel-title" style="font-size:13px">Student Attendance</div><div class="panel-hint">${filteredSectionStudents.length} of ${sectionStudents.length} students shown</div></div>
          <button class="bulk-button" onclick="markAllPresent()"><span>${ICON.checkcircle}</span>All Present</button>
        </div>

        <div class="search-box">
          <span class="icon">${ICON.search}</span>
          <input placeholder="Search student name or ID" value="${esc(ui.studentSearch)}" oninput="updateInstructorSearch(this.value)"/>
          ${ui.studentSearch ? `<button class="search-clear" onclick="updateInstructorSearch('')">${ICON.close}</button>` : ""}
        </div>
        `}
      </div>
    `}
  </div>`;

  const studentCards = !ui.selectedSection ? "" : (ui.activeTab === "grades"
    ? (filteredSectionStudents.length ? filteredSectionStudents.map((item) => renderInstructorGradeCard(item, ui.selectedSubject)).join("")
      : `<div class="content-wrap"><div class="empty-card"><span class="icon">${ICON.users}</span><div class="empty-title">No students found</div><div class="empty-text">${ui.studentSearch ? "Try another student name or ID." : "No students are assigned to this section."}</div></div></div>`)
    : (filteredSectionStudents.length ? filteredSectionStudents.map((item) => renderInstructorStudentCard(item, ui.selectedSubject, ui.selectedDateKey)).join("")
      : `<div class="content-wrap"><div class="empty-card"><span class="icon">${ICON.users}</span><div class="empty-title">No students found</div><div class="empty-text">${ui.studentSearch ? "Try another student name or ID." : "No students are assigned to this section."}</div></div></div>`));

  return `
  <div class="screen">
    <div class="app-bar portal-app-bar instructor-app-bar">
      <div class="app-bar-left"><span class="app-bar-title">Instructor Portal</span></div>
      <button class="logout-btn" onclick="state.instructorScreen='login'; render();"><span>${ICON.logout}</span>Logout</button>
    </div>
    ${header}
    ${studentCards}
    <div style="height:20px"></div>
    ${ui.isSubjectModalOpen ? instructorSubjectModal(instructor, ui) : ""}
    ${ui.isNotifModalOpen ? instructorNotifModal(instructor, notifications) : ""}
  </div>`;
}

function renderInstructorStudentCard(item, selectedSubject, selectedDateKey) {
  const status = getStudentStatus(item, selectedSubject, selectedDateKey);
  const meta = STATUS_META[status];
  const subject = item.subjects?.find((e) => e.code === selectedSubject);
  const records = getAttendanceRecords(item, selectedSubject);
  return `
  <div class="content-wrap" style="padding-top:0;padding-bottom:0">
  <div class="student-row-card">
    <div class="student-row-top">
      <div class="avatar-small">${esc(String(item.name || "?").slice(0, 1).toUpperCase())}</div>
      <div class="student-identity">
        <div class="student-row-name">${esc(item.name)}</div>
        <div class="student-row-meta">${esc(item.id)} · ${esc(item.program || "No program")}</div>
      </div>
      <div class="current-status" style="background:var(--${meta.bgVar || "bg"})"><span class="current-status-text" style="color:var(--${meta.colorVar})">${status}</span></div>
    </div>
    <div class="student-details-line">
      <span class="student-detail-text">Section: ${esc(item.section || "Unassigned")}</span>
      <span class="student-detail-text">Room: ${esc(subject?.roomLab || "N/A")}</span>
    </div>
    <div class="status-grid">
      ${STATUS_OPTIONS.map((opt) => {
        const m = STATUS_META[opt];
        const active = status === opt;
        return `<button class="status-button" style="background:${active ? "var(--" + m.colorVar + ")" : "var(--" + (m.bgVar || "bg") + ")"};border-color:${active ? "var(--" + m.colorVar + ")" : "var(--line)"};color:${active ? "#fff" : "var(--" + m.colorVar + ")"}" onclick="markAttendance(${jsAttr(item.id)}, ${jsAttr(opt)})">
          <span>${m.icon}</span>${opt}
        </button>`;
      }).join("")}
    </div>
    ${records.length ? `
    <div class="history-line">
      <span class="history-line-label">Recent:</span>
      ${records.slice(-3).reverse().map((r) => `<span class="history-tag"><span class="history-tag-date">${esc(r.date)}</span><span class="history-tag-status" style="color:var(--${(STATUS_META[r.status] || STATUS_META["Not Marked"]).colorVar})">${esc(r.status)}</span></span>`).join("")}
    </div>` : ""}
  </div>
  </div>`;
}

function renderInstructorGradeCard(item, selectedSubject) {
  const subject = item.subjects?.find((e) => e.code === selectedSubject);
  if (!subject) return "";
  const { midterm, final } = getSubjectGrade(item, subject.id);
  const gwa = computeGWA(midterm, final);
  const status = computeGradeStatus(gwa);
  const sc = gradeStatusColors(status);
  return `
  <div class="content-wrap" style="padding-top:0;padding-bottom:0">
  <div class="student-row-card">
    <div class="student-row-top">
      <div class="avatar-small">${esc(String(item.name || "?").slice(0, 1).toUpperCase())}</div>
      <div class="student-identity">
        <div class="student-row-name">${esc(item.name)}</div>
        <div class="student-row-meta">${esc(item.id)} · ${esc(item.program || "No program")}</div>
      </div>
      <div class="current-status" style="background:${sc.bg}"><span class="current-status-text" style="color:${sc.color}">${status}</span></div>
    </div>
    <div class="student-details-line">
      <span class="student-detail-text">Section: ${esc(item.section || "Unassigned")}</span>
      <span class="student-detail-text">${esc(subject.code)} · ${subject.units} Units</span>
    </div>
    <div class="grade-input-grid">
      <div class="grade-field">
        <div class="field-label-xs">MIDTERM</div>
        <input class="modal-input" type="number" min="0" max="100" step="0.01" placeholder="0-100"
          value="${midterm != null ? midterm : ""}"
          onchange="setStudentGrade(${jsAttr(item.id)}, ${jsAttr(subject.id)}, 'midterm', this.value)"/>
      </div>
      <div class="grade-field">
        <div class="field-label-xs">FINAL</div>
        <input class="modal-input" type="number" min="0" max="100" step="0.01" placeholder="0-100"
          value="${final != null ? final : ""}"
          onchange="setStudentGrade(${jsAttr(item.id)}, ${jsAttr(subject.id)}, 'final', this.value)"/>
      </div>
      <div class="grade-field">
        <div class="field-label-xs">GWA</div>
        <div class="gwa-display" style="color:${sc.color}">${gwa != null ? gwa.toFixed(2) : "—"}</div>
      </div>
    </div>
  </div>
  </div>`;
}

function selectInstructorSection(name) {
  state.ui.instructor.selectedSection = name;
  state.ui.instructor.studentSearch = "";
  state.ui.instructor.activeTab = "attendance";
  const today = todayStart();
  state.ui.instructor.selectedDateKey = toDateKey(today);
  state.ui.instructor.calendarMonthKey = toDateKey(today).slice(0, 7);
  render();
}
function switchInstructorTab(tab) {
  state.ui.instructor.activeTab = tab;
  state.ui.instructor.studentSearch = "";
  render();
}
function navCalendarMonth(delta) {
  const [y, m] = state.ui.instructor.calendarMonthKey.split("-").map(Number);
  const next = new Date(y, m - 1 + delta, 1);
  state.ui.instructor.calendarMonthKey = toDateKey(next).slice(0, 7);
  render();
}
function selectCalendarDate(key) { state.ui.instructor.selectedDateKey = key; render(); }
function updateInstructorSearch(value) { state.ui.instructor.studentSearch = value; render(); }

function markAttendance(studentId, status) {
  const instructor = getActiveInstructor();
  const student = state.students.find((s) => s.id === studentId);
  const selectedSubject = state.ui.instructor.selectedSubject;
  const dateKey = state.ui.instructor.selectedDateKey;
  const subject = student.subjects?.find((item) => item.code === selectedSubject);
  if (!subject) return;

  const existing = getAttendanceRecords(student, selectedSubject);
  const records = [
    ...existing.filter((r) => r.date !== dateKey),
    { date: dateKey, status, markedBy: instructor?.name, markedAt: new Date().toISOString() },
  ].sort((a, b) => a.date.localeCompare(b.date));

  updateStudent({
    ...student,
    attendance: { ...(student.attendance || {}), [subject.id]: records },
    notifications: [
      { id: uid(), title: "Attendance Updated", message: `${selectedSubject} on ${dateKey}: ${status}`, date: "Just now", read: false },
      ...(student.notifications || []),
    ],
  });
  render();
}
function markAllPresent() {
  const ui = state.ui.instructor;
  const enrolledStudents = state.students.filter((s) => s.subjects?.some((sub) => sub.code === ui.selectedSubject && sub.instructor === getActiveInstructor()?.name));
  const sectionStudents = ui.selectedSection ? enrolledStudents.filter((s) => (s.section || "Unassigned") === ui.selectedSection) : [];
  sectionStudents.forEach((s) => markAttendance(s.id, "Present"));
}

function instructorSubjectModal(instructor, ui) {
  return `
  <div class="modal-overlay">
    <div class="modal-sheet">
      <div class="modal-header">
        <div><div class="modal-title">Select Subject</div><div class="modal-subtitle">Choose the class you want to manage.</div></div>
        <button class="modal-close" onclick="state.ui.instructor.isSubjectModalOpen=false; render();">${ICON.close}</button>
      </div>
      <div class="modal-body">
        ${(instructor?.subjects || []).map((code) => {
          const selected = ui.selectedSubject === code;
          const count = state.students.filter((s) => s.subjects?.some((sub) => sub.code === code && sub.instructor === instructor?.name)).length;
          return `<div class="modal-option ${selected ? "active" : ""}" onclick="selectInstructorSubject(${jsAttr(code)})">
            <div class="modal-option-icon" style="color:${selected ? "var(--success)" : "var(--muted)"}">${ICON.filetext}</div>
            <div style="flex:1"><div class="modal-option-title">${esc(code)}</div><div class="modal-option-meta">${count} enrolled students</div></div>
            ${selected ? `<span style="color:var(--success)">${ICON.checkcircle}</span>` : ""}
          </div>`;
        }).join("")}
      </div>
    </div>
  </div>`;
}
function selectInstructorSubject(code) {
  state.ui.instructor.selectedSubject = code;
  state.ui.instructor.selectedSection = null;
  state.ui.instructor.studentSearch = "";
  state.ui.instructor.isSubjectModalOpen = false;
  render();
}

function instructorNotifModal(instructor, notifications) {
  const detailId = state.ui.instructor.notifDetailId;
  const detailNotif = detailId ? notifications.find((n) => n.id === detailId) : null;
  return `
  <div class="modal-overlay">
    <div class="modal-sheet">
      <div class="modal-header">
        <div class="modal-title">Announcements</div>
        <div class="flex-row gap-8">
          ${notifications.length ? `
            <button class="mark-all-btn" onclick="markAllInstructorNotifsRead()">Read All</button>
            <button class="delete-all-btn" onclick="confirmClearAllInstructorNotifs()">Delete All</button>
          ` : ""}
          <button class="modal-close" onclick="state.ui.instructor.isNotifModalOpen=false; render();">${ICON.close}</button>
        </div>
      </div>
      <div class="modal-body">
        ${notifications.length ? notifications.map((n) => `
          <div class="notif-card ${!n.read ? "unread" : ""}" onclick="openInstructorNotifDetail(${jsAttr(n.id)})">
            <div class="notif-header">
              <div class="notif-title">${esc(n.title)}</div>
              <span class="notif-date">${esc(n.date)}</span>
              <button class="notif-close" title="Dismiss" onclick="event.stopPropagation(); dismissInstructorNotif(${jsAttr(n.id)})">${ICON.close}</button>
            </div>
            <p class="notif-message">${esc(n.message)}</p>
          </div>`).join("") : `<div class="empty-state"><span class="icon">${ICON.belloff}</span><div class="desc">No announcements yet.</div></div>`}
      </div>
    </div>
  </div>
  ${detailNotif ? notifDetailModal(detailNotif, "closeInstructorNotifDetail()", `dismissInstructorNotif(${jsAttr(detailNotif.id)}); closeInstructorNotifDetail();`) : ""}`;
}
function openInstructorNotifDetail(id) {
  const instructor = getActiveInstructor();
  if (!instructor) return;
  const notifs = instructor.notifications || [];
  const target = notifs.find((n) => n.id === id);
  if (target && !target.read) {
    updateInstructor({ ...instructor, notifications: notifs.map((n) => (n.id === id ? { ...n, read: true } : n)) });
  }
  state.ui.instructor.notifDetailId = id;
  render();
}
function closeInstructorNotifDetail() {
  state.ui.instructor.notifDetailId = null;
  render();
}
function markInstructorNotifRead(id) {
  const instructor = getActiveInstructor();
  if (!instructor || instructor.read) {}
  const notifs = instructor.notifications || [];
  const target = notifs.find((n) => n.id === id);
  if (!target || target.read) return;
  updateInstructor({ ...instructor, notifications: notifs.map((n) => (n.id === id ? { ...n, read: true } : n)) });
  render();
}
function markAllInstructorNotifsRead() {
  const instructor = getActiveInstructor();
  if (!instructor) return;
  const notifs = instructor.notifications || [];
  if (!notifs.length) return;
  updateInstructor({ ...instructor, notifications: notifs.map((n) => ({ ...n, read: true })) });
  render();
}
function dismissInstructorNotif(id) {
  const instructor = getActiveInstructor();
  if (!instructor) return;
  const notifs = instructor.notifications || [];
  updateInstructor({ ...instructor, notifications: notifs.filter((n) => n.id !== id) });
  render();
}
function confirmClearAllInstructorNotifs() {
  const instructor = getActiveInstructor();
  if (!instructor || !(instructor.notifications || []).length) return;
  appConfirm("Delete All Announcements?", "This will permanently remove all announcements. This can't be undone.", () => {
    updateInstructor({ ...getActiveInstructor(), notifications: [] });
    render();
  });
}

/* =====================================================================
   REGISTRAR ROLE
===================================================================== */
function renderRegistrarRole() {
  switch (state.registrarScreen) {
    case "login": return registrarLoginScreen();
    case "register": return registrarRegisterScreen();
    case "dashboard": return registrarDashboardScreen();
    default: return registrarLoginScreen();
  }
}

function registrarLoginScreen() {
  return `
  <div class="screen">
    <div class="auth-shell">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-logo registrar"><img src="BCC_LOGO.jpg" alt="Baao Community College Logo" /></div>
          <div class="org-subtitle">ADMINISTRATION PORTAL</div>
          <h1 class="auth-title">Registrar Login</h1>
          <p class="auth-desc">Access student approvals and schedule management.</p>
        </div>
        <div class="field-group">
          <div class="field"><span class="icon">${ICON.user}</span><input placeholder="Employee ID orEmail" oninput="setDraft('regLoginId', this.value)" value="${esc(getDraft("regLoginId"))}"/></div>
          <div class="field"><span class="icon">${ICON.lock}</span><input type="password" placeholder="Password" oninput="setDraft('regLoginPass', this.value)"/></div>
          <button class="btn btn-primary" onclick="registrarLoginSubmit()">Log In as Registrar</button>
        </div>
        <div class="auth-footer">
          <p>Need a new Registrar account?</p>
          <button class="btn btn-outline" onclick="state.registrarScreen='register'; render();">Create Registrar Account</button>
        </div>
      </div>
    </div>
  </div>`;
}
function registrarLoginSubmit() {
  const query = getDraft("regLoginId", "").trim().toLowerCase();
  const password = getDraft("regLoginPass", "");
  const found =
    state.registrarsList.find((r) => r.email && r.email.toLowerCase() === query) ||
    state.registrarsList.find((r) => r.id && r.id.toLowerCase() === query);

  if (!found) {
    appAlert("No Registrar Account", "No registrar account matches that Employee ID or email. Please create an account first.");
    return;
  }
  if (found.password && found.password !== password) {
    appAlert("Invalid Password", "The password you entered is incorrect.");
    return;
  }

  state.activeRegistrarId = found.id;
  clearDrafts("regLogin");
  state.registrarScreen = "dashboard";
  render();
}

function registrarRegisterScreen() {
  return `
  <div class="screen">
    <div class="app-bar">
      <div class="app-bar-left">
        <button class="back-btn" onclick="state.registrarScreen='login'; render();">${ICON.arrowleft}</button>
        <span class="app-bar-title">Create Registrar Account</span>
      </div>
    </div>
    <div class="content-wrap narrow">
      <div class="field-group">
        <div class="field"><span class="icon">${ICON.user}</span><input placeholder="Full Name" oninput="setDraft('regRegName', this.value)" value="${esc(getDraft("regRegName"))}"/></div>
        <div class="field"><span class="icon">${ICON.mail}</span><input placeholder="Work Email" oninput="setDraft('regRegEmail', this.value)" value="${esc(getDraft("regRegEmail"))}"/></div>
        <div class="field"><span class="icon">${ICON.briefcase}</span><input placeholder="Department / Office" oninput="setDraft('regRegDept', this.value)" value="${esc(getDraft("regRegDept"))}"/></div>
        <div class="field"><span class="icon">${ICON.lock}</span><input type="password" placeholder="Password" oninput="setDraft('regRegPass', this.value)" value="${esc(getDraft("regRegPass"))}"/></div>
        <button class="btn btn-accent" onclick="registrarRegisterSubmit()">Create Account</button>
      </div>
    </div>
  </div>`;
}
function registrarRegisterSubmit() {
  const fullName = getDraft("regRegName", "").trim();
  const email = getDraft("regRegEmail", "").trim();
  if (!fullName || !email) { appAlert("Required Fields", "Please fill in all required fields."); return; }
  const regId = autoGenerateId("REG");
  const newRegistrar = { id: regId, name: fullName, email, password: getDraft("regRegPass", "").trim(), department: getDraft("regRegDept", "").trim() || "Admissions & Records" };
  appAlert("Registrar Account Created", `Welcome, ${fullName}!\nRegistrar ID: ${regId}`, () => {
    addRegistrarGlobal(newRegistrar);
    clearDrafts("regReg");
    state.registrarScreen = "login";
    render();
  });
}

/* ---------------- Registrar Dashboard ---------------- */
function allRequirementsSubmitted(student) {
  const docs = Array.isArray(student?.docs) ? student.docs : [];
  return docs.length > 0 && docs.every((d) => Boolean(d?.fileName?.trim()));
}

function registrarDashboardScreen() {
  const registrarUser = getActiveRegistrar();
  const ui = state.ui.registrar;
  const selectedStudent = ui.selectedStudentId ? state.students.find((s) => s.id === ui.selectedStudentId) : null;

  return `
  <div class="screen">
    <div class="app-bar portal-app-bar registrar-app-bar">
      <div class="app-bar-left"><span class="app-bar-title">Registrar Management Console</span></div>
      <button class="logout-btn" onclick="state.registrarScreen='login'; render();"><span>${ICON.logout}</span>Logout</button>
    </div>
    <div class="content-wrap">
      <div class="admin-banner">
        <div class="eyebrow">LOGGED IN AS REGISTRAR</div>
        <div class="name">${esc(registrarUser?.name || "Officer")}</div>
        <div class="dept">${esc(registrarUser?.department || "Office of the Registrar")}</div>
      </div>

      <div class="section-title" style="margin-top:0">Master Database Management</div>
      <div class="action-grid">
        <button class="action-btn" style="background:var(--accent)" onclick="state.ui.registrar.isAddSectionModalOpen=true; render();"><span>${ICON.users}</span>Add Section</button>
        <button class="action-btn" style="background:var(--primary)" onclick="state.ui.registrar.isAddSubjModalOpen=true; render();"><span>${ICON.plus}</span>Add Subject</button>
        <button class="action-btn" style="background:var(--success)" onclick="state.ui.registrar.isAddRoomModalOpen=true; render();"><span>${ICON.home}</span>Add Room</button>
        <button class="action-btn" style="background:var(--primary-dark)" onclick="state.ui.registrar.isAnnouncementModalOpen=true; render();"><span>${ICON.bell}</span>Add Announcements</button>
        <button class="action-btn" style="background:var(--accent)" onclick="state.ui.registrar.isAddCourseModalOpen=true; render();"><span>${ICON.bookopen}</span>Add Course</button>
        <button class="action-btn" style="background:var(--primary)" onclick="openAddMajorModal()"><span>${ICON.layers}</span>Add Major/Specialization</button>
      </div>

      <div class="section-title">Active Sections &amp; Capacity Overview</div>
      <div class="section-badge-row">
        ${state.sectionsList.map((sec) => {
          const count = state.students.filter((st) => st.section === sec.name).length;
          return `<div class="section-badge-card"><div class="sb-name">${esc(sec.name)}</div><div class="sb-count" style="color:${count >= sec.maxCapacity ? "var(--reject)" : "var(--success)"}">${count} / ${sec.maxCapacity} Students</div></div>`;
        }).join("")}
      </div>

      <div class="section-title">Registered Student Applications (${state.students.length})</div>
      ${state.students.map((st) => {
        const verifiedCount = st.docs.filter((d) => d.status === "Verified").length;
        const stGWA = computeOverallGWA(st);
        const stGradeStatus = computeOverallGradeStatus(st);
        const stGc = gradeStatusColors(stGradeStatus);
        return `<div class="card-box student-app-card" onclick="openRegistrarStudent(${jsAttr(st.id)})">
          <div class="student-app-top">
            <span class="student-app-name">${esc(st.name)}</span>
            <span class="status-chip" style="background:${st.status === "Enrolled" ? "var(--success-bg)" : "var(--pending-bg)"};color:${st.status === "Enrolled" ? "var(--success)" : "var(--pending)"}">${esc(st.status)}</span>
          </div>
          <div style="font-size:11px;color:var(--muted);margin-top:3px">ID: ${esc(st.id)} · ${esc(st.program)}</div>
          <div style="font-size:11px;color:var(--accent);font-weight:700;margin-top:3px">Section: ${esc(st.section || "Unassigned")}</div>
          <div style="font-size:11px;color:var(--primary);font-weight:600;margin-top:3px">Requirements Verified: ${verifiedCount}/${st.docs.length}</div>
          ${st.subjects && st.subjects.length ? `<div style="font-size:11px;font-weight:700;margin-top:3px;color:${stGc.color}">GWA: ${stGWA != null ? stGWA.toFixed(2) : "—"} · ${stGradeStatus}</div>` : ""}
        </div>`;
      }).join("")}
    </div>

    ${selectedStudent ? registrarStudentModal(selectedStudent) : ""}
    ${ui.isAddSectionModalOpen ? addSectionModal() : ""}
    ${ui.isAddSubjModalOpen ? addSubjectModal() : ""}
    ${ui.isAddRoomModalOpen ? addRoomModal() : ""}
    ${ui.isAddCourseModalOpen ? addCourseModal() : ""}
    ${ui.isAddMajorModalOpen ? addMajorModal() : ""}
    ${ui.isAnnouncementModalOpen ? announcementModal() : ""}
    ${ui.previewDocIndex !== null && selectedStudent ? docPreviewModal(selectedStudent.docs[ui.previewDocIndex], "registrar") : ""}
  </div>`;
}

function openRegistrarStudent(id) {
  const s = state.students.find((st) => st.id === id);
  state.ui.registrar.selectedStudentId = id;
  state.ui.registrar.assignedSection = s.section || "";
  state.ui.registrar.selectedSubjects = s.subjects ? JSON.parse(JSON.stringify(s.subjects)) : [];
  state.ui.registrar.expandedSubjectId = null;
  render();
}
function closeRegistrarStudentModal() {
  state.ui.registrar.selectedStudentId = null;
  state.ui.registrar.previewDocIndex = null;
  render();
}

function registrarStudentModal(student) {
  const ui = state.ui.registrar;
  const complete = allRequirementsSubmitted(student);

  const overallGWA = computeOverallGWA(student);
  const overallStatus = computeOverallGradeStatus(student);
  const overallColors = gradeStatusColors(overallStatus);
  const gradesHtml = (student.subjects && student.subjects.length)
    ? `
    <div class="section-heading" style="margin-top:0">Grade Records (from Instructor Portal)</div>
    <div class="card-box" style="margin-bottom:12px">
      ${student.subjects.map((subj) => {
        const { midterm, final } = getSubjectGrade(student, subj.id);
        const gwa = computeGWA(midterm, final);
        const status = computeGradeStatus(gwa);
        const sc = gradeStatusColors(status);
        return `
        <div class="grade-record-row">
          <div style="flex:1;min-width:0">
            <div style="font-size:12px;font-weight:700;color:var(--ink)">${esc(subj.code)} - ${esc(subj.title)}</div>
            <div style="font-size:10px;color:var(--muted)">Instructor: ${esc(subj.instructor || "Not yet assigned")}</div>
          </div>
          <div class="grade-record-figures">
            <span>MT: <b>${midterm != null ? midterm : "—"}</b></span>
            <span>FN: <b>${final != null ? final : "—"}</b></span>
            <span>GWA: <b>${gwa != null ? gwa.toFixed(2) : "—"}</b></span>
          </div>
          <span class="status-chip" style="background:${sc.bg};color:${sc.color}">${status}</span>
        </div>`;
      }).join("")}
      <div class="divider"></div>
      <div class="grade-record-row">
        <div style="font-size:12.5px;font-weight:800;color:var(--ink)">Overall General Weighted Average</div>
        <div class="grade-record-figures"><span style="font-size:13px;font-weight:800;color:${overallColors.color}">${overallGWA != null ? overallGWA.toFixed(2) : "—"}</span></div>
        <span class="status-chip" style="background:${overallColors.bg};color:${overallColors.color}">${overallStatus}</span>
      </div>
    </div>` : "";

  const docsHtml = student.docs.map((d, i) => `
    <div class="doc-check-row">
      <button class="check-toggle" onclick="toggleRegistrarDoc(${i})">
        <span class="check-icon">${d.status === "Verified" ? ICON.checksquare : ICON.square}</span>
        <div style="flex:1">
          <div style="font-size:12px;color:var(--ink);font-weight:600">${esc(d.name)}</div>
          <div style="font-size:10px;color:var(--muted)">${d.fileName ? esc(d.fileName) : "No file submitted"}</div>
        </div>
      </button>
      ${d.fileName ? `<button class="icon-btn-sm" onclick="openRegistrarDocPreview(${i})"><span>${ICON.eye}</span>View</button>` : ""}
      <span style="font-size:11px;font-weight:700;color:${d.status === "Verified" ? "var(--success)" : "var(--accent)"};margin-left:8px">${d.status}</span>
    </div>`).join("");

  let assignmentSection = "";
  if (!complete) {
    const submittedCount = student.docs.filter((d) => d?.fileName?.trim()).length;
    assignmentSection = `
    <div class="assignment-locked-card">
      <div class="assignment-locked-icon">&#128274;</div>
      <div style="flex:1">
        <div class="assignment-locked-title">Assignment Locked</div>
        <div class="assignment-locked-text">Submit every required document first. Once all requirements have a file, the Section, Subjects, Instructor, Schedule, and Room controls will automatically reopen.</div>
        <div class="assignment-locked-progress">Submitted: ${submittedCount} / ${student.docs.length}</div>
      </div>
    </div>`;
  } else {
    assignmentSection = `
    <div class="section-heading">2. Assign Student Section / Block</div>
    <div class="chip-row">
      ${state.sectionsList.map((sec) => {
        const countInSec = state.students.filter((s) => s.section === sec.name && s.id !== student.id).length;
        const isSelected = ui.assignedSection === sec.name;
        return `<div class="chip ${isSelected ? "active" : ""}" onclick="setRegistrarSection(${jsAttr(sec.name)})">${esc(sec.name)} (${countInSec}/${sec.maxCapacity})</div>`;
      }).join("")}
    </div>

    <div class="section-heading">3. Add Student Subjects</div>
    ${state.availableSubjects.map((subj) => {
      const isSelected = ui.selectedSubjects.some((s) => s.id === subj.id);
      const isExpanded = ui.expandedSubjectId === subj.id;
      const subjInstructors = state.instructorsList.filter((inst) => inst.subjects?.includes(subj.code));
      return `<div style="margin-bottom:6px">
        <div class="doc-check-row" style="justify-content:space-between">
          <button class="check-toggle" onclick="toggleRegistrarSubject(${jsAttr(subj.id)})">
            <span class="check-icon accent">${isSelected ? ICON.checksquare : ICON.square}</span>
            <span style="font-size:12px;color:var(--ink)">${esc(subj.code)} - ${esc(subj.title)} (${subj.units} Units)</span>
          </button>
          <button class="show-instructors-btn" onclick="toggleExpandSubject(${jsAttr(subj.id)})">${isExpanded ? "Hide" : "Show"} Instructors</button>
        </div>
        ${isExpanded ? `
        <div class="instructor-list-box">
          ${subjInstructors.length ? subjInstructors.map((inst) => {
            const subjData = ui.selectedSubjects.find((s) => s.id === subj.id);
            const isThisSelected = subjData?.instructor === inst.name;
            return `<div class="prof-option ${isThisSelected ? "selected" : ""}" onclick="assignSubjectInstructor(${jsAttr(subj.id)}, ${jsAttr(inst.name)})">
              <span style="color:${isThisSelected ? "var(--success)" : "var(--muted)"}">${isThisSelected ? ICON.checkcircle : ICON.circle}</span>
              <span style="font-size:12px;color:var(--ink);font-weight:${isThisSelected ? 700 : 400}">${esc(inst.name)}</span>
            </div>`;
          }).join("") : `<span style="font-size:11px;color:var(--muted);padding:6px 0;display:block">No instructor assigned to teach ${esc(subj.code)} yet.</span>`}
        </div>` : ""}
      </div>`;
    }).join("")}

    <div class="section-heading">4. Set Schedule &amp; Laboratory (${ui.selectedSubjects.length} Subject${ui.selectedSubjects.length !== 1 ? "s" : ""} Selected)</div>
    ${ui.selectedSubjects.length ? ui.selectedSubjects.map((subj) => `
      <div class="subject-schedule-card">
        <div class="ss-title">${esc(subj.code)} - ${esc(subj.title)}</div>
        <div class="ss-instructor">Instructor: ${esc(subj.instructor || "Not yet assigned")}</div>
        <input class="modal-input" placeholder="e.g., TTH 9:00 AM - 11:00 AM" value="${esc(subj.schedule || "")}" oninput="setSubjectSchedule(${jsAttr(subj.id)}, this.value)"/>
        <div class="ss-label">LABORATORY / ROOM</div>
        <div class="chip-row">
          ${state.roomOptions.map((rm) => `<div class="chip ${subj.roomLab === rm ? "active" : ""}" onclick="setSubjectRoom(${jsAttr(subj.id)}, ${jsAttr(rm)})">${esc(rm)}</div>`).join("")}
        </div>
      </div>`).join("") : `<p style="font-size:12px;color:var(--muted);margin-bottom:10px">Select subjects above to set their schedule and laboratory.</p>`}
    `;
  }

  return `
  <div class="modal-overlay">
    <div class="modal-sheet" style="max-width:640px">
      <div class="modal-header">
        <div class="modal-title">${esc(student.name)}</div>
        <button class="modal-close" onclick="closeRegistrarStudentModal()">${ICON.close}</button>
      </div>
      <div class="modal-body">
        <div class="section-heading" style="margin-top:0">1. Review &amp; Verify Documents</div>
        ${docsHtml}
        ${gradesHtml}
        ${assignmentSection}
        <button class="btn btn-accent btn-block-mt ${!complete ? "disabled" : ""}" ${!complete ? "disabled" : ""} onclick="saveRegistrarSubjects()"><span>${ICON.plus}</span>Save Section, Subjects &amp; Schedule</button>
        <button class="btn btn-primary btn-block-mt ${!complete ? "disabled" : ""}" ${!complete ? "disabled" : ""} onclick="approveRegistrarEnrollment()">Approve &amp; Mark Enrolled</button>
      </div>
    </div>
  </div>`;
}

function toggleRegistrarDoc(idx) {
  const student = state.students.find((s) => s.id === state.ui.registrar.selectedStudentId);
  const updatedDocs = [...student.docs];
  updatedDocs[idx] = { ...updatedDocs[idx], status: updatedDocs[idx].status === "Verified" ? "Pending" : "Verified" };
  const newNotif = { id: uid(), title: "Document Requirement Updated", message: `Your document '${updatedDocs[idx].name}' status set to ${updatedDocs[idx].status}.`, date: "Just now", read: false };
  updateStudent({ ...student, docs: updatedDocs, notifications: [newNotif, ...(student.notifications || [])] });
  render();
}
function openRegistrarDocPreview(idx) { state.ui.registrar.previewDocIndex = idx; render(); }

function setRegistrarSection(name) { state.ui.registrar.assignedSection = name; render(); }
function toggleRegistrarSubject(subjId) {
  const subj = state.availableSubjects.find((s) => s.id === subjId);
  const exists = state.ui.registrar.selectedSubjects.some((s) => s.id === subjId);
  if (exists) {
    state.ui.registrar.selectedSubjects = state.ui.registrar.selectedSubjects.filter((s) => s.id !== subjId);
  } else {
    state.ui.registrar.selectedSubjects = [...state.ui.registrar.selectedSubjects, { ...subj, instructor: "", schedule: "", roomLab: "" }];
  }
  render();
}
function toggleExpandSubject(subjId) {
  state.ui.registrar.expandedSubjectId = state.ui.registrar.expandedSubjectId === subjId ? null : subjId;
  render();
}
function assignSubjectInstructor(subjId, instName) {
  const exists = state.ui.registrar.selectedSubjects.some((s) => s.id === subjId);
  if (!exists) {
    const subj = state.availableSubjects.find((s) => s.id === subjId);
    state.ui.registrar.selectedSubjects = [...state.ui.registrar.selectedSubjects, { ...subj, instructor: instName, schedule: "", roomLab: "" }];
  } else {
    state.ui.registrar.selectedSubjects = state.ui.registrar.selectedSubjects.map((s) => (s.id === subjId ? { ...s, instructor: instName } : s));
  }
  render();
}
function setSubjectSchedule(subjId, value) {
  state.ui.registrar.selectedSubjects = state.ui.registrar.selectedSubjects.map((s) => (s.id === subjId ? { ...s, schedule: value } : s));
  /* no full render needed to preserve focus; value already reflects in DOM */
}
function setSubjectRoom(subjId, roomName) {
  state.ui.registrar.selectedSubjects = state.ui.registrar.selectedSubjects.map((s) => (s.id === subjId ? { ...s, roomLab: roomName } : s));
  render();
}

function saveRegistrarSubjects() {
  const ui = state.ui.registrar;
  const student = state.students.find((s) => s.id === ui.selectedStudentId);
  if (!allRequirementsSubmitted(student)) { appAlert("Requirements Incomplete", "The student must submit all required documents before Section, Subjects, Instructor, Schedule, and Room assignment can be opened."); return; }
  if (ui.selectedSubjects.length === 0) { appAlert("No Subjects Selected", "Please select at least one subject to add."); return; }
  if (!ui.assignedSection) { appAlert("Missing Section", "Please assign a Section to the student."); return; }

  const notif = { id: uid(), title: "Subjects & Section Updated", message: `Your section is set to ${ui.assignedSection}. Updated enrolled subjects count: ${ui.selectedSubjects.length}.`, date: "Just now", read: false };
  const updated = { ...student, section: ui.assignedSection, subjects: ui.selectedSubjects, notifications: [notif, ...(student.notifications || [])] };
  updateStudent(updated);
  appAlert("Saved Successfully", `Updated section and subjects for ${updated.name}.`, () => render());
}

function approveRegistrarEnrollment() {
  const ui = state.ui.registrar;
  const student = state.students.find((s) => s.id === ui.selectedStudentId);
  if (!allRequirementsSubmitted(student)) { appAlert("Requirements Incomplete", "Complete all required document submissions before approving enrollment."); return; }
  if (!ui.assignedSection) { appAlert("Missing Section", "Please select a Section for this student."); return; }
  if (ui.selectedSubjects.length === 0) { appAlert("Missing Subjects", "Please select at least one subject."); return; }

  const incomplete = ui.selectedSubjects.filter((s) => !s.instructor || !s.schedule?.trim() || !s.roomLab);
  if (incomplete.length > 0) { appAlert("Incomplete Assignment", `Please assign Instructor, Schedule, and Room for: ${incomplete.map((s) => s.code).join(", ")}.`); return; }

  const notif = { id: uid(), title: "Officially Enrolled!", message: `Enrolled in Section: ${ui.assignedSection} with ${ui.selectedSubjects.length} subject(s) fully scheduled.`, date: "Just now", read: false };
  const updated = { ...student, section: ui.assignedSection, subjects: ui.selectedSubjects, status: "Enrolled", notifications: [notif, ...(student.notifications || [])] };
  updateStudent(updated);
  appAlert("Student Enrolled", `${updated.name} is now officially ENROLLED under Section ${ui.assignedSection}!`, () => { closeRegistrarStudentModal(); });
}

/* ---------------- Registrar Add-Data Modals ---------------- */
function closeAllRegistrarModals() {
  Object.assign(state.ui.registrar, {
    isAddSubjModalOpen: false, isAddRoomModalOpen: false, isAddSectionModalOpen: false,
    isAddCourseModalOpen: false, isAddMajorModalOpen: false, isAnnouncementModalOpen: false,
  });
  render();
}

function addSectionModal() {
  return `
  <div class="modal-overlay center"><div class="modal-card">
    <h3 class="modal-title" style="margin-bottom:12px">Create New Section / Block</h3>
    <input class="modal-input" placeholder="Section Name (e.g. BSIT 1-C)" value="${esc(getDraft("newSectionName"))}" oninput="setDraft('newSectionName', this.value)"/>
    <input class="modal-input" placeholder="Max Students Limit (e.g. 30, 35, 40)" type="number" value="${esc(getDraft("newSectionCap", "30"))}" oninput="setDraft('newSectionCap', this.value)"/>
    <button class="btn btn-accent" onclick="submitAddSection()">Save New Section</button>
    <button class="btn btn-ghost" onclick="closeAllRegistrarModals()">Cancel</button>
  </div></div>`;
}
function submitAddSection() {
  const name = getDraft("newSectionName", "").trim();
  if (!name) { appAlert("Missing Input", "Please enter a Section name (e.g. BSIT 1-A)."); return; }
  const cap = parseInt(getDraft("newSectionCap", "30")) || 30;
  const newSec = { id: "SEC-" + Date.now().toString().slice(-4), name, maxCapacity: cap };
  addSectionGlobal(newSec);
  clearDrafts("newSection");
  state.ui.registrar.isAddSectionModalOpen = false;
  appAlert("Section Added", `Section '${newSec.name}' with limit of ${newSec.maxCapacity} students created.`, () => render());
}

function addSubjectModal() {
  return `
  <div class="modal-overlay center"><div class="modal-card">
    <h3 class="modal-title" style="margin-bottom:12px">Add New Subject</h3>
    <input class="modal-input" placeholder="Subject Code (e.g. CC 106)" value="${esc(getDraft("newSubjCode"))}" oninput="setDraft('newSubjCode', this.value)"/>
    <input class="modal-input" placeholder="Subject Title (e.g. Mobile Development)" value="${esc(getDraft("newSubjTitle"))}" oninput="setDraft('newSubjTitle', this.value)"/>
    <input class="modal-input" type="number" placeholder="Units (e.g. 3)" value="${esc(getDraft("newSubjUnits", "3"))}" oninput="setDraft('newSubjUnits', this.value)"/>
    <button class="btn btn-accent" onclick="submitAddSubject()">Save New Subject</button>
    <button class="btn btn-ghost" onclick="closeAllRegistrarModals()">Cancel</button>
  </div></div>`;
}
function submitAddSubject() {
  const code = getDraft("newSubjCode", "").trim();
  const title = getDraft("newSubjTitle", "").trim();
  if (!code || !title) { appAlert("Missing Input", "Please provide Subject Code and Subject Title."); return; }
  const newSubject = { id: "SUBJ-" + Date.now().toString().slice(-4), code, title, units: parseInt(getDraft("newSubjUnits", "3")) || 3 };
  addSubjectGlobal(newSubject);
  clearDrafts("newSubj");
  state.ui.registrar.isAddSubjModalOpen = false;
  appAlert("Subject Added", `Subject '${newSubject.code}' is now available.`, () => render());
}

function addRoomModal() {
  return `
  <div class="modal-overlay center"><div class="modal-card">
    <h3 class="modal-title" style="margin-bottom:12px">Add New Room / Laboratory</h3>
    <input class="modal-input" placeholder="Room Name (e.g. Network Lab 103)" value="${esc(getDraft("newRoomName"))}" oninput="setDraft('newRoomName', this.value)"/>
    <button class="btn btn-primary" onclick="submitAddRoom()">Save New Room</button>
    <button class="btn btn-ghost" onclick="closeAllRegistrarModals()">Cancel</button>
  </div></div>`;
}
function submitAddRoom() {
  const name = getDraft("newRoomName", "").trim();
  if (!name) { appAlert("Missing Input", "Please enter a Room/Laboratory name."); return; }
  addRoomGlobal(name);
  clearDrafts("newRoom");
  state.ui.registrar.isAddRoomModalOpen = false;
  appAlert("Room Added", `Room '${name}' added successfully.`, () => render());
}

function addCourseModal() {
  return `
  <div class="modal-overlay center"><div class="modal-card">
    <h3 class="modal-title" style="margin-bottom:4px">Add New Course Program</h3>
    <p class="muted-note" style="display:block;margin-bottom:12px">This will immediately appear under "Course Program" on the Student Registration screen.</p>
    <input class="modal-input" placeholder="e.g. BSCS - Computer Science" value="${esc(getDraft("newCourseName"))}" oninput="setDraft('newCourseName', this.value)"/>
    <button class="btn btn-accent" onclick="submitAddCourse()"><span>${ICON.bookopen}</span>Save New Course</button>
    <button class="btn btn-ghost" onclick="closeAllRegistrarModals()">Cancel</button>
  </div></div>`;
}
function submitAddCourse() {
  const name = getDraft("newCourseName", "").trim();
  if (!name) { appAlert("Missing Input", "Please enter a Course Program name (e.g. BSCS - Computer Science)."); return; }
  if (state.courseOptions.some((c) => c.toLowerCase() === name.toLowerCase())) { appAlert("Course Already Exists", "This Course Program is already in the list."); return; }
  addCourseGlobal(name);
  clearDrafts("newCourse");
  state.ui.registrar.isAddCourseModalOpen = false;
  appAlert("Course Added", `'${name}' is now available under Course Program in Student Registration.`, () => render());
}

function openAddMajorModal() {
  setDraft("majorTargetCourse", state.courseOptions[0] || "");
  state.ui.registrar.isAddMajorModalOpen = true;
  render();
}
function addMajorModal() {
  const target = getDraft("majorTargetCourse", state.courseOptions[0] || "");
  return `
  <div class="modal-overlay center"><div class="modal-card">
    <h3 class="modal-title" style="margin-bottom:4px">Add Major / Specialization</h3>
    <p class="muted-note" style="display:block;margin-bottom:12px">This will immediately appear under "Major / Specialization" on the Student Registration screen once its Course Program is selected.</p>
    <div style="font-size:10px;font-weight:700;color:var(--muted);margin-bottom:6px">SELECT COURSE PROGRAM</div>
    <div class="chip-row" style="margin-bottom:10px">
      ${state.courseOptions.map((c) => `<div class="chip ${target === c ? "active" : ""}" onclick="setDraft('majorTargetCourse', ${jsAttr(c)}); render();">${esc(c)}</div>`).join("")}
    </div>
    <input class="modal-input" placeholder="e.g. Data Science" value="${esc(getDraft("newMajorName"))}" oninput="setDraft('newMajorName', this.value)"/>
    <button class="btn btn-primary" onclick="submitAddMajor()"><span>${ICON.layers}</span>Save New Major/Specialization</button>
    <button class="btn btn-ghost" onclick="closeAllRegistrarModals()">Cancel</button>
  </div></div>`;
}
function submitAddMajor() {
  const target = getDraft("majorTargetCourse", state.courseOptions[0] || "");
  const name = getDraft("newMajorName", "").trim();
  if (!target) { appAlert("Missing Course", "Please select which Course Program this major belongs to."); return; }
  if (!name) { appAlert("Missing Input", "Please enter a Major / Specialization name."); return; }
  const existing = state.courseMajors[target] || [];
  if (existing.some((m) => m.toLowerCase() === name.toLowerCase())) { appAlert("Major Already Exists", "This Major / Specialization is already listed under that course."); return; }
  addMajorGlobal(target, name);
  clearDrafts("newMajor");
  clearDrafts("majorTargetCourse");
  state.ui.registrar.isAddMajorModalOpen = false;
  appAlert("Major/Specialization Added", `'${name}' was added under ${target}.`, () => render());
}

function announcementModal() {
  const target = getDraft("announcementTarget", "students");
  const opts = [{ key: "students", label: "Students" }, { key: "instructor", label: "Instructor" }, { key: "both", label: "Both Student and Instructor" }];
  return `
  <div class="modal-overlay center"><div class="modal-card">
    <h3 class="modal-title" style="margin-bottom:12px">Send Announcement</h3>
    <input class="modal-input" placeholder="Announcement Title" value="${esc(getDraft("announcementTitle"))}" oninput="setDraft('announcementTitle', this.value)"/>
    <textarea class="modal-input" style="height:90px;resize:vertical" placeholder="Write your announcement message here..." oninput="setDraft('announcementMessage', this.value)">${esc(getDraft("announcementMessage"))}</textarea>
    <div style="font-size:10px;font-weight:700;color:var(--muted);margin-bottom:6px">SEND TO</div>
    <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px">
      ${opts.map((opt) => `<div class="prof-option ${target === opt.key ? "selected" : ""}" onclick="setDraft('announcementTarget', ${jsAttr(opt.key)}); render();">
        <span style="color:${target === opt.key ? "var(--success)" : "var(--muted)"}">${target === opt.key ? ICON.checkcircle : ICON.circle}</span>
        <span style="font-size:13px;color:var(--ink);font-weight:${target === opt.key ? 700 : 400}">${opt.label}</span>
      </div>`).join("")}
    </div>
    <button class="btn btn-accent" onclick="submitAnnouncement()"><span>${ICON.send}</span>Send Announcement</button>
    <button class="btn btn-ghost" onclick="closeAllRegistrarModals()">Cancel</button>
  </div></div>`;
}
function submitAnnouncement() {
  const title = getDraft("announcementTitle", "").trim();
  const message = getDraft("announcementMessage", "").trim();
  const target = getDraft("announcementTarget", "students");
  if (!title || !message) { appAlert("Missing Fields", "Please provide both a title and a message for the announcement."); return; }

  const notif = { id: uid(), title, message, date: "Just now", read: false };
  let recipientCount = 0;
  if (target === "students" || target === "both") {
    state.students = state.students.map((st) => ({ ...st, notifications: [{ ...notif }, ...(st.notifications || [])] }));
    recipientCount += state.students.length;
  }
  if (target === "instructor" || target === "both") {
    state.instructorsList = state.instructorsList.map((inst) => ({ ...inst, notifications: [{ ...notif }, ...(inst.notifications || [])] }));
    recipientCount += state.instructorsList.length;
  }
  const targetLabel = target === "students" ? "all Students" : target === "instructor" ? "all Instructors" : "all Students and Instructors";
  clearDrafts("announcement");
  state.ui.registrar.isAnnouncementModalOpen = false;
  appAlert("Announcement Sent", `Your announcement was sent to ${targetLabel}.`, () => render());
}