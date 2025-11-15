/* 
Program name: homework3.js
Author: Zach Scotton
Date created: 2025-11-10
Date last edited: 2025-11-14
Version: 3.1
Description: JavaScript validation and review logic for Homework 3 patient registration form.
             All validations run on-the-fly (oninput, onblur, onchange) and before submit.
*/

// Initialize everything when page loads
document.addEventListener("DOMContentLoaded", () => {
    setCurrentDate();
    initSlider();
    attachFieldEvents();

    const validateBtn = document.getElementById("validateBtn");
    const reviewBtn = document.getElementById("reviewBtn");
    const resetBtn = document.getElementById("resetBtn");

    if (validateBtn) validateBtn.addEventListener("click", validateForm);
    if (reviewBtn) reviewBtn.addEventListener("click", reviewData);
    if (resetBtn) resetBtn.addEventListener("click", handleReset);
});

/* ========== DATE DISPLAY ========== */
function setCurrentDate() {
    const todaySpan = document.getElementById("currentDate");
    if (!todaySpan) return;
    
    const today = new Date();
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const dayName = days[today.getDay()];
    const monthName = months[today.getMonth()];
    const day = today.getDate();
    const year = today.getFullYear();
    
    // Add ordinal suffix (st, nd, rd, th)
    let suffix = "th";
    if (day === 1 || day === 21 || day === 31) suffix = "st";
    else if (day === 2 || day === 22) suffix = "nd";
    else if (day === 3 || day === 23) suffix = "rd";
    
    todaySpan.textContent = `${dayName}, ${monthName} ${day}${suffix}, ${year}`;
}

/* ========== SLIDER INITIALIZATION ========== */
function initSlider() {
    const slider = document.getElementById("salaryRange");
    const output = document.getElementById("salaryValue");
    if (!slider || !output) return;

    const formatSalary = (val) =>
        "$" + Number(val).toLocaleString("en-US", { maximumFractionDigits: 0 });

    output.textContent = formatSalary(slider.value);
    slider.addEventListener("input", () => {
        output.textContent = formatSalary(slider.value);
    });
}

/* ========== ERROR DISPLAY HELPERS ========== */
function showError(fieldId, message) {
    const span = document.getElementById(fieldId + "Error");
    if (span) {
        span.textContent = message;
    }
}

function clearError(fieldId) {
    const span = document.getElementById(fieldId + "Error");
    if (span) {
        span.textContent = "";
    }
}

function clearAllErrors() {
    const errorSpans = document.querySelectorAll(".error");
    errorSpans.forEach((span) => {
        span.textContent = "";
    });
}

function setSubmitEnabled(ok) {
    const submitBtn = document.getElementById("submitBtn");
    if (!submitBtn) return;

    if (ok) {
        submitBtn.disabled = false;
        submitBtn.hidden = false;
    } else {
        submitBtn.disabled = true;
        submitBtn.hidden = true;
    }
}

function handleReset() {
    clearAllErrors();
    setSubmitEnabled(false);
    document.getElementById("formStatus").textContent = "";
    document.getElementById("reviewArea").innerHTML = "";
}

/* ========== FIELD VALIDATION FUNCTIONS ========== */

