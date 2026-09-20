/* =====================================================
   ENROLLMENT PORTAL
   HTML + CSS + JAVASCRIPT
   NO DATABASE
   Uses localStorage
===================================================== */


/* ================= DATA ================= */

const defaultUsers = [
    {
        id: "STU-0001",
        name: "Juan Dela Cruz",
        username: "student",
        password: "123456",
        role: "student",
        program: "BS Information Technology",
        year: "1st Year",

        email: "",
        contact: "",
        birth: "",
        gender: "",
        address: ""
    },

    {
        id: "INS-0001",
        name: "Maria Santos",
        username: "instructor",
        password: "123456",
        role: "instructor"
    },

    {
        id: "REG-0001",
        name: "Registrar Admin",
        username: "registrar",
        password: "123456",
        role: "registrar"
    }
];


const subjects = [
    {
        code: "IT101",
        name: "Introduction to Computing",
        units: 3,
        schedule: "Monday 8:00 AM - 10:00 AM",
        room: "Room 201"
    },

    {
        code: "IT102",
        name: "Computer Programming 1",
        units: 3,
        schedule: "Tuesday 9:00 AM - 11:00 AM",
        room: "Room 202"
    },

    {
        code: "MATH101",
        name: "College Mathematics",
        units: 3,
        schedule: "Wednesday 8:00 AM - 10:00 AM",
        room: "Room 203"
    },

    {
        code: "ENG101",
        name: "Communication Skills",
        units: 3,
        schedule: "Thursday 10:00 AM - 12:00 PM",
        room: "Room 204"
    },

    {
        code: "PE101",
        name: "Physical Education",
        units: 2,
        schedule: "Friday 1:00 PM - 3:00 PM",
        room: "Gymnasium"
    }
];


/* ================= STORAGE ================= */

function getUsers() {

    const saved =
        localStorage.getItem("enrollment_users");

    if (!saved) {

        localStorage.setItem(
            "enrollment_users",
            JSON.stringify(defaultUsers)
        );

        return defaultUsers;
    }

    return JSON.parse(saved);
}


function saveUsers(users) {

    localStorage.setItem(
        "enrollment_users",
        JSON.stringify(users)
    );
}


function getEnrollments() {

    return JSON.parse(
        localStorage.getItem("enrollment_records") || "[]"
    );
}


function saveEnrollments(records) {

    localStorage.setItem(
        "enrollment_records",
        JSON.stringify(records)
    );
}


function getDocuments() {

    return JSON.parse(
        localStorage.getItem("enrollment_documents") || "[]"
    );
}


function saveDocuments(documents) {

    localStorage.setItem(
        "enrollment_documents",
        JSON.stringify(documents)
    );
}


/* ================= CURRENT USER ================= */

let currentUser = null;


function saveCurrentUser() {

    localStorage.setItem(
        "current_user",
        JSON.stringify(currentUser)
    );
}


function loadCurrentUser() {

    const saved =
        localStorage.getItem("current_user");

    if (saved) {

        currentUser =
            JSON.parse(saved);

        openApplication();

    }

}


/* ================= INITIALIZATION ================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        getUsers();

        loadCurrentUser();

        setupForms();

        updateSubjectCounter();

    }
);


/* ================= LOGIN / REGISTER ================= */

function showRegister() {

    document
        .getElementById("loginPage")
        .classList.add("hidden");

    document
        .getElementById("registerPage")
        .classList.remove("hidden");

}


function showLogin() {

    document
        .getElementById("registerPage")
        .classList.add("hidden");

    document
        .getElementById("loginPage")
        .classList.remove("hidden");

}


function setupForms() {

    document
        .getElementById("loginForm")
        .addEventListener(
            "submit",
            login
        );


    document
        .getElementById("registerForm")
        .addEventListener(
            "submit",
            register
        );


    document
        .getElementById("profileForm")
        .addEventListener(
            "submit",
            saveProfile
        );


    document
        .querySelectorAll(
            ".subject-option input"
        )
        .forEach(
            checkbox => {

                checkbox.addEventListener(
                    "change",
                    updateSubjectCounter
                );

            }
        );

}


/* ================= LOGIN ================= */

function login(event) {

    event.preventDefault();

    const username =
        document
            .getElementById("loginUsername")
            .value
            .trim();

    const password =
        document
            .getElementById("loginPassword")
            .value;


    const users = getUsers();


    const user =
        users.find(
            u =>
                u.username === username &&
                u.password === password
        );


    if (!user) {

        showToast(
            "Invalid username or password."
        );

        return;

    }


    currentUser = user;

    saveCurrentUser();

    openApplication();

    showToast(
        "Login successful!"
    );

}


