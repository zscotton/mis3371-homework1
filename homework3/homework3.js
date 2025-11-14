/* 
Program name: homework3.js
Author: Zach Scotton
Date created: 2025-11-10
Date last edited: 2025-11-10
Version: 3.0
Description: JavaScript validation and review logic for Homework 3 patient registration form.
*/

document.addEventListener("DOMContentLoaded", () => {
    setCurrentDate();
    initSlider();
    attachFieldEvents();

    const validateBtn = document.getElementById("validateBtn");
    const reviewBtn = document.getElementById("reviewBtn");
    const resetBtn = document.getElementById("resetBtn");

    if (validateBtn) validateBtn.addEventListener("click", validateForm);
    if (reviewBtn) reviewBtn.addEventListener("click", reviewData);
    if (resetBtn) resetBtn.addEventListener("click", () => {
        clearAllErrors();
        setSubmitEnabled(false);
        document.getElementById("formStatus").textContent = "";
        document.getElementById("reviewArea").innerHTML = "";
    });
});



function setCurrentDate() {
    const todaySpan = document.getElementById("currentDate");
    if (!todaySpan) return;
    const today = new Date();
    const options = { weekday: "long", month: "short", day: "numeric", year: "numeric" };
    todaySpan.textContent = today.toLocaleDateString(undefined, options);
}

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

function showError(fieldId, message) {
    const span = document.getElementById(fieldId + "Error");
    if (span) {
        span.textContent = message;
        span.style.display = "inline";
    }
}

function clearError(fieldId) {
    const span = document.getElementById(fieldId + "Error");
    if (span) {
        span.textContent = "";
        span.style.display = "inline-block"; // keeps space reserved
    }
}

