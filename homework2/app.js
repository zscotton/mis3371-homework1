/* 
  Program: app.js (HW2)
  Author: Zach Scotton
  Desc: Small helpers for date banner, slider text, password checks, and Review rendering.
*/

document.addEventListener('DOMContentLoaded', () => {
  setToday();
  setDOBLimits();
  wireSlider();
  wirePasswords();
  wireUserIdNormalize();
  document.getElementById('reviewBtn').addEventListener('click', onReview);
});

function setToday() {
  const now = new Date();
  const opts = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
  document.getElementById('today-date').textContent = now.toLocaleDateString(undefined, opts);
}

function setDOBLimits() {
  const dob = document.getElementById('dob');
  const today = new Date();
  const max = today.toISOString().slice(0, 10); // yyyy-mm-dd
  const minDate = new Date(today);
  minDate.setFullYear(today.getFullYear() - 120);
  const min = minDate.toISOString().slice(0, 10);
  dob.max = max;
  dob.min = min;
}

function wireSlider() {
  const slider = document.getElementById('salary');
  const out = document.getElementById('salaryOut');
  const fmt = n => `$${Number(n).toLocaleString()}`;
  const update = () => out.textContent = fmt(slider.value);
  slider.addEventListener('input', update);
  update();
}

function wirePasswords() {
  const pw = document.getElementById('pw');
  const pw2 = document.getElementById('pw2');
  const user = document.getElementById('user_id');
  const first = document.getElementById('firstName');
  const last = document.getElementById('lastName');
  const pwErr = document.getElementById('pwError');
  const pw2Err = document.getElementById('pw2Error');

  function checkStrength() {
    // built-in pattern handles most rules; add extra checks here
    const val = pw.value;
    const lowerUser = user.value.toLowerCase();
    const lowerFirst = first.value.toLowerCase();
    const lowerLast = last.value.toLowerCase();

    let msg = '';
    if (val && lowerUser && val.toLowerCase().includes(lowerUser)) msg = 'Password cannot contain your user id.';
    if (!msg && lowerFirst && val.toLowerCase().includes(lowerFirst)) msg = 'Password cannot contain your first name.';
    if (!msg && lowerLast && val.toLowerCase().includes(lowerLast)) msg = 'Password cannot contain your last name.';

    pw.setCustomValidity(msg);
    pwErr.textContent = msg;
    return msg === '';
  }

  function checkMatch() {
    let msg = '';
    if (pw2.value && pw.value !== pw2.value) msg = 'Passwords do not match.';
    pw2.setCustomValidity(msg);
    pw2Err.textContent = msg;
    return msg === '';
  }

  pw.addEventListener('input', () => { checkStrength(); checkMatch(); });
  pw2.addEventListener('input', checkMatch);
}

function wireUserIdNormalize() {
  const user = document.getElementById('user_id');
  user.addEventListener('blur', () => {
    user.value = user.value.toLowerCase();
  });
}

function onReview() {
  const form = document.getElementById('regForm');

  // Let the browser show native messages if something basic is wrong
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  // Extra custom checks already wired (password strength & match).
  const zipRaw = document.getElementById('zip').value || '';
  const zipShort = zipRaw.replace(/[^\d]/g, '').slice(0,5); // truncate to 5

  // Gather checkbox values
  const conds = [...document.querySelectorAll('input[name="cond"]:checked')].map(c => c.value);
  const condText = conds.length ? conds.join(', ') : 'None selected';

  // Review HTML (kept simple; table for tidy alignment)
  const review = `
    <table class="form-table">
      <tr><td><strong>First, MI, Last</strong></td>
          <td>${val('firstName')} ${val('mi')} ${val('lastName')}</td></tr>
      <tr><td><strong>Date of Birth</strong></td><td>${val('dob')}</td></tr>

      <tr><td><strong>Email</strong></td><td>${val('email')}</td></tr>
      <tr><td><strong>Phone</strong></td><td>${val('phone')}</td></tr>

      <tr><td><strong>Address</strong></td><td>
        ${val('addr1')}<br>${val('addr2')}<br>
        ${val('city')}, ${val('state')} ${zipShort}
      </td></tr>

      <tr><td><strong>Conditions</strong></td><td>${condText}</td></tr>
      <tr><td><strong>Gender</strong></td><td>${radio('gender')}</td></tr>
      <tr><td><strong>Vaccinated</strong></td><td>${radio('vax')}</td></tr>
      <tr><td><strong>Insurance</strong></td><td>${radio('ins')}</td></tr>

      <tr><td><strong>Desired Salary</strong></td><td>${document.getElementById('salaryOut').textContent}</td></tr>
      <tr><td><strong>Symptoms</strong></td><td>${escapeHTML(document.getElementById('symptoms').value)}</td></tr>

      <tr><td><strong>User ID</strong></td><td>${val('user_id').toLowerCase()}</td></tr>
      <tr><td><strong>Password</strong></td><td>(hidden)</td></tr>
    </table>
  `;

  document.getElementById('reviewContent').innerHTML = review;

  // helpers
  function val(id) { return escapeHTML(document.getElementById(id).value.trim()); }
  function radio(name) {
    const r = document.querySelector(`input[name="${name}"]:checked`);
    return r ? escapeHTML(r.value) : '';
  }
  function escapeHTML(s) {
    return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
}
