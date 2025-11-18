/* 
Program: app.js (HW2)
Author: Zach Scotton
Date created: 2025-10-15
Date last edited: 2025-10-29
Version: 2.0
Description: JavaScript for date display, slider, password validation, and Review functionality
*/

document.addEventListener('DOMContentLoaded', () => {
  setToday();
  setDOBLimits();
  wireSlider();
  wirePasswords();
  wireUserIdNormalize();
  wirePhoneFormat();
  document.getElementById('reviewBtn').addEventListener('click', onReview);
});

// Display today's date with ordinal suffix
function setToday() {
  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const dayName = days[now.getDay()];
  const monthName = months[now.getMonth()];
  const date = now.getDate();
  const year = now.getFullYear();
  
  // Add ordinal suffix (st, nd, rd, th)
  let suffix = 'th';
  if (date === 1 || date === 21 || date === 31) suffix = 'st';
  else if (date === 2 || date === 22) suffix = 'nd';
  else if (date === 3 || date === 23) suffix = 'rd';
  
  document.getElementById('today-date').textContent = `${dayName}, ${monthName} ${date}${suffix}, ${year}`;
}

// Set min/max limits on DOB field (no future dates, no more than 120 years ago)
function setDOBLimits() {
  const dob = document.getElementById('dob');
  const today = new Date();
  const max = today.toISOString().slice(0, 10);
  
  const minDate = new Date(today);
  minDate.setFullYear(today.getFullYear() - 120);
  const min = minDate.toISOString().slice(0, 10);
  
  dob.max = max;
  dob.min = min;
}

// Wire up salary slider to show formatted value
function wireSlider() {
  const slider = document.getElementById('salary');
  const out = document.getElementById('salaryOut');
  
  const formatMoney = (n) => '$' + Number(n).toLocaleString('en-US');
  
  const update = () => {
    out.textContent = formatMoney(slider.value);
  };
  
  slider.addEventListener('input', update);
  update(); // Initialize
}

// Auto-format phone as user types: 000-000-0000
function wirePhoneFormat() {
  const phone = document.getElementById('phone');
  
  phone.addEventListener('input', () => {
    let value = phone.value.replace(/\D/g, ''); // Strip non-digits
    
    if (value.length > 3 && value.length <= 6) {
      value = value.slice(0, 3) + '-' + value.slice(3);
    } else if (value.length > 6) {
      value = value.slice(0, 3) + '-' + value.slice(3, 6) + '-' + value.slice(6, 10);
    }
    
    phone.value = value;
  });
}

// Password validation: check strength and match
function wirePasswords() {
  const pw = document.getElementById('pw');
  const pw2 = document.getElementById('pw2');
  const user = document.getElementById('user_id');
  const first = document.getElementById('firstName');
  const last = document.getElementById('lastName');
  const pwErr = document.getElementById('pwError');
  const pw2Err = document.getElementById('pw2Error');

  function checkStrength() {
    const val = pw.value;
    const lowerUser = user.value.toLowerCase();
    const lowerFirst = first.value.toLowerCase();
    const lowerLast = last.value.toLowerCase();

    let msg = '';
    
    // Check if password contains user ID or names
    if (val && lowerUser && val.toLowerCase().includes(lowerUser)) {
      msg = 'Password cannot contain your User ID.';
    } else if (val && lowerFirst && lowerFirst.length > 2 && val.toLowerCase().includes(lowerFirst)) {
      msg = 'Password cannot contain your first name.';
    } else if (val && lowerLast && lowerLast.length > 2 && val.toLowerCase().includes(lowerLast)) {
      msg = 'Password cannot contain your last name.';
    }

    pw.setCustomValidity(msg);
    pwErr.textContent = msg;
    return msg === '';
  }

  function checkMatch() {
    let msg = '';
    if (pw2.value && pw.value !== pw2.value) {
      msg = 'Passwords do not match.';
    }
    pw2.setCustomValidity(msg);
    pw2Err.textContent = msg;
    return msg === '';
  }

  pw.addEventListener('input', () => { 
    checkStrength(); 
    checkMatch(); 
  });
  
  pw2.addEventListener('input', checkMatch);
  user.addEventListener('input', checkStrength);
  first.addEventListener('input', checkStrength);
  last.addEventListener('input', checkStrength);
}

// Force user ID to lowercase on blur
function wireUserIdNormalize() {
  const user = document.getElementById('user_id');
  user.addEventListener('blur', () => {
    user.value = user.value.toLowerCase().trim();
  });
}

// Review button handler
function onReview() {
  const form = document.getElementById('regForm');

  // Check if form is valid using browser validation
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  // Truncate ZIP to 5 digits
  const zipRaw = document.getElementById('zip').value || '';
  const zipShort = zipRaw.replace(/[^\d]/g, '').slice(0, 5);

  // Gather checkbox values
  const conds = [...document.querySelectorAll('input[name="cond"]:checked')].map(c => c.value);
  const condText = conds.length ? conds.join(', ') : 'None selected';

  // Build review table
  const review = `
    <table class="review-table">
      <tr><th colspan="2">PLEASE REVIEW THIS INFORMATION</th></tr>
      
      <tr><td><strong>Name</strong></td>
          <td>${val('firstName')} ${val('mi')} ${val('lastName')}</td></tr>
      
      <tr><td><strong>Date of Birth</strong></td>
          <td>${val('dob')}</td></tr>

      <tr><td><strong>Patient ID</strong></td>
          <td>${document.getElementById('ssn').value ? '***-**-' + document.getElementById('ssn').value.slice(-4) : '(not provided)'}</td></tr>

      <tr><td><strong>Email</strong></td>
          <td>${val('email')}</td></tr>
      
      <tr><td><strong>Phone</strong></td>
          <td>${val('phone')}</td></tr>

      <tr><td><strong>Address</strong></td>
          <td>${val('addr1')}<br>
              ${val('addr2') ? val('addr2') + '<br>' : ''}
              ${val('city')}, ${val('state')} ${zipShort}</td></tr>

      <tr><th colspan="2">MEDICAL HISTORY</th></tr>
      
      <tr><td><strong>Conditions</strong></td>
          <td>${condText}</td></tr>
      
      <tr><td><strong>Gender</strong></td>
          <td>${radio('gender')}</td></tr>
      
      <tr><td><strong>Vaccinated</strong></td>
          <td>${radio('vax')}</td></tr>
      
      <tr><td><strong>Insurance</strong></td>
          <td>${radio('ins')}</td></tr>

      <tr><td><strong>Desired Salary</strong></td>
          <td>${document.getElementById('salaryOut').textContent}</td></tr>
      
      <tr><td><strong>Symptoms</strong></td>
          <td>${escapeHTML(document.getElementById('symptoms').value) || '(none provided)'}</td></tr>

      <tr><th colspan="2">LOGIN CREDENTIALS</th></tr>
      
      <tr><td><strong>User ID</strong></td>
          <td>${val('user_id').toLowerCase()}</td></tr>
      
      <tr><td><strong>Password</strong></td>
          <td>••••••••</td></tr>
    </table>
  `;

  document.getElementById('reviewContent').innerHTML = review;

  // Helper functions
  function val(id) { 
    return escapeHTML(document.getElementById(id).value.trim()); 
  }
  
  function radio(name) {
    const r = document.querySelector(`input[name="${name}"]:checked`);
    return r ? escapeHTML(r.value) : '(not selected)';
  }
  
  function escapeHTML(s) {
    return s.replace(/[&<>"']/g, c => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c]));
  }
}
