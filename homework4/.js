/* 
Program name: homework4.js
Author: Zach Scotton
Date created: 2025-11-20
Date last edited: 2025-11-30
Version: 4.0
Description: JavaScript for HW4 - Fetch API, Cookies, Local Storage, and all validations
*/

// Run when page loads
document.addEventListener("DOMContentLoaded", () => {
    setCurrentDate();
    initSlider();
    loadStatesFromFetch();
    loadConditionsFromFetch();
    checkForReturningUser();
    attachFieldEvents();
    attachValidateButton();
    attachResetButton();
    attachNotYouCheckbox();
});

// ========== DATE DISPLAY ==========
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
    
    // Add ordinal suffix
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
    });
}

// ========== FETCH API - Load States ==========
function loadStatesFromFetch() {
    const stateSelect = document.getElementById("state");
    
    // Using fetch to load states from external JSON file
    fetch("states.json")
        .then(response => {
            if (!response.ok) {
                throw new Error("Could not load states");
            }
            return response.json();
        })
        .then(data => {
            // Clear loading message
            stateSelect.innerHTML = '<option value="">-- Select State --</option>';
            
            // Add each state to dropdown
            data.states.forEach(state => {
                const option = document.createElement("option");
                option.value = state.code;
                option.textContent = state.code;
                stateSelect.appendChild(option);
            });
            
            // Load saved state if exists
            const savedState = localStorage.getItem("state");
            if (savedState) {
                stateSelect.value = savedState;
            }
        })
        .catch(error => {
            console.error("Error loading states:", error);
            stateSelect.innerHTML = '<option value="">Error loading states</option>';
        });
}

// ========== FETCH API - Load Conditions ==========
function loadConditionsFromFetch() {
    const container = document.getElementById("conditions-container");
    
    // Using fetch to load conditions from external JSON file
    fetch("conditions.json")
        .then(response => {
            if (!response.ok) {
                throw new Error("Could not load conditions");
            }
            return response.json();
        })
        .then(data => {
            // Clear loading message
            container.innerHTML = "";
            
            // Add each condition as checkbox
            data.conditions.forEach(condition => {
                const label = document.createElement("label");
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.name = "conditions";
                checkbox.value = condition;
                
                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(" " + condition));
                container.appendChild(label);
                container.appendChild(document.createElement("br"));
                
                // Load saved checkbox state
                const savedChecked = localStorage.getItem("condition_" + condition);
                if (savedChecked === "true") {
                    checkbox.checked = true;
                }
                
                // Save when changed
                checkbox.addEventListener("change", () => {
                    saveToLocalStorage("condition_" + condition, checkbox.checked);
                });
            });
        })
        .catch(error => {
            console.error("Error loading conditions:", error);
            container.innerHTML = "Error loading conditions";
        });
}

// ========== COOKIES ==========
// Set a cookie
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

// Get a cookie
function getCookie(name) {
    const cookieName = name + "=";
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i];
        while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(cookieName) === 0) {
            return cookie.substring(cookieName.length, cookie.length);
        }
    }
    return "";
}

// Delete a cookie
function deleteCookie(name) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

// Check if user is returning
function checkForReturningUser() {
    const firstName = getCookie("firstName");
    const welcomeMsg = document.getElementById("welcome-msg");
    const notYouSection = document.getElementById("not-you-section");
    const cookieNameDisplay = document.getElementById("cookie-name-display");
    
    if (firstName) {
        // Returning user
        welcomeMsg.textContent = "Welcome back, " + firstName + "!";
        welcomeMsg.style.color = "#27ae60";
        welcomeMsg.style.fontWeight = "bold";
        
        // Show "Not you?" option
        notYouSection.style.display = "block";
        cookieNameDisplay.textContent = firstName;
        
        // Load all saved data from localStorage
        loadAllFromLocalStorage();
    } else {
        // New user
        welcomeMsg.textContent = "Welcome, New User!";
        welcomeMsg.style.color = "#3498db";
        welcomeMsg.style.fontWeight = "bold";
    }
}

// ========== LOCAL STORAGE ==========
// Save to localStorage
function saveToLocalStorage(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (e) {
        console.error("Error saving to localStorage:", e);
    }
}

