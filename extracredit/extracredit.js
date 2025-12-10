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

// Continuing in next message...