function validateFirstName() {
    const input = document.getElementById("firstName");
    const value = input.value.trim();
    const pattern = /^[A-Za-z'-]{1,30}$/;

    if (!value) {
        showError("firstName", "First name is required.");
        return false;
    }
    if (!pattern.test(value)) {
        showError("firstName", "Only letters, apostrophes, and dashes allowed (1-30 chars).");
        return false;
    }
    clearError("firstName");
    return true;
}

function validateMiddleInitial() {
    const input = document.getElementById("middleInitial");
    const value = input.value.trim();
    
    if (value === "") {
        clearError("middleInitial");
        return true; // Optional field
    }
    
    const pattern = /^[A-Za-z]$/;
    if (!pattern.test(value)) {
        showError("middleInitial", "Must be a single letter.");
        return false;
    }
    clearError("middleInitial");
    return true;
}

function validateLastName() {
    const input = document.getElementById("lastName");
    const value = input.value.trim();
    const pattern = /^[A-Za-z'-]{1,30}$/;

    if (!value) {
        showError("lastName", "Last name is required.");
        return false;
    }
    if (!pattern.test(value)) {
        showError("lastName", "Only letters, apostrophes, and dashes allowed (1-30 chars).");
        return false;
    }
    clearError("lastName");
    return true;
}

function validateDob() {
    const input = document.getElementById("dob");
    const value = input.value.trim();
    
    // Check format MM/DD/YYYY
    const pattern = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/(19|20)\d{2}$/;

    if (!value) {
        showError("dob", "Date of birth is required.");
        return false;
    }
    
    if (!pattern.test(value)) {
        showError("dob", "Use MM/DD/YYYY format.");
        return false;
    }

    // Parse and validate the date
    const [month, day, year] = value.split("/").map((p) => parseInt(p, 10));
    const dobDate = new Date(year, month - 1, day);

    // Check that date is valid (catches things like 02/31/2025)
    if (
        dobDate.getFullYear() !== year ||
        dobDate.getMonth() !== month - 1 ||
        dobDate.getDate() !== day
    ) {
        showError("dob", "Invalid calendar date.");
        return false;
    }

    // Check date is not in future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dobDate > today) {
        showError("dob", "Date of birth cannot be in the future.");
        return false;
    }

    // Check date is not more than 120 years ago
    const maxAgeDate = new Date();
    maxAgeDate.setFullYear(maxAgeDate.getFullYear() - 120);
    
    if (dobDate < maxAgeDate) {
        showError("dob", "Date of birth cannot be more than 120 years ago.");
        return false;
    }

    clearError("dob");
    return true;
}

function validatePatientId() {
    const input = document.getElementById("patientId");
    let value = input.value;
    
    // Strip all non-digits
    let digits = value.replace(/\D/g, "");
    
    // Auto-format as 000-00-0000 (SSN style)
    if (digits.length > 3 && digits.length <= 5) {
        value = digits.slice(0, 3) + "-" + digits.slice(3);
    } else if (digits.length > 5) {
        value = digits.slice(0, 3) + "-" + digits.slice(3, 5) + "-" + digits.slice(5, 9);
    } else {
        value = digits;
    }
    
    input.value = value;

    if (!digits) {
        showError("patientId", "Patient ID is required.");
        return false;
    }
    if (digits.length !== 9) {
        showError("patientId", "Must be exactly 9 digits (format: 000-00-0000).");
        return false;
    }
    clearError("patientId");
    return true;
}

function validateEmail() {
    const input = document.getElementById("email");
    let value = input.value.trim();
    
    // Force lowercase
    value = value.toLowerCase();
    input.value = value;

    if (!value) {
        showError("email", "Email address is required.");
        return false;
    }

    // Basic email pattern
    const pattern = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
    if (!pattern.test(value)) {
        showError("email", "Invalid email format (use name@domain.tld).");
        return false;
    }

    clearError("email");
    return true;
}

function validatePhone() {
    const input = document.getElementById("phone");
    let value = input.value;
    
    // Strip all non-digits
    let digits = value.replace(/\D/g, "");

    // Auto-format as 000-000-0000
    if (digits.length > 3 && digits.length <= 6) {
        value = digits.slice(0, 3) + "-" + digits.slice(3);
    } else if (digits.length > 6) {
        value = digits.slice(0, 3) + "-" + digits.slice(3, 6) + "-" + digits.slice(6, 10);
    } else {
        value = digits;
    }
    
    input.value = value;

    if (!digits) {
        showError("phone", "Phone number is required.");
        return false;
    }
    if (digits.length !== 10) {
        showError("phone", "Phone must be 10 digits (format: 000-000-0000).");
        return false;
    }

    clearError("phone");
    return true;
}

function validateAddress1() {
    const input = document.getElementById("address1");
    const value = input.value.trim();

    if (!value) {
        showError("address1", "Address line 1 is required.");
        return false;
    }
    if (value.length < 2 || value.length > 30) {
        showError("address1", "Must be 2-30 characters.");
        return false;
    }
    clearError("address1");
    return true;
}

function validateAddress2() {
    const input = document.getElementById("address2");
    const value = input.value.trim();

    // Optional field
    if (!value) {
        clearError("address2");
        return true;
    }
    
    if (value.length < 2 || value.length > 30) {
        showError("address2", "If used, must be 2-30 characters.");
        return false;
    }
    clearError("address2");
    return true;
}

function validateCity() {
    const input = document.getElementById("city");
    const value = input.value.trim();

    if (!value) {
        showError("city", "City is required.");
        return false;
    }
    if (value.length < 2 || value.length > 30) {
        showError("city", "Must be 2-30 characters.");
        return false;
    }
    clearError("city");
    return true;
}

function validateState() {
    const select = document.getElementById("state");
    const value = select.value;

    if (!value) {
        showError("state", "Please select a state.");
        return false;
    }
    clearError("state");
    return true;
}

function validateZip() {
    const input = document.getElementById("zip");
    let value = input.value;
    
    // Strip non-digits
    value = value.replace(/\D/g, "");
    input.value = value;

    if (!value) {
        showError("zip", "ZIP code is required.");
        return false;
    }
    if (value.length !== 5) {
        showError("zip", "Must be exactly 5 digits.");
        return false;
    }
    clearError("zip");
    return true;
}

function validateUserId() {
    const input = document.getElementById("userId");
    let value = input.value.trim();
    
    // Force lowercase
    value = value.toLowerCase();
    input.value = value;

    if (!value) {
        showError("userId", "User ID is required.");
        return false;
    }

    // Must start with letter, 5-20 chars, only letters/digits/dash/underscore
    const pattern = /^[a-z][a-z0-9_-]{4,19}$/;
    if (!pattern.test(value)) {
        showError("userId", "5-20 chars, must start with letter. Only letters, digits, dash, underscore.");
        return false;
    }

    clearError("userId");
    return true;
}

function validatePasswords() {
    const userIdInput = document.getElementById("userId");
    const p1Input = document.getElementById("password1");
    const p2Input = document.getElementById("password2");

    const userId = userIdInput.value.trim().toLowerCase();
    const p1 = p1Input.value;
    const p2 = p2Input.value;

    let ok = true;

    // Validate password1
    if (!p1) {
        showError("password1", "Password is required.");
        ok = false;
    } else {
        // Must be 8-30 chars with at least 1 uppercase, 1 lowercase, 1 digit
        const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,30}$/;
        if (!pattern.test(p1)) {
            showError("password1", "8-30 chars, must include 1 uppercase, 1 lowercase, and 1 digit.");
            ok = false;
        } else if (userId && p1.toLowerCase().includes(userId)) {
            showError("password1", "Password cannot contain your User ID.");
            ok = false;
        } else {
            clearError("password1");
        }
    }

    // Validate password2
    if (!p2) {
        showError("password2", "Please confirm your password.");
        ok = false;
    } else if (p1 !== p2) {
        showError("password2", "Passwords do not match.");
        ok = false;
    } else if (ok) {
        clearError("password2");
    }

    return ok;
}

