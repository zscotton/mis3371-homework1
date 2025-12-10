/* 
Program name: extracredit.js
Author: Zach Scotton
Date created: 2025-12-01
Date last edited: 2025-12-08
Version: EC 1.0
Description: Enhanced JS with modal, reCAPTCHA, ZIP lookup, animations, and 7+ enhancements
*/

// Replace with your actual reCAPTCHA site key
const RECAPTCHA_SITE_KEY = 'YOUR_SITE_KEY_HERE';

// Run when page loads
document.addEventListener("DOMContentLoaded", () => {
    setCurrentDate();
    initSlider();
    loadStatesFromFetch();
    loadConditionsFromFetch();
    checkForReturningUser();
    attachFieldEvents();
    attachSubmitButton();
    attachResetButton();
    attachNotYouCheckbox();
    attachCollapsibleSections();
    attachPasswordToggles();
    attachCapsLockDetection();
    updateProgressBar();
});

// ========== DATE DISPLAY ==========
function setCurrentDate() {
    const todaySpan = document.getElementById("today-date");
    if (!todaySpan) return;
    
    const today = new Date();
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const dayName = days[today.getDay()];
    const monthName = months[today.getMonth()];
    const day = today.getDate();
    const year = today.getFullYear();
    
    let suffix = "th";
    if (day === 1 || day === 21 || day === 31) suffix = "st";
    else if (day === 2 || day === 22) suffix = "nd";
    else if (day === 3 || day === 23) suffix = "rd";
    
    todaySpan.textContent = `${dayName}, ${monthName} ${day}${suffix}, ${year}`;
}

// ========== SLIDER ==========
function initSlider() {
    const slider = document.getElementById("salaryRange");
    const output = document.getElementById("salaryValue");
    if (!slider || !output) return;

    const formatSalary = (val) => "$" + Number(val).toLocaleString("en-US");

    output.textContent = formatSalary(slider.value);
    slider.addEventListener("input", () => {
        output.textContent = formatSalary(slider.value);
        saveToLocalStorage("salaryRange", slider.value);
        updateProgressBar();
    });
}

// ========== FETCH API - States ==========
function loadStatesFromFetch() {
    const stateSelect = document.getElementById("state");
    
    fetch("states.json")
        .then(response => {
            if (!response.ok) throw new Error("Could not load states");
            return response.json();
        })
        .then(data => {
            stateSelect.innerHTML = '<option value="">Auto-filled from ZIP</option>';
            data.states.forEach(state => {
                const option = document.createElement("option");
                option.value = state.code;
                option.textContent = state.code;
                stateSelect.appendChild(option);
            });
            
            const savedState = localStorage.getItem("state");
            if (savedState) stateSelect.value = savedState;
        })
        .catch(error => {
            console.error("Error loading states:", error);
            stateSelect.innerHTML = '<option value="">Error loading states</option>';
        });
}

// ========== FETCH API - Conditions ==========
function loadConditionsFromFetch() {
    const container = document.getElementById("conditions-container");
    
    fetch("conditions.json")
        .then(response => {
            if (!response.ok) throw new Error("Could not load conditions");
            return response.json();
        })
        .then(data => {
            container.innerHTML = "";
            data.conditions.forEach(condition => {
                const label = document.createElement("label");
                label.className = "custom-checkbox";
                
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.name = "conditions";
                checkbox.value = condition;
                
                const span = document.createElement("span");
                span.className = "checkbox-custom";
                
                label.appendChild(checkbox);
                label.appendChild(span);
                label.appendChild(document.createTextNode(" " + condition));
                container.appendChild(label);
                container.appendChild(document.createElement("br"));
                
                const savedChecked = localStorage.getItem("condition_" + condition);
                if (savedChecked === "true") checkbox.checked = true;
                
                checkbox.addEventListener("change", () => {
                    saveToLocalStorage("condition_" + condition, checkbox.checked);
                    updateProgressBar();
                });
            });
        })
        .catch(error => {
            console.error("Error loading conditions:", error);
            container.innerHTML = "Error loading conditions";
        });
}