/* ================= REGISTER ================= */

function register(event) {

    event.preventDefault();


    const name =
        document
            .getElementById("regName")
            .value
            .trim();

    const username =
        document
            .getElementById("regUsername")
            .value
            .trim();

    const password =
        document
            .getElementById("regPassword")
            .value;

    const program =
        document
            .getElementById("regProgram")
            .value;

    const year =
        document
            .getElementById("regYear")
            .value;


    const users = getUsers();


    const exists =
        users.some(
            user =>
                user.username.toLowerCase() ===
                username.toLowerCase()
        );


    if (exists) {

        showToast(
            "Username already exists."
        );

        return;

    }


    const newUser = {

        id:
            "STU-" +
            String(users.length + 1)
                .padStart(4, "0"),

        name,
        username,
        password,

        role: "student",

        program,
        year,

        email: "",
        contact: "",
        birth: "",
        gender: "",
        address: ""

    };


    users.push(newUser);

    saveUsers(users);


    showToast(
        "Account created successfully!"
    );


    document
        .getElementById("registerForm")
        .reset();


    setTimeout(
        showLogin,
        800
    );

}


/* ================= OPEN APPLICATION ================= */

function openApplication() {

    document
        .getElementById("loginPage")
        .classList.add("hidden");

    document
        .getElementById("registerPage")
        .classList.add("hidden");

    document
        .getElementById("app")
        .classList.remove("hidden");


    updateHeader();

    configureNavigation();

    showDefaultDashboard();

}


/* ================= HEADER ================= */

function updateHeader() {

    if (!currentUser) return;


    document
        .getElementById("headerName")
        .textContent =
        currentUser.name;


    document
        .getElementById("headerRole")
        .textContent =
        capitalize(currentUser.role);


    document
        .getElementById("headerAvatar")
        .textContent =
        currentUser.name
            .charAt(0)
            .toUpperCase();


    if (currentUser.role === "student") {

        document
            .getElementById("welcomeName")
            .textContent =
            currentUser.name;

    }

}


/* ================= NAVIGATION ================= */

function configureNavigation() {

    document
        .getElementById("studentNav")
        .classList.add("hidden");

    document
        .getElementById("instructorNav")
        .classList.add("hidden");

    document
        .getElementById("registrarNav")
        .classList.add("hidden");


    if (currentUser.role === "student") {

        document
            .getElementById("studentNav")
            .classList.remove("hidden");

    }


    if (currentUser.role === "instructor") {

        document
            .getElementById("instructorNav")
            .classList.remove("hidden");

    }


    if (currentUser.role === "registrar") {

        document
            .getElementById("registrarNav")
            .classList.remove("hidden");

    }

}


/* ================= DEFAULT DASHBOARD ================= */

function showDefaultDashboard() {

    if (currentUser.role === "student") {

        showPage(
            "studentDashboard"
        );

        updateStudentDashboard();

    }


    if (currentUser.role === "instructor") {

        showPage(
            "instructorDashboard"
        );

        updateInstructorDashboard();

    }


    if (currentUser.role === "registrar") {

        showPage(
            "registrarDashboard"
        );

        updateRegistrarDashboard();

    }

}


/* ================= SHOW PAGE ================= */

function showPage(pageId) {

    document
        .querySelectorAll(".page")
        .forEach(
            page =>
                page.classList.add("hidden")
        );


    const page =
        document.getElementById(pageId);


    if (!page) return;


    page.classList.remove("hidden");


    const titles = {

        studentDashboard: "Dashboard",
        profile: "My Profile",
        enrollment: "Enrollment",
        subjects: "Subjects",
        schedule: "My Schedule",
        documents: "Documents",
        notifications: "Notifications",

        instructorDashboard:
            "Instructor Dashboard",

        instructorProfile:
            "Instructor Profile",

        classList:
            "Class List",

        instructorSchedule:
            "Instructor Schedule",

        attendance:
            "Attendance",

        grades:
            "Grades",

        registrarDashboard:
            "Registrar Dashboard",

        students:
            "Students",

        enrollmentManagement:
            "Enrollment Management",

        programs:
            "Programs",

        subjectManagement:
            "Subject Management",

        scheduleManagement:
            "Schedule Management",

        documentManagement:
            "Document Management",

        reports:
            "Reports"

    };


    document
        .getElementById("pageTitle")
        .textContent =
        titles[pageId] || "Dashboard";


    document
        .querySelectorAll(".nav-item")
        .forEach(
            button =>
                button.classList.remove("active")
        );


    eventNavUpdate(pageId);


    if (pageId === "profile") {

        loadProfile();

    }


    if (pageId === "schedule") {

        renderSchedule();

    }


    if (pageId === "documents") {

        renderDocuments();

    }


    if (pageId === "notifications") {

        renderNotifications();

    }


    if (pageId === "students") {

        renderStudents();

    }


    if (pageId === "enrollmentManagement") {

        renderEnrollments();

    }


    if (pageId === "documentManagement") {

        renderAllDocuments();

    }


    if (pageId === "classList") {

        renderClassList();

    }


    if (pageId === "registrarDashboard") {

        updateRegistrarDashboard();

    }


    if (pageId === "reports") {

        updateReports();

    }

}