function validateConditions() {
    // Checkboxes are optional - just clear any error
    clearError("conditions");
    return true;
}

function validateRadios(groupName, errorId, label) {
    const checked = document.querySelector(`input[name="${groupName}"]:checked`);
    if (!checked) {
        showError(errorId, `Please select ${label}.`);
        return false;
    }
    clearError(errorId);
    return true;
}

function validateSymptoms() {
    const input = document.getElementById("symptoms");
    const value = input.value;

    // Optional field, but check for double quotes
    if (value.includes('"')) {
        showError("symptoms", 'Please avoid double quotes (").');
        return false;
    }
    clearError("symptoms");
    return true;
}

/* ========== ATTACH ON-THE-FLY VALIDATION ========== */

function attachFieldEvents() {
    // Text inputs - validate on input (as they type)
    const inputFields = [
        ["firstName", "input", validateFirstName],
        ["middleInitial", "input", validateMiddleInitial],
        ["lastName", "input", validateLastName],
        ["patientId", "input", validatePatientId],
        ["phone", "input", validatePhone],
        ["zip", "input", validateZip],
        ["userId", "input", validateUserId],
        ["password1", "input", validatePasswords],
        ["password2", "input", validatePasswords]
    ];

    // Blur validation for fields that need complete entry
    const blurFields = [
        ["dob", "blur", validateDob],
        ["email", "blur", validateEmail],
        ["address1", "blur", validateAddress1],
        ["address2", "blur", validateAddress2],
        ["city", "blur", validateCity],
        ["symptoms", "blur", validateSymptoms]
    ];

    // Combine and attach
    [...inputFields, ...blurFields].forEach(([id, evt, fn]) => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener(evt, () => {
                fn();
                // Any field change invalidates previous validation
                setSubmitEnabled(false);
                document.getElementById("formStatus").textContent = "";
            });
        }
    });

    // State dropdown
    const stateEl = document.getElementById("state");
    if (stateEl) {
        stateEl.addEventListener("change", () => {
            validateState();
            setSubmitEnabled(false);
            document.getElementById("formStatus").textContent = "";
        });
    }

    // Radio buttons
    ["gender", "vaccinated", "insurance"].forEach((name) => {
        const nodes = document.querySelectorAll(`input[name="${name}"]`);
        nodes.forEach((n) =>
            n.addEventListener("change", () => {
                validateRadios(name, name + "Error", name);
                setSubmitEnabled(false);
                document.getElementById("formStatus").textContent = "";
            })
        );
    });

    // Checkboxes
    const condNodes = document.querySelectorAll('input[name="conditions"]');
    condNodes.forEach((n) =>
        n.addEventListener("change", () => {
            validateConditions();
            setSubmitEnabled(false);
            document.getElementById("formStatus").textContent = "";
        })
    );
}

/* ========== VALIDATE BUTTON - FULL FORM VALIDATION ========== */