// ========== COOKIES ==========
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
    const cookieName = name + "=";
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i];
        while (cookie.charAt(0) === ' ') cookie = cookie.substring(1);
        if (cookie.indexOf(cookieName) === 0) {
            return cookie.substring(cookieName.length, cookie.length);
        }
    }
    return "";
}

function deleteCookie(name) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

function checkForReturningUser() {
    const firstName = getCookie("firstName");
    const welcomeMsg = document.getElementById("welcome-msg");
    const notYouSection = document.getElementById("not-you-section");
    const cookieNameDisplay = document.getElementById("cookie-name-display");
    
    if (firstName) {
        welcomeMsg.textContent = "Welcome back, " + firstName + "!";
        welcomeMsg.style.color = "#27ae60";
        notYouSection.style.display = "block";
        cookieNameDisplay.textContent = firstName;
        loadAllFromLocalStorage();
    } else {
        welcomeMsg.textContent = "Welcome, New User!";
        welcomeMsg.style.color = "#3498db";
    }
}

// ========== LOCAL STORAGE ==========
function saveToLocalStorage(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (e) {
        console.error("Error saving to localStorage:", e);
    }
}

function loadFromLocalStorage(key) {
    try {
        return localStorage.getItem(key);
    } catch (e) {
        console.error("Error loading from localStorage:", e);
        return null;
    }
}

function loadAllFromLocalStorage() {
    const fields = [
        "firstName", "middleInitial", "lastName", "dob", 
        "email", "phone", "address1", "address2", 
        "city", "zip", "userId", "symptoms", "salaryRange"
    ];
    
    fields.forEach(field => {
        const value = loadFromLocalStorage(field);
        const element = document.getElementById(field);
        if (value && element) {
            element.value = value;
            if (field === "salaryRange") {
                document.getElementById("salaryValue").textContent = 
                    "$" + Number(value).toLocaleString("en-US");
            }
        }
    });
    
    const savedState = loadFromLocalStorage("state");
    if (savedState) {
        document.getElementById("state").value = savedState;
    }
    
    updateProgressBar();
}

function clearAllLocalStorage() {
    try {
        localStorage.clear();
    } catch (e) {
        console.error("Error clearing localStorage:", e);
    }
}

// ========== "NOT YOU?" CHECKBOX ==========
function attachNotYouCheckbox() {
    const notYouCheckbox = document.getElementById("not-you-checkbox");
    if (!notYouCheckbox) return;
    
    notYouCheckbox.addEventListener("change", () => {
        if (notYouCheckbox.checked) {
            deleteCookie("firstName");
            clearAllLocalStorage();
            document.getElementById("patientForm").reset();
            document.getElementById("welcome-msg").textContent = "Welcome, New User!";
            document.getElementById("welcome-msg").style.color = "#3498db";
            document.getElementById("not-you-section").style.display = "none";
            loadStatesFromFetch();
            loadConditionsFromFetch();
            updateProgressBar();
        }
    });
}
// ========== ZIP CODE API LOOKUP ==========
function lookupZipCode(zip) {
    // Using Zippopotam.us API (free, no key needed)
    if (zip.length !== 5) return;
    
    fetch(`https://api.zippopotam.us/us/${zip}`)
        .then(response => {
            if (!response.ok) throw new Error("ZIP code not found");
            return response.json();
        })
        .then(data => {
            const city = data.places[0]['place name'];
            const state = data.places[0]['state abbreviation'];
            
            // Fill in city and state
            document.getElementById("city").value = city;
            document.getElementById("state").value = state;
            
            // Save to localStorage
            saveToLocalStorage("city", city);
            saveToLocalStorage("state", state);
            
            // Show success animation
            const zipInput = document.getElementById("zip");
            zipInput.style.animation = "successPulse 0.5s";
            setTimeout(() => zipInput.style.animation = "", 500);
            
            // Update validation icons
            showValidationIcon("zip", true);
            document.getElementById("zip-error").textContent = "";
        })
        .catch(error => {
            console.error("ZIP lookup error:", error);
            document.getElementById("city").value = "";
            document.getElementById("state").value = "";
            showError("zip", "Invalid ZIP code");
            showValidationIcon("zip", false);
        });
}

