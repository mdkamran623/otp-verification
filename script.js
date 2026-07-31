// demo correct OTP (in real app: backend validates)
const CORRECT_OTP = "123456";

// Check if already verified in this session
if (sessionStorage.getItem('otpVerified') === 'true') {
  // Clear the verification state on refresh
  sessionStorage.removeItem('otpVerified');
}

const inputs = [...document.querySelectorAll('.otp-input')];
const otpRow = document.getElementById('otpRow');
const msg = document.getElementById('msg');
const verifyBtn = document.getElementById('verifyBtn');
const resendBtn = document.getElementById('resendBtn');
let timerEl = document.getElementById('timer');
const successScreen = document.getElementById('successScreen');

// Reset all inputs on load
function resetInputs() {
  inputs.forEach(i => {
    i.value = '';
    i.classList.remove('filled');
  });
  otpRow.classList.remove('success', 'error');
  msg.textContent = '';
  msg.className = 'msg';
  successScreen.classList.remove('show');
  verifyBtn.disabled = false;
  verifyBtn.classList.remove('loading');
  inputs[0].focus();
}

// Call reset on page load (refresh)
window.addEventListener('load', () => {
  resetInputs();
  // Reset timer to initial state
  seconds = 30;
  timerEl.textContent = seconds;
  resendBtn.disabled = true;
  resendBtn.innerHTML = 'Resend in <span id="timer">30</span>s';
  timerEl = document.getElementById('timer');
  // Start the timer
  setTimeout(tick, 1000);
});

inputs.forEach((inp, idx) => {
  inp.addEventListener('input', e => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    e.target.value = val.slice(-1);
    if (val) {
      e.target.classList.add('filled');
      if (idx < inputs.length - 1) inputs[idx + 1].focus();
    } else {
      e.target.classList.remove('filled');
    }
    clearError();
    checkAutoSubmit();
  });

  inp.addEventListener('keydown', e => {
    if (e.key === 'Backspace' && !e.target.value && idx > 0) {
      inputs[idx - 1].focus();
    }
  });

  inp.addEventListener('paste', e => {
    e.preventDefault();
    const paste = (e.clipboardData.getData('text') || '').replace(/[^0-9]/g, '').slice(0, 6);
    if (!paste) return;
    paste.split('').forEach((ch, i) => {
      if (inputs[i]) {
        inputs[i].value = ch;
        inputs[i].classList.add('filled');
      }
    });
    const next = Math.min(paste.length, inputs.length) - 1;
    inputs[Math.max(next, 0)].focus();
    checkAutoSubmit();
  });
});

function clearError() {
  otpRow.classList.remove('error');
  msg.textContent = '';
  msg.className = 'msg';
}

function checkAutoSubmit() {
  if (inputs.every(i => i.value.length === 1)) {
    verifyOtp();
  }
}

function getCode() {
  return inputs.map(i => i.value).join('');
}

function verifyOtp() {
  const code = getCode();
  if (code.length < 6) {
    showError("Enter all 6 digits");
    return;
  }
  setLoading(true);

  setTimeout(() => {
    setLoading(false);
    if (code === CORRECT_OTP) {
      showSuccess();
      // Store verification state in session
      sessionStorage.setItem('otpVerified', 'true');
    } else {
      showError("Incorrect code. Try again.");
      inputs.forEach(i => { 
        i.value = '';
        i.classList.remove('filled'); 
      });
      inputs[0].focus();
    }
  }, 1100);
}

function showError(text) {
  otpRow.classList.remove('error');
  void otpRow.offsetWidth; // restart animation
  otpRow.classList.add('error');
  msg.textContent = text;
  msg.className = 'msg error';
}

function showSuccess() {
  otpRow.classList.add('success');
  successScreen.classList.add('show');
  // Disable inputs after success
  inputs.forEach(i => i.disabled = true);
}

function setLoading(state) {
  verifyBtn.classList.toggle('loading', state);
  verifyBtn.disabled = state;
}

function editNumber() {
  // Only allow edit if not verified
  if (successScreen.classList.contains('show')) {
    msg.textContent = "Cannot edit verified number";
    msg.className = 'msg error';
    return;
  }
  const num = prompt("Enter phone number:");
  if (num) {
    document.getElementById('phoneDisplay').textContent = num;
    // Reset inputs when number changes
    resetInputs();
  }
}

// resend countdown
let seconds = 30;

function tick() {
  seconds--;
  timerEl.textContent = seconds;
  if (seconds <= 0) {
    resendBtn.disabled = false;
    resendBtn.innerHTML = "Resend code";
  } else {
    setTimeout(tick, 1000);
  }
}

function resendOtp() {
  // Only allow resend if not verified
  if (successScreen.classList.contains('show')) {
    msg.textContent = "Already verified!";
    msg.className = 'msg success';
    return;
  }
  
  seconds = 30;
  resendBtn.disabled = true;
  resendBtn.innerHTML = 'Resend in <span id="timer">30</span>s';
  timerEl = document.getElementById('timer');
  setTimeout(tick, 1000);
  
  // Clear previous OTP
  inputs.forEach(i => {
    i.value = '';
    i.classList.remove('filled');
  });
  otpRow.classList.remove('error', 'success');
  msg.textContent = "New code sent!";
  msg.className = 'msg success';
  inputs[0].focus();
}

// Initial focus
inputs[0].focus();

// Handle page refresh or navigation
window.addEventListener('beforeunload', () => {
  sessionStorage.removeItem('otpVerified');
});
