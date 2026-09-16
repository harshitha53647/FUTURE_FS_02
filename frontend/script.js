const API_URL = "http://localhost:5000/api/leads";

let leads = [];

// ===============================
// PAGE NAVIGATION
// ===============================

function showPage(page) {
    document.querySelectorAll(".page").forEach((section) => {
        section.classList.add("hidden");
    });

    document.getElementById(page).classList.remove("hidden");

    document.querySelectorAll(".nav-btn").forEach((btn) => {
        btn.classList.remove("active");
    });

    const activeButton = document.querySelector(`[data-page="${page}"]`);

    if (activeButton) {
        activeButton.classList.add("active");
    }

    if (page === "dashboard") {
        renderDashboard();
    }

    if (page === "leads") {
        renderLeadsTable();
    }
}


// ===============================
// FETCH LEADS FROM BACKEND
// ===============================

async function fetchLeads() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to fetch leads");
        }

        leads = await response.json();

        renderDashboard();
        renderLeadsTable();

    } catch (error) {
        console.error(error);
        showMessage("Unable to connect to the backend.", "error");
    }
}


// ===============================
// DASHBOARD
// ===============================

function renderDashboard() {
    const total = leads.length;

    const newLeads = leads.filter(
        lead => lead.status === "New"
    ).length;

    const contacted = leads.filter(
        lead => lead.status === "Contacted"
    ).length;

    const converted = leads.filter(
        lead => lead.status === "Converted"
    ).length;

    document.getElementById("totalLeads").textContent = total;
    document.getElementById("newLeads").textContent = newLeads;
    document.getElementById("contactedLeads").textContent = contacted;
    document.getElementById("convertedLeads").textContent = converted;

    renderRecentLeads();
}


// ===============================
// RECENT LEADS
// ===============================

function renderRecentLeads() {

    const container = document.getElementById("recentLeads");

    if (!container) return;

    const recentLeads = leads.slice(0, 5);

    if (recentLeads.length === 0) {
        container.innerHTML = `
            <p class="empty-message">
                No leads available.
            </p>
        `;
        return;
    }

    container.innerHTML = recentLeads.map(lead => `
        <div class="recent-lead">

            <div>
                <strong>${escapeHTML(lead.name)}</strong>
                <small>${escapeHTML(lead.email)}</small>
            </div>

            <span class="status ${getStatusClass(lead.status)}">
                ${escapeHTML(lead.status)}
            </span>

        </div>
    `).join("");
}


// ===============================
// DISPLAY ALL LEADS
// ===============================

function renderLeadsTable(filteredLeads = leads) {

    const tableBody = document.getElementById("leadsTableBody");

    if (!tableBody) return;

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

    tableBody.innerHTML = filteredLeads.map(lead => `

        <tr>

            <td>
                <strong>${escapeHTML(lead.name)}</strong>
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

    `).join("");
}


// ===============================
// SEARCH LEADS
// ===============================

function searchLeads() {

    const searchInput = document.getElementById("searchInput");

    if (!searchInput) return;

    const searchText = searchInput.value.toLowerCase();

    const filtered = leads.filter(lead =>

        lead.name.toLowerCase().includes(searchText) ||

        lead.email.toLowerCase().includes(searchText) ||

        lead.source.toLowerCase().includes(searchText) ||

        lead.status.toLowerCase().includes(searchText)

    );

    renderLeadsTable(filtered);
}


// ===============================
// ADD LEAD
// ===============================

async function addLead(event) {

    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const source = document.getElementById("source").value;
    const status = document.getElementById("status").value;
    const followUpDate = document.getElementById("followUpDate").value;
    const notes = document.getElementById("notes").value;

    const leadData = {
        name,
        email,
        source,
        status,
        notes
    };

    if (followUpDate) {
        leadData.followUpDate = followUpDate;
    }

    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(leadData)

        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to create lead");
        }

        showMessage("Lead added successfully!", "success");

        document.getElementById("leadForm").reset();

        await fetchLeads();

        showPage("leads");

    } catch (error) {

        console.error(error);

        showMessage(
            error.message || "Failed to add lead.",
            "error"
        );
    }
}