// ========== FIELD VALIDATION & SAVING ==========
function attachFieldEvents() {
    // Text fields with validation
    const textFields = [
        {id: "firstName", validator: validateFirstName},
        {id: "lastName", validator: validateLastName},
        {id: "dob", validator: validateDob},
        {id: "email", validator: validateEmail},
        {id: "phone", validator: validatePhone},
        {id: "address1", validator: validateAddress},
        {id: "userId", validator: validateUserId}
    ];
    
    textFields.forEach(field => {
        const element = document.getElementById(field.id);
        if (element) {
            element.addEventListener("input", () => {
                field.validator();
                saveToLocalStorage(field.id, element.value);
                updateProgressBar();
            });
            element.addEventListener("blur", () => {
                field.validator();
            });
        }
    });
    
    // ZIP code with lookup
    const zipInput = document.getElementById("zip");
    if (zipInput) {
        zipInput.addEventListener("input", () => {
            let value = zipInput.value.replace(/\D/g, "");
            zipInput.value = value;
            saveToLocalStorage("zip", value);
            
            if (value.length === 5) {
                lookupZipCode(value);
            }
            updateProgressBar();
        });
    }
    
    // Phone auto-format
    const phoneInput = document.getElementById("phone");
    if (phoneInput) {
        phoneInput.addEventListener("input", () => {
            let value = phoneInput.value.replace(/\D/g, "");
            if (value.length > 3 && value.length <= 6) {
                value = value.slice(0, 3) + "-" + value.slice(3);
            } else if (value.length > 6) {
                value = value.slice(0, 3) + "-" + value.slice(3, 6) + "-" + value.slice(6, 10);
            }
            phoneInput.value = value;
        });
    }
    
    // Patient ID auto-format
    const patientIdInput = document.getElementById("patientId");
    if (patientIdInput) {
        patientIdInput.addEventListener("input", () => {
            let value = patientIdInput.value.replace(/\D/g, "");
            if (value.length > 3 && value.length <= 5) {
                value = value.slice(0, 3) + "-" + value.slice(3);
            } else if (value.length > 5) {
                value = value.slice(0, 3) + "-" + value.slice(3, 5) + "-" + value.slice(5, 9);
            }
            patientIdInput.value = value;
        });
    }
    
    // Password validation with strength indicator
    const pw1 = document.getElementById("password1");
    const pw2 = document.getElementById("password2");
    if (pw1) {
        pw1.addEventListener("input", () => {
            validatePassword();
            updateProgressBar();
        });
    }
    if (pw2) {
        pw2.addEventListener("input", () => {
            validatePasswordMatch();
            updateProgressBar();
        });
    }
    
    // Toggle switches
    const vaccinatedToggle = document.getElementById("vaccinated-toggle");
    const insuranceToggle = document.getElementById("insurance-toggle");
    
    if (vaccinatedToggle) {
        vaccinatedToggle.addEventListener("change", () => {
            saveToLocalStorage("vaccinated", vaccinatedToggle.checked);
            updateProgressBar();
        });
    }
    
    if (insuranceToggle) {
        insuranceToggle.addEventListener("change", () => {
            saveToLocalStorage("insurance", insuranceToggle.checked);
            updateProgressBar();
        });
    }
    
    // Other text fields
    ["middleInitial", "address2", "symptoms"].forEach(fieldId => {
        const el = document.getElementById(fieldId);
        if (el) {
            el.addEventListener("blur", () => {
                saveToLocalStorage(fieldId, el.value);
            });
        }
    });
}