function validateForm() {
    clearAllErrors();
    setSubmitEnabled(false);

    let allValid = true;

    // Validate each field
    if (!validateFirstName()) allValid = false;
    if (!validateMiddleInitial()) allValid = false;
    if (!validateLastName()) allValid = false;
    if (!validateDob()) allValid = false;
    if (!validatePatientId()) allValid = false;

    if (!validateEmail()) allValid = false;
    if (!validatePhone()) allValid = false;

    if (!validateAddress1()) allValid = false;
    if (!validateAddress2()) allValid = false;
    if (!validateCity()) allValid = false;
    if (!validateState()) allValid = false;
    if (!validateZip()) allValid = false;

    if (!validateConditions()) allValid = false;
    if (!validateRadios("gender", "genderError", "Gender")) allValid = false;
    if (!validateRadios("vaccinated", "vaccinatedError", "Vaccinated")) allValid = false;
    if (!validateRadios("insurance", "insuranceError", "Insurance")) allValid = false;

    if (!validateUserId()) allValid = false;
    if (!validatePasswords()) allValid = false;

    if (!validateSymptoms()) allValid = false;

    const status = document.getElementById("formStatus");

    if (allValid) {
        setSubmitEnabled(true);
        if (status) {
            status.textContent = "✓ All fields validated! You may submit.";
            status.className = "status-message success";
        }
    } else {
        if (status) {
            status.textContent = "✗ Please fix errors before submitting.";
            status.className = "status-message error-global";
        }
    }

    return allValid;
}

/* ========== REVIEW BUTTON - DISPLAY ALL DATA ========== */

function reviewData() {
    const output = document.getElementById("reviewArea");
    if (!output) return;

    const getRadio = (name) => {
        const checked = document.querySelector(`input[name="${name}"]:checked`);
        return checked ? checked.value : "(none selected)";
    };

    const getCheckboxes = (name) => {
        const checked = Array.from(
            document.querySelectorAll(`input[name="${name}"]:checked`)
        ).map((c) => c.value);
        return checked.length ? checked.join(", ") : "(none)";
    };

    const form = document.getElementById("patientForm");
    const data = {
        firstName: form.firstName.value.trim(),
        middleInitial: form.middleInitial.value.trim(),
        lastName: form.lastName.value.trim(),
        dob: form.dob.value.trim(),
        patientId: form.patientId.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        address1: form.address1.value.trim(),
        address2: form.address2.value.trim(),
        city: form.city.value.trim(),
        state: form.state.value,
        zip: form.zip.value.trim(),
        conditions: getCheckboxes("conditions"),
        gender: getRadio("gender"),
        vaccinated: getRadio("vaccinated"),
        insurance: getRadio("insurance"),
        salary: document.getElementById("salaryValue").textContent,
        symptoms: form.symptoms.value.trim(),
        userId: form.userId.value.trim()
    };

    output.innerHTML = `
        <table class="review-table">
            <tr><th colspan="2">PLEASE REVIEW THIS INFORMATION</th></tr>
            <tr><td>Name</td><td>${data.firstName} ${data.middleInitial} ${data.lastName}</td></tr>
            <tr><td>Date of Birth</td><td>${data.dob || "(not entered)"}</td></tr>
            <tr><td>Patient ID</td><td>${data.patientId ? "***-**-" + data.patientId.slice(-4) : "(not entered)"}</td></tr>
            <tr><td>Email</td><td>${data.email || "(not entered)"}</td></tr>
            <tr><td>Phone</td><td>${data.phone || "(not entered)"}</td></tr>
            <tr><td>Address</td>
                <td>
                    ${data.address1 || "(not entered)"}<br>
                    ${data.address2 ? data.address2 + "<br>" : ""}
                    ${data.city || "(city)"}, ${data.state || "(state)"} ${data.zip || "(zip)"}
                </td>
            </tr>
            <tr><th colspan="2">MEDICAL HISTORY</th></tr>
            <tr><td>Conditions</td><td>${data.conditions}</td></tr>
            <tr><td>Gender</td><td>${data.gender}</td></tr>
            <tr><td>Vaccinated?</td><td>${data.vaccinated}</td></tr>
            <tr><td>Insurance?</td><td>${data.insurance}</td></tr>
            <tr><td>Desired Salary</td><td>${data.salary}</td></tr>
            <tr><td>Symptoms</td><td>${data.symptoms || "(none provided)"}</td></tr>
            <tr><th colspan="2">LOGIN CREDENTIALS</th></tr>
            <tr><td>User ID</td><td>${data.userId || "(not entered)"}</td></tr>
            <tr><td>Password</td><td>••••••••</td></tr>
        </table>
    `;
}

/* ========== END OF FILE ========== */
