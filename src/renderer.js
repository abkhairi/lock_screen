(function () {
  const usernameEl = document.getElementById('username');
  const elapsedEl = document.getElementById('elapsed');
  const form = document.getElementById('unlockForm');
  const passwordInput = document.getElementById('passwordInput');
  const errorMessage = document.getElementById('errorMessage');

  let lockTime = Date.now();

  let isChecking = false;

  function formatElapsed(ms) {
    const seconds = Math.floor(ms / 1000);

    if (seconds < 60) {
      return 'a few seconds';
    }

    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) {
      return minutes === 1
        ? '1 minute'
        : `${minutes} minutes`;
    }

    const hours = Math.floor(minutes / 60);

    return hours === 1
      ? '1 hour'
      : `${hours} hours`;
  }

  function updateElapsed() {
    let elapsed = Date.now() - lockTime;

    const minutes = Math.floor(elapsed / 60000);

    if (minutes >= 3) {
      lockTime = Date.now() - (1 * 60 * 1000);
      elapsed = Date.now() - lockTime;
    }

    elapsedEl.textContent = formatElapsed(elapsed);
  }

  async function init() {
    try {
      const config = await window.lockAPI.getConfig();

      usernameEl.textContent = config.lockedBy;
    } catch (err) {
      usernameEl.textContent = 'user';
    }

 
    updateElapsed();

  
    setInterval(updateElapsed, 1000);


    passwordInput.focus();
  }

  function showError() {
    errorMessage.classList.add('visible');

    passwordInput.classList.remove('shake');

    void passwordInput.offsetWidth;

    passwordInput.classList.add('shake');
  }

  function clearError() {
    errorMessage.classList.remove('visible');
    passwordInput.classList.remove('shake');
  }

  async function attemptUnlock() {

    if (isChecking) return;

    const attempt = passwordInput.value;


    if (!attempt) {
      passwordInput.focus();
      return;
    }

    isChecking = true;

    try {
      const ok = await window.lockAPI.checkPassword(attempt);

      if (ok) {
      
        await window.lockAPI.unlock();
      } else {
    
        showError();


        passwordInput.value = '';


        passwordInput.focus();
      }
    } finally {
      isChecking = false;
    }
  }


  form.addEventListener('submit', (event) => {
    event.preventDefault();

    attemptUnlock();
  });


  passwordInput.addEventListener('input', () => {
    if (errorMessage.classList.contains('visible')) {
      clearError();
    }
  });


  document.addEventListener('click', () => {
    passwordInput.focus();
  });

  init();
})();