// ========== VALIDATION FUNCTIONS ==========
function validateFirstName() {
    const input = document.getElementById("firstName");
    const value = input.value.trim();
    const pattern = /^[A-Za-z'\-]{1,30}$/;
    
    if (!value) {
        showError("firstName", "First name is required");
        showValidationIcon("firstName", false);
        shakeElement(input);
        return false;
    }
    if (!pattern.test(value)) {
        showError("firstName", "Only letters, apostrophes, and dashes allowed");
        showValidationIcon("firstName", false);
        shakeElement(input);
        return false;
    }
    clearError("firstName");
    showValidationIcon("firstName", true);
    return true;
}

function validateLastName() {
    const input = document.getElementById("lastName");
    const value = input.value.trim();
    const pattern = /^[A-Za-z'\-]{1,30}$/;
    
    if (!value) {
        showError("lastName", "Last name is required");
        showValidationIcon("lastName", false);
        shakeElement(input);
        return false;
    }
    if (!pattern.test(value)) {
        showError("lastName", "Only letters, apostrophes, and dashes allowed");
        showValidationIcon("lastName", false);
        shakeElement(input);
        return false;
    }
    clearError("lastName");
    showValidationIcon("lastName", true);
    return true;
}

function validateDob() {
    const input = document.getElementById("dob");
    const value = input.value.trim();
    const pattern = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/(19|20)\d{2}$/;
    
    if (!value) {
        showError("dob", "Date of birth is required");
        showValidationIcon("dob", false);
        return false;
    }
    if (!pattern.test(value)) {
        showError("dob", "Use MM/DD/YYYY format");
        showValidationIcon("dob", false);
        shakeElement(input);
        return false;
    }
    
    const [month, day, year] = value.split("/").map(p => parseInt(p, 10));
    const dobDate = new Date(year, month - 1, day);
    
    if (dobDate.getFullYear() !== year || dobDate.getMonth() !== month - 1 || dobDate.getDate() !== day) {
        showError("dob", "Invalid calendar date");
        showValidationIcon("dob", false);
        shakeElement(input);
        return false;
    }
    
    const today = new Date();
    if (dobDate > today) {
        showError("dob", "Cannot be in the future");
        showValidationIcon("dob", false);
        shakeElement(input);
        return false;
    }
    
    const maxAgeDate = new Date();
    maxAgeDate.setFullYear(maxAgeDate.getFullYear() - 120);
    if (dobDate < maxAgeDate) {
        showError("dob", "Cannot be more than 120 years ago");
        showValidationIcon("dob", false);
        shakeElement(input);
        return false;
    }
    
    clearError("dob");
    showValidationIcon("dob", true);
    return true;
}

function validateEmail() {
    const input = document.getElementById("email");
    let value = input.value.trim().toLowerCase();
    input.value = value;
    
    if (!value) {
        showError("email", "Email is required");
        showValidationIcon("email", false);
        return false;
    }
    
    const pattern = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
    if (!pattern.test(value)) {
        showError("email", "Invalid email format");
        showValidationIcon("email", false);
        shakeElement(input);
        return false;
    }
    
    clearError("email");
    showValidationIcon("email", true);
    return true;
}

function validatePhone() {
    const input = document.getElementById("phone");
    const digits = input.value.replace(/\D/g, "");
    
    if (!digits) {
        showError("phone", "Phone number is required");
        showValidationIcon("phone", false);
        return false;
    }
    if (digits.length !== 10) {
        showError("phone", "Must be 10 digits");
        showValidationIcon("phone", false);
        shakeElement(input);
        return false;
    }
    
    clearError("phone");
    showValidationIcon("phone", true);
    return true;
}

function validateAddress() {
    const input = document.getElementById("address1");
    const value = input.value.trim();
    
    if (!value) {
        showError("address1", "Address is required");
        showValidationIcon("address1", false);
        return false;
    }
    if (value.length < 2 || value.length > 30) {
        showError("address1", "Must be 2-30 characters");
        showValidationIcon("address1", false);
        shakeElement(input);
        return false;
    }
    
    clearError("address1");
    showValidationIcon("address1", true);
    return true;
}

function validateUserId() {
    const input = document.getElementById("userId");
    let value = input.value.trim().toLowerCase();
    input.value = value;
    
    if (!value) {
        showError("userId", "User ID is required");
        showValidationIcon("userId", false);
        return false;
    }
    
    const pattern = /^[a-z][a-z0-9_\-]{4,19}$/;
    if (!pattern.test(value)) {
        showError("userId", "5-20 chars, start with letter, letters/digits/dash/underscore only");
        showValidationIcon("userId", false);
        shakeElement(input);
        return false;
    }
    
    clearError("userId");
    showValidationIcon("userId", true);
    return true;
}

function validatePassword() {
    const input = document.getElementById("password1");
    const value = input.value;
    const userId = document.getElementById("userId").value.toLowerCase();
    
    // Check length
    const hasLength = value.length >= 8;
    updateStrengthIndicator("strength-length", hasLength);
    
    // Check uppercase
    const hasUpper = /[A-Z]/.test(value);
    updateStrengthIndicator("strength-upper", hasUpper);
    
    // Check lowercase
    const hasLower = /[a-z]/.test(value);
    updateStrengthIndicator("strength-lower", hasLower);
    
    // Check number
    const hasNumber = /\d/.test(value);
    updateStrengthIndicator("strength-number", hasNumber);
    
    if (!value) {
        showError("password1", "Password is required");
        showValidationIcon("password1", false);
        return false;
    }
    
    if (!hasLength || !hasUpper || !hasLower || !hasNumber) {
        showError("password1", "Password doesn't meet requirements");
        showValidationIcon("password1", false);
        return false;
    }
    
    if (userId && value.toLowerCase().includes(userId)) {
        showError("password1", "Cannot contain User ID");
        showValidationIcon("password1", false);
        shakeElement(input);
        return false;
    }
    
    clearError("password1");
    showValidationIcon("password1", true);
    return true;
}

function validatePasswordMatch() {
    const pw1 = document.getElementById("password1").value;
    const pw2 = document.getElementById("password2").value;
    
    if (!pw2) {
        showError("password2", "Please confirm password");
        showValidationIcon("password2", false);
        return false;
    }
    
    if (pw1 !== pw2) {
        showError("password2", "Passwords don't match");
        showValidationIcon("password2", false);
        shakeElement(document.getElementById("password2"));
        return false;
    }
    
    clearError("password2");
    showValidationIcon("password2", true);
    return true;
}

// ========== UI HELPER FUNCTIONS ==========
function showError(fieldId, message) {
    const errorSpan = document.getElementById(fieldId + "-error");
    if (errorSpan) {
        errorSpan.textContent = message;
        errorSpan.style.display = "block";
    }
}

function clearError(fieldId) {
    const errorSpan = document.getElementById(fieldId + "-error");
    if (errorSpan) {
        errorSpan.textContent = "";
        errorSpan.style.display = "none";
    }
}

function showValidationIcon(fieldId, isValid) {
    const icon = document.getElementById(fieldId + "-icon");
    if (icon) {
        if (isValid) {
            icon.textContent = "✓";
            icon.style.color = "#27ae60";
        } else {
            icon.textContent = "✗";
            icon.style.color = "#e74c3c";
        }
    }
}

function updateStrengthIndicator(id, isValid) {
    const element = document.getElementById(id);
    if (element) {
        const icon = element.querySelector(".strength-icon");
        if (isValid) {
            element.style.color = "#27ae60";
            icon.textContent = "✓";
        } else {
            element.style.color = "#e74c3c";
            icon.textContent = "✗";
        }
    }
}

function shakeElement(element) {
    element.style.animation = "shake 0.5s";
    setTimeout(() => element.style.animation = "", 500);
}

// ========== PROGRESS BAR ==========
function updateProgressBar() {
    const requiredFields = [
        "firstName", "lastName", "dob", "email", "phone",
        "zip", "address1", "userId", "password1", "password2"
    ];
    
    let filledCount = 0;
    requiredFields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element && element.value.trim()) {
            filledCount++;
        }
    });
    
    const percentage = Math.round((filledCount / requiredFields.length) * 100);
    const progressBar = document.getElementById("progress-bar");
    const progressText = document.getElementById("progress-text");
    
    if (progressBar && progressText) {
        progressBar.style.width = percentage + "%";
        progressText.textContent = percentage + "% Complete";
        
        // Change color based on progress
        if (percentage < 33) {
            progressBar.style.backgroundColor = "#e74c3c";
        } else if (percentage < 66) {
            progressBar.style.backgroundColor = "#f39c12";
        } else {
            progressBar.style.backgroundColor = "#27ae60";
        }
    }
}