// ===============================
// OPEN EDIT MODAL
// ===============================

function openEditModal(id) {

    const lead = leads.find(
        lead => lead._id === id
    );

    if (!lead) return;

    document.getElementById("editLeadId").value = lead._id;

    document.getElementById("editName").value =
        lead.name;

    document.getElementById("editEmail").value =
        lead.email;

    document.getElementById("editSource").value =
        lead.source;

    document.getElementById("editStatus").value =
        lead.status;

    document.getElementById("editFollowUpDate").value =
        lead.followUpDate
            ? lead.followUpDate.substring(0, 10)
            : "";

    document.getElementById("editNotes").value =
        lead.notes || "";

    document.getElementById("editModal").classList.remove("hidden");
}


// ===============================
// CLOSE EDIT MODAL
// ===============================

function closeEditModal() {

    document
        .getElementById("editModal")
        .classList.add("hidden");
}


// ===============================
// UPDATE LEAD
// ===============================

async function updateLead(event) {

    event.preventDefault();

    const id =
        document.getElementById("editLeadId").value;

    const updatedLead = {

        name:
            document.getElementById("editName").value,

        email:
            document.getElementById("editEmail").value,

        source:
            document.getElementById("editSource").value,

        status:
            document.getElementById("editStatus").value,

        followUpDate:
            document.getElementById("editFollowUpDate").value,

        notes:
            document.getElementById("editNotes").value
    };

    try {

        const response = await fetch(
            `${API_URL}/${id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(updatedLead)
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to update lead"
            );
        }

        showMessage(
            "Lead updated successfully!",
            "success"
        );

        closeEditModal();

        await fetchLeads();

    } catch (error) {

        console.error(error);

        showMessage(
            error.message || "Failed to update lead.",
            "error"
        );
    }
}


// ===============================
// DELETE LEAD
// ===============================

async function deleteLead(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this lead?"
    );

    if (!confirmed) return;

    try {

        const response = await fetch(
            `${API_URL}/${id}`,
            {
                method: "DELETE"
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to delete lead"
            );
        }

        showMessage(
            "Lead deleted successfully!",
            "success"
        );

        await fetchLeads();

    } catch (error) {

        console.error(error);

        showMessage(
            error.message || "Failed to delete lead.",
            "error"
        );
    }
}


// ===============================
// DATE FORMAT
// ===============================

function formatDate(date) {

    if (!date) {
        return "-";
    }

    const formattedDate = new Date(date);

    if (isNaN(formattedDate)) {
        return "-";
    }

    return formattedDate.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


// ===============================
// STATUS CLASS
// ===============================

function getStatusClass(status) {

    switch (status) {

        case "New":
            return "status-new";

        case "Contacted":
            return "status-contacted";

        case "Converted":
            return "status-converted";

        default:
            return "";
    }
}


// ===============================
// MESSAGE
// ===============================

function showMessage(message, type) {

    const messageBox =
        document.getElementById("messageBox");

    if (!messageBox) {
        alert(message);
        return;
    }

    messageBox.textContent = message;

    messageBox.className = `message-box ${type}`;

    messageBox.classList.remove("hidden");

    setTimeout(() => {

        messageBox.classList.add("hidden");

    }, 3000);
}


// ===============================
// SECURITY
// ===============================

function escapeHTML(text) {

    if (text === undefined || text === null) {
        return "";
    }

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ===============================
// EVENT LISTENERS
// ===============================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        // Navigation buttons

        document
            .querySelectorAll(".nav-btn")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const page =
                            button.dataset.page;

                        showPage(page);
                    }
                );

            });


        // Add lead form

        const leadForm =
            document.getElementById("leadForm");

        if (leadForm) {

            leadForm.addEventListener(
                "submit",
                addLead
            );

        }


        // Edit lead form

        const editForm =
            document.getElementById("editLeadForm");

        if (editForm) {

            editForm.addEventListener(
                "submit",
                updateLead
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


        // Close modal

        const closeModalButton =
            document.getElementById("closeModal");

        if (closeModalButton) {

            closeModalButton.addEventListener(
                "click",
                closeEditModal
            );

        }


        // Initial data loading

        fetchLeads();

    }
);