function clearAllErrors() {
    const errorSpans = document.querySelectorAll(".error");
    errorSpans.forEach((span) => {
        span.textContent = "";
        span.style.display = "inline-block";
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

/* ---------- Per-field validation functions ---------- */

function validateFirstName() {
    const input = document.getElementById("firstName");
    const value = input.value.trim();
    const pattern = /^[A-Za-z'-]{1,30}$/;

    if (!value) {
        showError("firstName", "First name is required.");
        return false;
    }
    if (!pattern.test(value)) {
        showError("firstName", "1–30 letters, apostrophes, and dashes only.");
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
        return true; // optional
    }
    const pattern = /^[A-Za-z]$/;
    if (!pattern.test(value)) {
        showError("middleInitial", "Middle initial must be a single letter.");
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
        showError("lastName", "1–30 letters, apostrophes, and dashes only.");
        return false;
    }
    clearError("lastName");
    return true;
}

function validateDob() {
    const input = document.getElementById("dob");
    const value = input.value.trim();
    const pattern = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/(19|20)\d{2}$/;

    if (!value) {
        showError("dob", "Date of birth is required.");
        return false;
    }
    if (!pattern.test(value)) {
        showError("dob", "Use MM/DD/YYYY format.");
        return false;
    }

    const [month, day, year] = value.split("/").map((p) => parseInt(p, 10));
    const dobDate = new Date(year, month - 1, day);

    // Check that date object matches entered values (catches invalid like 02/31)
    if (
        dobDate.getFullYear() !== year ||
        dobDate.getMonth() !== month - 1 ||
        dobDate.getDate() !== day
    ) {
        showError("dob", "Invalid calendar date.");
        return false;
    }

    const today = new Date();
    const maxAgeYears = 120;
    const oldestAllowed = new Date(
        today.getFullYear() - maxAgeYears,
        today.getMonth(),
        today.getDate()
    );

    if (dobDate > today) {
        showError("dob", "Date of birth cannot be in the future.");
        return false;
    }

    if (dobDate < oldestAllowed) {
        showError("dob", `Date of birth cannot be more than ${maxAgeYears} years ago.`);
        return false;
    }

    clearError("dob");
    return true;
}

function validatePatientId() {
    const input = document.getElementById("patientId");
    let value = input.value;
    // Only digits allowed
    value = value.replace(/\D/g, "");
    input.value = value;

    if (!value) {
        showError("patientId", "Patient ID is required.");
        return false;
    }
    if (value.length !== 9) {
        showError("patientId", "Patient ID must be exactly 9 digits.");
        return false;
    }
    clearError("patientId");
    return true;
}

function validateEmail() {
    const input = document.getElementById("email");
    let value = input.value.trim();
    value = value.toLowerCase();
    input.value = value;

    if (!value) {
        showError("email", "Email address is required.");
        return false;
    }

    const pattern = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
    if (!pattern.test(value)) {
        showError("email", "Invalid email format. Use name@domain.tld.");
        return false;
    }

    clearError("email");
    return true;
}

function validatePhone() {
    const input = document.getElementById("phone");
    let value = input.value.replace(/\D/g, "");

    // Auto-format as 000-000-0000
    if (value.length > 3 && value.length <= 6) {
        value = value.slice(0, 3) + "-" + value.slice(3);
    } else if (value.length > 6) {
        value = value.slice(0, 3) + "-" + value.slice(3, 6) + "-" + value.slice(6, 10);
    }
    input.value = value;

    const digits = value.replace(/\D/g, "");
    if (!digits) {
        showError("phone", "Phone number is required.");
        return false;
    }
    if (digits.length !== 10) {
        showError("phone", "Phone must be 10 digits (format 000-000-0000).");
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
        showError("address1", "Address line 1 must be 2–30 characters.");
        return false;
    }
    clearError("address1");
    return true;
}

function validateAddress2() {
    const input = document.getElementById("address2");
    const value = input.value.trim();

    if (!value) {
        clearError("address2");
        return true; // optional
    }
    if (value.length < 2 || value.length > 30) {
        showError("address2", "If used, Address line 2 must be 2–30 characters.");
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
        showError("city", "City must be 2–30 characters.");
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
    let value = input.value.replace(/\D/g, "");
    input.value = value;

    if (!value) {
        showError("zip", "ZIP code is required.");
        return false;
    }
    if (value.length !== 5) {
        showError("zip", "ZIP code must be exactly 5 digits.");
        return false;
    }
    clearError("zip");
    return true;
}

function validateUserId() {
    const input = document.getElementById("userId");
    let value = input.value.trim().toLowerCase();
    input.value = value;

    if (!value) {
        showError("userId", "User ID is required.");
        return false;
    }

    // 5–20 chars, first not a digit, allowed letters/digits/_/-
    const pattern = /^[A-Za-z][A-Za-z0-9_-]{4,19}$/;
    if (!pattern.test(value)) {
        showError(
            "userId",
            "5–20 chars, cannot start with a number. Letters, digits, dash, underscore only."
        );
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

    if (!p1) {
        showError("password1", "Password is required.");
        ok = false;
    } else {
        // At least 8 chars, with upper, lower, and digit
        const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,30}$/;
        if (!pattern.test(p1)) {
            showError(
                "password1",
                "8–30 chars, must include 1 upper, 1 lower, and 1 digit."
            );
            ok = false;
        } else if (userId && p1.toLowerCase().includes(userId)) {
            showError("password1", "Password cannot contain your User ID.");
            ok = false;
        } else {
            clearError("password1");
        }
    }

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
    const checked = document.querySelectorAll('input[name="conditions"]:checked');
    // not required to have at least one; just clear any old error
    clearError("conditions");
    return true;
}

function validateRadios(groupName, errorId, label) {
    const checked = document.querySelector(`input[name="${groupName}"]:checked`);
    if (!checked) {
        showError(errorId, `Please choose a value for ${label}.`);
        return false;
    }
    clearError(errorId);
    return true;
}

function validateSymptoms() {
    const input = document.getElementById("symptoms");
    const value = input.value;

    // Optional, but we can prevent double quotes if you like
    if (value.includes('"')) {
        showError("symptoms", 'Please avoid using double quotes (").');
        return false;
    }
    clearError("symptoms");
    return true;
}

/* ---------- Attach on-the-fly validation ---------- */

function attachFieldEvents() {
    const fields = [
        ["firstName", "input", validateFirstName],
        ["middleInitial", "input", validateMiddleInitial],
        ["lastName", "input", validateLastName],
        ["dob", "blur", validateDob],
        ["patientId", "input", validatePatientId],
        ["email", "blur", validateEmail],
        ["phone", "input", validatePhone],
        ["address1", "blur", validateAddress1],
        ["address2", "blur", validateAddress2],
        ["city", "blur", validateCity],
        ["state", "change", validateState],
        ["zip", "input", validateZip],
        ["userId", "input", validateUserId],
        ["password1", "input", validatePasswords],
        ["password2", "input", validatePasswords],
        ["symptoms", "blur", validateSymptoms]
    ];

    fields.forEach(([id, evt, fn]) => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener(evt, () => {
                fn();
                setSubmitEnabled(false); // any edit invalidates previous validation
                document.getElementById("formStatus").textContent = "";
            });
        }
    });

    // Radios and checkboxes – on change
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

    const condNodes = document.querySelectorAll('input[name="conditions"]');
    condNodes.forEach((n) =>
        n.addEventListener("change", () => {
            validateConditions();
            setSubmitEnabled(false);
            document.getElementById("formStatus").textContent = "";
        })
    );
}

/* ---------- Validate button handler ---------- */

function validateForm() {
    clearAllErrors();
    setSubmitEnabled(false);

    let ok = true;

    if (!validateFirstName()) ok = false;
    if (!validateMiddleInitial()) ok = false;
    if (!validateLastName()) ok = false;
    if (!validateDob()) ok = false;
    if (!validatePatientId()) ok = false;

    if (!validateEmail()) ok = false;
    if (!validatePhone()) ok = false;

    if (!validateAddress1()) ok = false;
    if (!validateAddress2()) ok = false;
    if (!validateCity()) ok = false;
    if (!validateState()) ok = false;
    if (!validateZip()) ok = false;

    if (!validateConditions()) ok = false;
    if (!validateRadios("gender", "genderError", "Gender")) ok = false;
    if (!validateRadios("vaccinated", "vaccinatedError", "Vaccinated")) ok = false;
    if (!validateRadios("insurance", "insuranceError", "Insurance")) ok = false;

    if (!validateUserId()) ok = false;
    if (!validatePasswords()) ok = false;

    if (!validateSymptoms()) ok = false;

    const status = document.getElementById("formStatus");

    if (ok) {
        setSubmitEnabled(true);
        if (status) {
            status.textContent = "All fields look good. You may now submit the form.";
            status.className = "status-message success";
        }
    } else {
        if (status) {
            status.textContent = "Please fix the highlighted errors before submitting.";
            status.className = "status-message error-global";
        }
    }

    return ok;
}

/* ---------- Review button handler ---------- */

function reviewData() {
    const output = document.getElementById("reviewArea");
    if (!output) return;

    const getRadio = (name) => {
        const checked = document.querySelector(`input[name="${name}"]:checked`);
        return checked ? checked.value : "(none)";
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
        // password deliberately not displayed
    };

    output.innerHTML = `
        <table class="review-table">
            <tr><th colspan="2">PLEASE REVIEW THIS INFORMATION</th></tr>
            <tr><td>First, MI, Last Name</td><td>${data.firstName} ${data.middleInitial} ${data.lastName}</td></tr>
            <tr><td>Date of Birth</td><td>${data.dob}</td></tr>
            <tr><td>Email</td><td>${data.email}</td></tr>
            <tr><td>Phone</td><td>${data.phone}</td></tr>
            <tr><td>Address</td>
                <td>
                    ${data.address1}<br>
                    ${data.address2 ? data.address2 + "<br>" : ""}
                    ${data.city}, ${data.state} ${data.zip}
                </td>
            </tr>
            <tr><td>Conditions</td><td>${data.conditions}</td></tr>
            <tr><td>Gender</td><td>${data.gender}</td></tr>
            <tr><td>Vaccinated?</td><td>${data.vaccinated}</td></tr>
            <tr><td>Insurance?</td><td>${data.insurance}</td></tr>
            <tr><td>Desired Salary</td><td>${data.salary}</td></tr>
            <tr><td>Described Symptoms</td><td>${data.symptoms || "(none)"} </td></tr>
            <tr><td>User ID</td><td>${data.userId}</td></tr>
        </table>
    `;
}