function eventNavUpdate(pageId) {

    document
        .querySelectorAll(".nav-item")
        .forEach(
            button => {

                const text =
                    button.textContent
                        .toLowerCase();

                if (
                    text.includes(
                        pageId
                            .replace(
                                /([A-Z])/g,
                                " $1"
                            )
                            .toLowerCase()
                    )
                ) {

                    button.classList.add("active");

                }

            }
        );

}


/* ================= STUDENT PROFILE ================= */

function loadProfile() {

    document
        .getElementById("profileName")
        .value =
        currentUser.name || "";


    document
        .getElementById("profileStudentId")
        .value =
        currentUser.id || "";


    document
        .getElementById("profileEmail")
        .value =
        currentUser.email || "";


    document
        .getElementById("profileContact")
        .value =
        currentUser.contact || "";


    document
        .getElementById("profileBirth")
        .value =
        currentUser.birth || "";


    document
        .getElementById("profileGender")
        .value =
        currentUser.gender || "";


    document
        .getElementById("profileAddress")
        .value =
        currentUser.address || "";

}


function saveProfile(event) {

    event.preventDefault();


    currentUser.name =
        document
            .getElementById("profileName")
            .value
            .trim();


    currentUser.email =
        document
            .getElementById("profileEmail")
            .value
            .trim();


    currentUser.contact =
        document
            .getElementById("profileContact")
            .value
            .trim();


    currentUser.birth =
        document
            .getElementById("profileBirth")
            .value;


    currentUser.gender =
        document
            .getElementById("profileGender")
            .value;


    currentUser.address =
        document
            .getElementById("profileAddress")
            .value
            .trim();


    const users = getUsers();


    const index =
        users.findIndex(
            u =>
                u.username ===
                currentUser.username
        );


    if (index !== -1) {

        users[index] =
            currentUser;

        saveUsers(users);

    }


    saveCurrentUser();

    updateHeader();


    showToast(
        "Profile updated successfully!"
    );

}


/* ================= ENROLLMENT ================= */

function updateSubjectCounter() {

    const selected =
        document.querySelectorAll(
            ".subject-option input:checked"
        );


    let units = 0;


    selected.forEach(
        checkbox => {

            units +=
                Number(
                    checkbox.dataset.units
                );

        }
    );


    document
        .getElementById("selectedSubjectCount")
        .textContent =
        selected.length;


    document
        .getElementById("totalUnits")
        .textContent =
        units;

}


function submitEnrollment() {

    const program =
        document
            .getElementById("enrollProgram")
            .value;

    const year =
        document
            .getElementById("enrollYear")
            .value;

    const academicYear =
        document
            .getElementById("academicYear")
            .value;

    const semester =
        document
            .getElementById("semester")
            .value;


    const selected =
        Array.from(
            document.querySelectorAll(
                ".subject-option input:checked"
            )
        );


    if (!program) {

        showToast(
            "Please select your program."
        );

        return;

    }


    if (!year) {

        showToast(
            "Please select your year level."
        );

        return;

    }


    if (selected.length === 0) {

        showToast(
            "Please select at least one subject."
        );

        return;

    }


    const enrollment = {

        id:
            "ENR-" +
            Date.now(),

        studentId:
            currentUser.id,

        studentName:
            currentUser.name,

        program,

        year,

        academicYear,

        semester,

        subjects:
            selected.map(
                checkbox => {

                    return {

                        code:
                            checkbox.value,

                        name:
                            checkbox.dataset.name,

                        units:
                            Number(
                                checkbox.dataset.units
                            )

                    };

                }
            ),

        date:
            new Date()
                .toLocaleString()

    };


    const enrollments =
        getEnrollments();


    enrollments.push(
        enrollment
    );


    saveEnrollments(
        enrollments
    );


    showToast(
        "Enrollment submitted successfully!"
    );


    renderSchedule();

    updateStudentDashboard();

}


