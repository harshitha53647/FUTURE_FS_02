const API_URL = "http://localhost:5000/api/leads";

let leads = [];


// ======================================================
// PAGE NAVIGATION
// ======================================================

function showDashboard() {
    showPage("dashboardSection");
}

function showAddLead() {
    showPage("addLeadSection");
}

function showLeads() {
    showPage("leadsSection");
}


function showPage(pageId) {

    document.querySelectorAll(".page").forEach(page => {
        page.classList.add("hidden");
    });

    const page = document.getElementById(pageId);

    if (page) {
        page.classList.remove("hidden");
    }

    // Navigation active state
    document.querySelectorAll(".nav-btn").forEach(button => {
        button.classList.remove("active");
    });

    document.querySelectorAll(".nav-btn").forEach(button => {

        if (button.getAttribute("onclick")?.includes(
            pageId === "dashboardSection"
                ? "showDashboard"
                : pageId === "addLeadSection"
                    ? "showAddLead"
                    : "showLeads"
        )) {
            button.classList.add("active");
        }

    });

    if (pageId === "dashboardSection") {
        renderDashboard();
        renderRecentLeads();
    }

    if (pageId === "leadsSection") {
        renderLeadsTable();
    }
}


// ======================================================
// FETCH LEADS
// ======================================================

async function fetchLeads() {

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Could not fetch leads");
        }

        leads = await response.json();

        console.log("Leads received:", leads);

        renderDashboard();
        renderRecentLeads();
        renderLeadsTable();

    } catch (error) {

        console.error("Fetch error:", error);

        showMessage(
            "Backend connection failed. Make sure the server is running.",
            "error"
        );
    }
}


// ======================================================
// DASHBOARD
// ======================================================

function renderDashboard() {

    const total = leads.length;

    const newCount = leads.filter(
        lead => lead.status === "New"
    ).length;

    const contactedCount = leads.filter(
        lead => lead.status === "Contacted"
    ).length;

    const convertedCount = leads.filter(
        lead => lead.status === "Converted"
    ).length;


    const totalElement =
        document.getElementById("totalLeads");

    const newElement =
        document.getElementById("newLeads");

    const contactedElement =
        document.getElementById("contactedLeads");

    const convertedElement =
        document.getElementById("convertedLeads");


    if (totalElement) {
        totalElement.textContent = total;
    }

    if (newElement) {
        newElement.textContent = newCount;
    }

    if (contactedElement) {
        contactedElement.textContent = contactedCount;
    }

    if (convertedElement) {
        convertedElement.textContent = convertedCount;
    }
}


// ======================================================
// RECENT LEADS
// ======================================================

function renderRecentLeads() {

    const container =
        document.getElementById("recentLeads");

    if (!container) {
        return;
    }


    if (leads.length === 0) {

        container.innerHTML = `
            <p class="empty-message">
                No leads yet.
            </p>
        `;

        return;
    }


    container.innerHTML =
        leads.slice(0, 5).map(lead => {

            return `
                <div class="recent-lead">

                    <div>
                        <strong>
                            ${escapeHTML(lead.name)}
                        </strong>

                        <small>
                            ${escapeHTML(lead.email)}
                        </small>
                    </div>

                    <span class="status ${getStatusClass(lead.status)}">
                        ${escapeHTML(lead.status)}
                    </span>

                </div>
            `;

        }).join("");
}


// ======================================================
// ALL LEADS TABLE
// ======================================================