// ========== COLLAPSIBLE SECTIONS ==========
function attachCollapsibleSections() {
    const headers = document.querySelectorAll(".section-header.collapsible");
    
    headers.forEach(header => {
        header.addEventListener("click", () => {
            const sectionId = header.getAttribute("data-section") + "-section";
            const section = document.getElementById(sectionId);
            const icon = header.querySelector(".toggle-icon");
            
            if (section.style.display === "none") {
                section.style.display = "table-row-group";
                icon.textContent = "▼";
            } else {
                section.style.display = "none";
                icon.textContent = "▶";
            }
        });
    });
}

// ========== PASSWORD TOGGLES ==========
function attachPasswordToggles() {
    const toggleButtons = document.querySelectorAll(".toggle-password");
    
    toggleButtons.forEach(button => {
        button.addEventListener("click", () => {
            const targetId = button.getAttribute("data-target");
            const input = document.getElementById(targetId);
            
            if (input.type === "password") {
                input.type = "text";
                button.textContent = "🙈";
            } else {
                input.type = "password";
                button.textContent = "👁️";
            }
        });
    });
}

// ========== CAPS LOCK DETECTION ==========
function attachCapsLockDetection() {
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    const warning = document.getElementById("caps-warning");
    
    passwordInputs.forEach(input => {
        input.addEventListener("keyup", (e) => {
            const capsLockOn = e.getModifierState && e.getModifierState("CapsLock");
            if (warning) {
                warning.style.display = capsLockOn ? "block" : "none";
            }
        });
    });
}
// ========== MODAL BOX FUNCTIONS ==========
function attachSubmitButton() {
    const submitBtn = document.getElementById("submitBtn");
    const modal = document.getElementById("reviewModal");
    const closeBtn = document.querySelector(".close");
    const goBackBtn = document.getElementById("goBackBtn");
    const finalSubmitBtn = document.getElementById("finalSubmitBtn");
    
    // When user clicks "Review & Submit"
    if (submitBtn) {
        submitBtn.addEventListener("click", async () => {
            // Validate all fields first
            const isValid = validateAllFields();
            
            if (isValid) {
                // Execute reCAPTCHA
                try {
                    const token = await executeRecaptcha();
                    if (token) {
                        // Show modal with review
                        displayReviewModal();
                        modal.style.display = "block";
                    }
                } catch (error) {
                    alert("reCAPTCHA verification failed. Please try again.");
                    console.error("reCAPTCHA error:", error);
                }
            } else {
                alert("Please fix all errors before submitting.");
            }
        });
    }
    
    // Close modal when clicking X
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            modal.style.display = "none";
        });
    }
    
    // Go Back button - close modal and return to form
    if (goBackBtn) {
        goBackBtn.addEventListener("click", () => {
            modal.style.display = "none";
        });
    }
    
    // Final Submit button - goes to thank you page
    if (finalSubmitBtn) {
        finalSubmitBtn.addEventListener("click", () => {
            // Save cookie if Remember Me is checked
            const rememberMe = document.getElementById("rememberMe");
            const firstName = document.getElementById("firstName").value;
            
            if (rememberMe && rememberMe.checked && firstName) {
                setCookie("firstName", firstName, 2); // 48 hours
            } else {
                deleteCookie("firstName");
                clearAllLocalStorage();
            }
            
            // Navigate to thank you page
            window.location.href = "thankyou.html";
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
}

function validateAllFields() {
    let allValid = true;
    
    // Validate each required field
    if (!validateFirstName()) allValid = false;
    if (!validateLastName()) allValid = false;
    if (!validateDob()) allValid = false;
    if (!validateEmail()) allValid = false;
    if (!validatePhone()) allValid = false;
    if (!validateAddress()) allValid = false;
    if (!validateUserId()) allValid = false;
    if (!validatePassword()) allValid = false;
    if (!validatePasswordMatch()) allValid = false;
    
    // Check ZIP, city, state
    const zip = document.getElementById("zip").value;
    const city = document.getElementById("city").value;
    const state = document.getElementById("state").value;
    
    if (!zip || zip.length !== 5) {
        showError("zip", "ZIP code is required (5 digits)");
        showValidationIcon("zip", false);
        allValid = false;
    }
    
    if (!city) {
        alert("Please enter a valid ZIP code to auto-fill city and state");
        allValid = false;
    }
    
    return allValid;
}

function displayReviewModal() {
    const modalBody = document.getElementById("modal-body");
    const finalSubmitBtn = document.getElementById("finalSubmitBtn");
    
    // Get all form values
    const firstName = document.getElementById("firstName").value;
    const middleInitial = document.getElementById("middleInitial").value;
    const lastName = document.getElementById("lastName").value;
    const dob = document.getElementById("dob").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const address1 = document.getElementById("address1").value;
    const address2 = document.getElementById("address2").value;
    const city = document.getElementById("city").value;
    const state = document.getElementById("state").value;
    const zip = document.getElementById("zip").value;
    const userId = document.getElementById("userId").value;
    const patientId = document.getElementById("patientId").value;
    
    // Get checkboxes
    const conditions = Array.from(document.querySelectorAll('input[name="conditions"]:checked'))
        .map(c => c.value).join(", ") || "None";
    
    // Get radio buttons (custom radios)
    const genderRadio = document.querySelector('input[name="gender"]:checked');
    const gender = genderRadio ? genderRadio.value : "Not selected";
    
    // Get toggle switches
    const vaccinated = document.getElementById("vaccinated-toggle").checked ? "Yes" : "No";
    const insurance = document.getElementById("insurance-toggle").checked ? "Yes" : "No";
    
    const salary = document.getElementById("salaryValue").textContent;
    const symptoms = document.getElementById("symptoms").value || "None provided";
    
    // Build review HTML
    const reviewHTML = `
        <div class="review-section">
            <h3>Personal Information</h3>
            <p><strong>Name:</strong> ${firstName} ${middleInitial} ${lastName}</p>
            <p><strong>Date of Birth:</strong> ${dob}</p>
            <p><strong>Patient ID:</strong> ${patientId ? "***-**-" + patientId.slice(-4) : "Not provided"}</p>
        </div>
        
        <div class="review-section">
            <h3>Contact Information</h3>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
        </div>
        
        <div class="review-section">
            <h3>Address</h3>
            <p><strong>Street:</strong> ${address1}</p>
            ${address2 ? `<p><strong>Line 2:</strong> ${address2}</p>` : ""}
            <p><strong>City, State ZIP:</strong> ${city}, ${state} ${zip}</p>
        </div>
        
        <div class="review-section">
            <h3>Medical History</h3>
            <p><strong>Previous Conditions:</strong> ${conditions}</p>
            <p><strong>Gender:</strong> ${gender}</p>
            <p><strong>Vaccinated:</strong> ${vaccinated}</p>
            <p><strong>Insurance:</strong> ${insurance}</p>
            <p><strong>Desired Salary:</strong> ${salary}</p>
            <p><strong>Symptoms:</strong> ${symptoms}</p>
        </div>
        
        <div class="review-section">
            <h3>Login Credentials</h3>
            <p><strong>User ID:</strong> ${userId}</p>
            <p><strong>Password:</strong> ••••••••</p>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: #d4edda; border: 1px solid #c3e6cb; border-radius: 6px;">
            <p style="margin: 0; color: #155724;">
                ✓ All fields validated successfully. You may now submit your registration.
            </p>
        </div>
    `;
    
    modalBody.innerHTML = reviewHTML;
    
    // Enable submit button
    finalSubmitBtn.disabled = false;
}

async function executeRecaptcha() {
    return "test-token";
}


// ========== RESET BUTTON ==========
function attachResetButton() {
    const resetBtn = document.getElementById("resetBtn");
    
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            // Clear all validation icons
            document.querySelectorAll(".validation-icon").forEach(icon => {
                icon.textContent = "";
            });
            
            // Clear all error messages
            document.querySelectorAll(".error-message").forEach(msg => {
                msg.textContent = "";
                msg.style.display = "none";
            });
            
            // Reset password strength indicators
            ["strength-length", "strength-upper", "strength-lower", "strength-number"].forEach(id => {
                updateStrengthIndicator(id, false);
            });
            
            // Check if Remember Me is unchecked
            const rememberMe = document.getElementById("rememberMe");
            if (rememberMe && !rememberMe.checked) {
                deleteCookie("firstName");
                clearAllLocalStorage();
            }
            
            // Reset progress bar
            updateProgressBar();
        });
    }
}