/* ================= SCHEDULE ================= */

function renderSchedule() {

    const container =
        document.getElementById(
            "scheduleContainer"
        );


    const enrollments =
        getEnrollments()
            .filter(
                enrollment =>
                    enrollment.studentId ===
                    currentUser.id
            );


    if (enrollments.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                🗓

                <h3>No schedule yet</h3>

                <p>
                    Select subjects from the enrollment page.
                </p>

            </div>

        `;

        return;

    }


    const latest =
        enrollments[
            enrollments.length - 1
        ];


    container.innerHTML = `

        <div class="schedule-grid">

            ${latest.subjects.map(
                subject => {

                    const info =
                        subjects.find(
                            s =>
                                s.code ===
                                subject.code
                        );

                    return `

                        <div class="schedule-item">

                            <strong>
                                ${subject.code} -
                                ${subject.name}
                            </strong>

                            <span>
                                ${info
                                    ? info.schedule
                                    : "Schedule TBD"}
                            </span>

                            <small>
                                ${info
                                    ? info.room
                                    : "Room TBD"}
                                • ${subject.units} Units
                            </small>

                        </div>

                    `;

                }
            ).join("")}

        </div>

    `;

}


/* ================= DOCUMENTS ================= */

function uploadDocument() {

    const input =
        document.getElementById(
            "documentInput"
        );


    if (!input.files.length) {

        showToast(
            "Please select a document."
        );

        return;

    }


    const file =
        input.files[0];


    const documents =
        getDocuments();


    documents.push({

        id:
            "DOC-" +
            Date.now(),

        studentId:
            currentUser.id,

        studentName:
            currentUser.name,

        fileName:
            file.name,

        fileType:
            file.type,

        date:
            new Date()
                .toLocaleString()

    });


    saveDocuments(
        documents
    );


    input.value = "";


    renderDocuments();


    showToast(
        "Document uploaded."
    );

}


function renderDocuments() {

    const container =
        document.getElementById(
            "documentList"
        );


    const documents =
        getDocuments()
            .filter(
                doc =>
                    doc.studentId ===
                    currentUser.id
            );


    if (documents.length === 0) {

        container.innerHTML = `

            <div class="empty-state">
                📁
                <h3>No documents</h3>
                <p>
                    Uploaded documents will appear here.
                </p>
            </div>

        `;

        return;

    }


    container.innerHTML =
        documents
            .map(
                doc => `

                    <div class="document-item">

                        <div>

                            <strong>
                                📄 ${escapeHTML(
                                    doc.fileName
                                )}
                            </strong>

                            <small>
                                Uploaded:
                                ${doc.date}
                            </small>

                        </div>

                        <span>
                            Uploaded
                        </span>

                    </div>

                `
            )
            .join("");

}


/* ================= NOTIFICATIONS ================= */

function renderNotifications() {

    const container =
        document.getElementById(
            "notificationList"
        );


    const notifications = [

        {
            title:
                "Enrollment Portal",

            message:
                "Enrollment portal is ready for use.",

            date:
                "Today"
        },

        {
            title:
                "Reminder",

            message:
                "Make sure your student information is complete.",

            date:
                "Today"
        },

        {
            title:
                "Documents",

            message:
                "Upload the required enrollment documents.",

            date:
                "Today"
        }

    ];


    container.innerHTML =
        notifications
            .map(
                item => `

                    <div class="content-card">

                        <h3>
                            🔔 ${item.title}
                        </h3>

                        <p>
                            ${item.message}
                        </p>

                        <small>
                            ${item.date}
                        </small>

                    </div>

                `
            )
            .join("");

}


/* ================= STUDENT DASHBOARD ================= */

function updateStudentDashboard() {

    const enrollments =
        getEnrollments()
            .filter(
                e =>
                    e.studentId ===
                    currentUser.id
            );


    let subjectCount = 0;


    enrollments.forEach(
        enrollment => {

            subjectCount +=
                enrollment.subjects.length;

        }
    );


    const documents =
        getDocuments()
            .filter(
                d =>
                    d.studentId ===
                    currentUser.id
            );


    document
        .getElementById(
            "studentSubjectCount"
        )
        .textContent =
        subjectCount;


    document
        .getElementById(
            "studentScheduleCount"
        )
        .textContent =
        subjectCount;


    document
        .getElementById(
            "studentDocumentCount"
        )
        .textContent =
        documents.length;

}


/* ================= REGISTRAR ================= */

function updateRegistrarDashboard() {

    const users =
        getUsers()
            .filter(
                user =>
                    user.role ===
                    "student"
            );


    const enrollments =
        getEnrollments();


    document
        .getElementById(
            "totalStudents"
        )
        .textContent =
        users.length;


    document
        .getElementById(
            "totalEnrollments"
        )
        .textContent =
        enrollments.length;

}


function renderStudents() {

    const body =
        document.getElementById(
            "studentsTableBody"
        );


    const users =
        getUsers()
            .filter(
                user =>
                    user.role ===
                    "student"
            );


    if (users.length === 0) {

        body.innerHTML = `

            <tr>
                <td colspan="5">
                    No students found.
                </td>
            </tr>

        `;

        return;

    }


    body.innerHTML =
        users
            .map(
                student => `

                    <tr>

                        <td>
                            ${student.id}
                        </td>

                        <td>
                            ${escapeHTML(
                                student.name
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                student.username
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                student.program ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                student.year ||
                                "-"
                            )}
                        </td>

                    </tr>

                `
            )
            .join("");

}


function renderEnrollments() {

    const body =
        document.getElementById(
            "enrollmentTableBody"
        );


    const enrollments =
        getEnrollments();


    if (enrollments.length === 0) {

        body.innerHTML = `

            <tr>

                <td colspan="6">
                    No enrollment records found.
                </td>

            </tr>

        `;

        return;

    }


    body.innerHTML =
        enrollments
            .map(
                enrollment => `

                    <tr>

                        <td>
                            ${escapeHTML(
                                enrollment.studentName
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                enrollment.program
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                enrollment.year
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                enrollment.semester
                            )}
                        </td>

                        <td>
                            ${enrollment.subjects.length}
                            subjects
                        </td>

                        <td>
                            ${enrollment.date}
                        </td>

                    </tr>

                `
            )
            .join("");

}


/* ================= DOCUMENT MANAGEMENT ================= */

function renderAllDocuments() {

    const container =
        document.getElementById(
            "allDocuments"
        );


    const documents =
        getDocuments();


    if (documents.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                📁

                <h3>No documents uploaded</h3>

                <p>
                    Student documents will appear here.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        documents
            .map(
                doc => `

                    <div class="document-item">

                        <div>

                            <strong>
                                📄
                                ${escapeHTML(
                                    doc.fileName
                                )}
                            </strong>

                            <small>
                                Student:
                                ${escapeHTML(
                                    doc.studentName
                                )}
                                • ${doc.date}
                            </small>

                        </div>

                    </div>

                `
            )
            .join("");

}


/* ================= CLASS LIST ================= */

function renderClassList() {

    const body =
        document.getElementById(
            "classListBody"
        );


    const users =
        getUsers()
            .filter(
                user =>
                    user.role ===
                    "student"
            );


    if (users.length === 0) {

        body.innerHTML = `

            <tr>

                <td colspan="4">
                    No students available.
                </td>

            </tr>

        `;

        return;

    }


    body.innerHTML =
        users
            .map(
                student => `

                    <tr>

                        <td>
                            ${student.id}
                        </td>

                        <td>
                            ${escapeHTML(
                                student.name
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                student.program ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                student.year ||
                                "-"
                            )}
                        </td>

                    </tr>

                `
            )
            .join("");

}


/* ================= REPORTS ================= */

function updateReports() {

    const students =
        getUsers()
            .filter(
                user =>
                    user.role ===
                    "student"
            );


    const enrollments =
        getEnrollments();


    document
        .getElementById(
            "reportStudents"
        )
        .textContent =
        students.length;


    document
        .getElementById(
            "reportEnrollments"
        )
        .textContent =
        enrollments.length;

}


/* ================= LOGOUT ================= */

function logout() {

    localStorage.removeItem(
        "current_user"
    );

    currentUser = null;


    document
        .getElementById("app")
        .classList.add("hidden");


    document
        .getElementById("registerPage")
        .classList.add("hidden");


    document
        .getElementById("loginPage")
        .classList.remove("hidden");


    document
        .getElementById("loginForm")
        .reset();


    showToast(
        "Logged out successfully."
    );

}


/* ================= MOBILE SIDEBAR ================= */

function toggleSidebar() {

    document
        .querySelector(".sidebar")
        .classList.toggle("open");

}


/* ================= TOAST ================= */

let toastTimer;


function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );

}


/* ================= HELPERS ================= */

function capitalize(value) {

    if (!value) return "";

    return value
        .charAt(0)
        .toUpperCase() +
        value.slice(1);

}


function escapeHTML(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}