function renderLeadsTable(filteredLeads = leads) {

    const tableBody =
        document.getElementById("leadsTableBody");

    if (!tableBody) {
        console.error("leadsTableBody not found");
        return;
    }


    if (filteredLeads.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-message">
                    No leads found.
                </td>
            </tr>
        `;

        return;
    }


    tableBody.innerHTML =
        filteredLeads.map(lead => {

            return `
                <tr>

                    <td>
                        <strong>
                            ${escapeHTML(lead.name)}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(lead.email)}
                    </td>

                    <td>
                        ${escapeHTML(lead.source)}
                    </td>

                    <td>
                        <span class="status ${getStatusClass(lead.status)}">
                            ${escapeHTML(lead.status)}
                        </span>
                    </td>

                    <td>
                        ${formatDate(lead.followUpDate)}
                    </td>

                    <td>
                        ${formatDate(lead.createdAt)}
                    </td>

                    <td>

                        <button
                            class="action-btn edit-btn"
                            onclick="openEditModal('${lead._id}')">
                            Edit
                        </button>

                        <button
                            class="action-btn delete-btn"
                            onclick="deleteLead('${lead._id}')">
                            Delete
                        </button>

                    </td>

                </tr>
            `;

        }).join("");
}


// ======================================================
// SEARCH
// ======================================================

function searchLeads() {

    const input =
        document.getElementById("searchInput");

    if (!input) {
        return;
    }


    const text =
        input.value.toLowerCase().trim();


    const filtered =
        leads.filter(lead => {

            return (

                lead.name
                    .toLowerCase()
                    .includes(text)

                ||

                lead.email
                    .toLowerCase()
                    .includes(text)

                ||

                lead.source
                    .toLowerCase()
                    .includes(text)

                ||

                lead.status
                    .toLowerCase()
                    .includes(text)

            );

        });


    renderLeadsTable(filtered);
}


// ======================================================
// ADD LEAD
// ======================================================

async function addLead(event) {

    event.preventDefault();


    const name =
        document.getElementById("name").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const source =
        document.getElementById("source").value;

    const status =
        document.getElementById("status").value;

    const followUpDate =
        document.getElementById("followUpDate").value;

    const notes =
        document.getElementById("notes").value.trim();


    if (!name || !email || !source) {

        showMessage(
            "Please fill all required fields.",
            "error"
        );

        return;
    }


    const leadData = {

        name: name,

        email: email,

        source: source,

        status: status,

        notes: notes
    };


    if (followUpDate) {
        leadData.followUpDate = followUpDate;
    }


    try {

        const response =
            await fetch(API_URL, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(leadData)

            });


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to add lead"
            );
        }


        showMessage(
            "Lead added successfully!",
            "success"
        );


        document
            .getElementById("leadForm")
            .reset();


        await fetchLeads();

        showLeads();


    } catch (error) {

        console.error(
            "Add lead error:",
            error
        );

        showMessage(
            error.message ||
            "Failed to add lead.",
            "error"
        );
    }
}


// ======================================================
// EDIT LEAD
// ======================================================

function openEditModal(id) {

    const lead =
        leads.find(
            item => item._id === id
        );


    if (!lead) {

        console.error(
            "Lead not found:",
            id
        );

        return;
    }


    // Remove old modal if it exists

    const oldModal =
        document.getElementById("dynamicEditModal");

    if (oldModal) {
        oldModal.remove();
    }


    // Create modal dynamically

    const modal =
        document.createElement("div");

    modal.id = "dynamicEditModal";

    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100%";
    modal.style.height = "100%";
    modal.style.background = "rgba(0,0,0,0.65)";
    modal.style.display = "flex";
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";
    modal.style.zIndex = "9999";


    modal.innerHTML = `

        <div style="
            background:white;
            width:90%;
            max-width:550px;
            max-height:90vh;
            overflow-y:auto;
            border-radius:15px;
            padding:30px;
            box-sizing:border-box;
        ">

            <div style="
                display:flex;
                justify-content:space-between;
                align-items:center;
                margin-bottom:20px;
            ">

                <h2 style="margin:0;">
                    Edit Lead
                </h2>

                <button
                    id="closeDynamicModal"
                    style="
                        border:none;
                        background:none;
                        font-size:25px;
                        cursor:pointer;
                    ">
                    &times;
                </button>

            </div>


            <form id="dynamicEditForm">

                <input
                    type="hidden"
                    id="dynamicEditId"
                    value="${lead._id}"
                >


                <label>Name</label>

                <input
                    type="text"
                    id="dynamicEditName"
                    value="${escapeAttribute(lead.name)}"
                    required
                    style="
                        width:100%;
                        padding:12px;
                        margin:8px 0 15px;
                        box-sizing:border-box;
                    "
                >


                <label>Email</label>

                <input
                    type="email"
                    id="dynamicEditEmail"
                    value="${escapeAttribute(lead.email)}"
                    required
                    style="
                        width:100%;
                        padding:12px;
                        margin:8px 0 15px;
                        box-sizing:border-box;
                    "
                >


                <label>Source</label>

                <select
                    id="dynamicEditSource"
                    style="
                        width:100%;
                        padding:12px;
                        margin:8px 0 15px;
                        box-sizing:border-box;
                    "
                >

                    <option value="Website"
                        ${lead.source === "Website" ? "selected" : ""}>
                        Website
                    </option>

                    <option value="LinkedIn"
                        ${lead.source === "LinkedIn" ? "selected" : ""}>
                        LinkedIn
                    </option>

                    <option value="Instagram"
                        ${lead.source === "Instagram" ? "selected" : ""}>
                        Instagram
                    </option>

                    <option value="Referral"
                        ${lead.source === "Referral" ? "selected" : ""}>
                        Referral
                    </option>

                    <option value="Email"
                        ${lead.source === "Email" ? "selected" : ""}>
                        Email
                    </option>

                    <option value="Other"
                        ${lead.source === "Other" ? "selected" : ""}>
                        Other
                    </option>

                </select>


                <label>Status</label>

                <select
                    id="dynamicEditStatus"
                    style="
                        width:100%;
                        padding:12px;
                        margin:8px 0 15px;
                        box-sizing:border-box;
                    "
                >

                    <option value="New"
                        ${lead.status === "New" ? "selected" : ""}>
                        New
                    </option>

                    <option value="Contacted"
                        ${lead.status === "Contacted" ? "selected" : ""}>
                        Contacted
                    </option>

                    <option value="Converted"
                        ${lead.status === "Converted" ? "selected" : ""}>
                        Converted
                    </option>

                </select>


                <label>Follow-up Date</label>

                <input
                    type="date"
                    id="dynamicEditFollowUp"
                    value="${
                        lead.followUpDate
                            ? lead.followUpDate.substring(0, 10)
                            : ""
                    }"
                    style="
                        width:100%;
                        padding:12px;
                        margin:8px 0 15px;
                        box-sizing:border-box;
                    "
                >


                <label>Notes</label>

                <textarea
                    id="dynamicEditNotes"
                    rows="4"
                    style="
                        width:100%;
                        padding:12px;
                        margin:8px 0 20px;
                        box-sizing:border-box;
                    "
                >${escapeHTML(lead.notes || "")}</textarea>


                <div style="
                    display:flex;
                    gap:10px;
                    justify-content:flex-end;
                ">

                    <button
                        type="button"
                        id="cancelDynamicEdit"
                        style="
                            padding:12px 20px;
                            border:none;
                            border-radius:8px;
                            cursor:pointer;
                        ">
                        Cancel
                    </button>


                    <button
                        type="submit"
                        style="
                            padding:12px 20px;
                            border:none;
                            border-radius:8px;
                            background:#4f46e5;
                            color:white;
                            cursor:pointer;
                        ">
                        Update Lead
                    </button>

                </div>

            </form>

        </div>
    `;


    document.body.appendChild(modal);


    // Close buttons

    document
        .getElementById("closeDynamicModal")
        .addEventListener(
            "click",
            () => modal.remove()
        );


    document
        .getElementById("cancelDynamicEdit")
        .addEventListener(
            "click",
            () => modal.remove()
        );


    // Submit edit form

    document
        .getElementById("dynamicEditForm")
        .addEventListener(
            "submit",
            async function(event) {

                event.preventDefault();

                await updateLeadDynamic(lead._id);

            }
        );
}


// ======================================================
// UPDATE LEAD
// ======================================================

async function updateLeadDynamic(id) {

    const updatedLead = {

        name:
            document
                .getElementById("dynamicEditName")
                .value
                .trim(),

        email:
            document
                .getElementById("dynamicEditEmail")
                .value
                .trim(),

        source:
            document
                .getElementById("dynamicEditSource")
                .value,

        status:
            document
                .getElementById("dynamicEditStatus")
                .value,

        followUpDate:
            document
                .getElementById("dynamicEditFollowUp")
                .value,

        notes:
            document
                .getElementById("dynamicEditNotes")
                .value
                .trim()
    };


    try {

        const response =
            await fetch(
                `${API_URL}/${id}`,
                {

                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(updatedLead)

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to update lead"
            );
        }


        showMessage(
            "Lead updated successfully!",
            "success"
        );


        const modal =
            document.getElementById(
                "dynamicEditModal"
            );

        if (modal) {
            modal.remove();
        }


        await fetchLeads();

        showLeads();


    } catch (error) {

        console.error(
            "Update error:",
            error
        );

        showMessage(
            error.message ||
            "Failed to update lead.",
            "error"
        );
    }
}


// ======================================================
// DELETE LEAD
// ======================================================

async function deleteLead(id) {

    const lead =
        leads.find(
            item => item._id === id
        );


    if (!lead) {

        console.error(
            "Lead not found:",
            id
        );

        return;
    }


    const confirmed =
        confirm(
            `Are you sure you want to delete "${lead.name}"?`
        );


    if (!confirmed) {
        return;
    }


    try {

        console.log(
            "Deleting lead:",
            id
        );


        const response =
            await fetch(
                `${API_URL}/${id}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to delete lead"
            );
        }


        showMessage(
            "Lead deleted successfully!",
            "success"
        );


        await fetchLeads();

        showLeads();


    } catch (error) {

        console.error(
            "Delete error:",
            error
        );


        showMessage(
            error.message ||
            "Failed to delete lead.",
            "error"
        );
    }
}