// Load from localStorage
function loadFromLocalStorage(key) {
    try {
        return localStorage.getItem(key);
    } catch (e) {
        console.error("Error loading from localStorage:", e);
        return null;
    }
}

// Load all form data from localStorage
function loadAllFromLocalStorage() {
    // Load text inputs
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
            
            // Update slider display if it's the salary
            if (field === "salaryRange") {
                document.getElementById("salaryValue").textContent = 
                    "$" + Number(value).toLocaleString("en-US");
            }
        }
    });
    
    // Load radio buttons
    const radioGroups = ["gender", "vaccinated", "insurance"];
    radioGroups.forEach(group => {
        const savedValue = loadFromLocalStorage(group);
        if (savedValue) {
            const radio = document.querySelector(`input[name="${group}"][value="${savedValue}"]`);
            if (radio) radio.checked = true;
        }
    });
}

// Clear all localStorage
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
            // User says "not me" - clear everything
            deleteCookie("firstName");
            clearAllLocalStorage();
            
            // Reset form
            document.getElementById("patientForm").reset();
            
            // Update welcome message
            document.getElementById("welcome-msg").textContent = "Welcome, New User!";
            document.getElementById("welcome-msg").style.color = "#3498db";
            
            // Hide "Not you?" section
            document.getElementById("not-you-section").style.display = "none";
            
            // Reload states and conditions
            loadStatesFromFetch();
            loadConditionsFromFetch();
        }
    });
}

// ========== FIELD VALIDATION & SAVING ==========
function attachFieldEvents() {
    // Text fields - save on blur
    const textFields = [
        "firstName", "middleInitial", "lastName", "dob", 
        "email", "phone", "address1", "address2", 
        "city", "zip", "userId", "symptoms"
    ];
    
    textFields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.addEventListener("blur", () => {
                // Don't save passwords to localStorage (security)
                if (!fieldId.includes("password")) {
                    saveToLocalStorage(fieldId, element.value);
                }
            });
        }
    });
    
    // State dropdown
    const stateSelect = document.getElementById("state");
    if (stateSelect) {
        stateSelect.addEventListener("change", () => {
            saveToLocalStorage("state", stateSelect.value);
        });
    }
    
    // Radio buttons
    const radioGroups = ["gender", "vaccinated", "insurance"];
    radioGroups.forEach(group => {
        const radios = document.querySelectorAll(`input[name="${group}"]`);
        radios.forEach(radio => {
            radio.addEventListener("change", () => {
                if (radio.checked) {
                    saveToLocalStorage(group, radio.value);
                }
            });
        });
    });
    
    // Auto-format phone
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
    
    // Auto-format Patient ID
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
}

// ========== VALIDATE BUTTON ==========
function attachValidateButton() {
    const validateBtn = document.getElementById("validateBtn");
    const submitBtn = document.getElementById("submitBtn");
    const form = document.getElementById("patientForm");
    
    if (!validateBtn) return;
    
    validateBtn.addEventListener("click", () => {
        // Check if form is valid
        if (form.checkValidity()) {
            // Check if passwords match
            const pw1 = document.getElementById("password1").value;
            const pw2 = document.getElementById("password2").value;
            
            if (pw1 !== pw2) {
                alert("Passwords do not match!");
                return;
            }
            
            // All good - enable submit button
            submitBtn.disabled = false;
            alert("Form validated! You may now submit.");
            
            // Save first name to cookie if "Remember Me" is checked
            const rememberMe = document.getElementById("rememberMe");
            const firstName = document.getElementById("firstName").value;
            
            if (rememberMe && rememberMe.checked && firstName) {
                setCookie("firstName", firstName, 2); // 2 days (48 hours)
            }
        } else {
            // Show validation errors
            form.reportValidity();
        }
    });
}

// ========== RESET BUTTON ==========
function attachResetButton() {
    const resetBtn = document.getElementById("resetBtn");
    const submitBtn = document.getElementById("submitBtn");
    const rememberMe = document.getElementById("rememberMe");
    
    if (!resetBtn) return;
    
    resetBtn.addEventListener("click", () => {
        // Disable submit button
        submitBtn.disabled = true;
        
        // If "Remember Me" is unchecked, clear cookie and localStorage
        if (rememberMe && !rememberMe.checked) {
            deleteCookie("firstName");
            clearAllLocalStorage();
        }
    });
}