// ======================================================
// DATE FORMAT
// ======================================================

function formatDate(date) {

    if (!date) {
        return "-";
    }


    const d = new Date(date);


    if (isNaN(d.getTime())) {
        return "-";
    }


    return d.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


// ======================================================
// STATUS
// ======================================================

function getStatusClass(status) {

    if (status === "New") {
        return "status-new";
    }

    if (status === "Contacted") {
        return "status-contacted";
    }

    if (status === "Converted") {
        return "status-converted";
    }

    return "";
}


// ======================================================
// MESSAGE
// ======================================================

function showMessage(message, type) {

    let box =
        document.getElementById("messageBox");


    if (!box) {

        box =
            document.createElement("div");

        box.id = "messageBox";

        box.style.position = "fixed";
        box.style.top = "20px";
        box.style.right = "20px";
        box.style.padding = "15px 20px";
        box.style.borderRadius = "10px";
        box.style.zIndex = "10000";
        box.style.color = "white";
        box.style.fontWeight = "600";

        document.body.appendChild(box);
    }


    box.textContent = message;

    box.style.background =
        type === "success"
            ? "#16a34a"
            : "#dc2626";


    box.style.display = "block";


    setTimeout(() => {

        box.style.display = "none";

    }, 3000);
}


// ======================================================
// SECURITY
// ======================================================

function escapeHTML(text) {

    if (
        text === null ||
        text === undefined
    ) {
        return "";
    }


    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function escapeAttribute(text) {

    return escapeHTML(text);
}


// ======================================================
// INITIALIZE
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log(
            "CRM frontend loaded successfully!"
        );


        // Add Lead form

        const leadForm =
            document.getElementById("leadForm");

        if (leadForm) {

            leadForm.addEventListener(
                "submit",
                addLead
            );
        }


        // Search

        const searchInput =
            document.getElementById("searchInput");

        if (searchInput) {

            searchInput.addEventListener(
                "input",
                searchLeads
            );
        }


        // Load leads

        fetchLeads();

    }
);