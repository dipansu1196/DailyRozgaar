<script>
// Initialize the modal programmatically to ensure behavior is consistent
var passwordModal = new bootstrap.Modal(document.getElementById('passwordModal'), {
    backdrop: 'static', 
    keyboard: false    
});    
</script>
<script>
document.getElementById('customerlogin').addEventListener('submit', function (event) {
event.preventDefault();

const customerPhoneNumber = document.getElementById('customerPhoneNumber').value;
const customerpassword = document.getElementById('customerpassword').value;

fetch('/customerloginaction', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customerPhoneNumber, customerpassword })
})
.then(response => response.json())
.then(data => {
    if (data.success) {
        window.location.href = data.redirectUrl;
    } else {
        
        document.getElementById('loginerror').style.display = 'block';
        document.getElementById('submitButton').style.marginTop="20px";
    }
})
.catch(err => console.error('Error:', err));
});

</script>
<script>
document.getElementById('workerlogin').addEventListener('submit', function (event) {
    event.preventDefault();

    const workerPhoneNumber = document.getElementById('workerPhoneNumber').value;
    const workerpassword = document.getElementById('workerpassword').value;
    const dob = document.getElementById('dob').value;
    fetch('/workerloginaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerPhoneNumber, workerpassword,dob})
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = data.redirectUrl;
        } else {
            
            document.getElementById('loginerror').style.display = 'block';
            document.getElementById('submitButton').style.marginTop="20px";
        }
    })
    .catch(err => console.error('Error:', err));
});

</script>
<script>

function moveSlider(activeId) {
        const workerForm = document.getElementById('workerFormdiv');
        const customerForm = document.getElementById('customerFormdiv');
        const slider = document.querySelector('.slider');

        if (activeId === 'worker') {
            workerForm.style.display = 'block';
            customerForm.style.display = 'none';
            slider.style.transform = 'translateX(0)';
        } else if (activeId === 'customer') {
            workerForm.style.display = 'none';
            customerForm.style.display = 'block';
            slider.style.transform = 'translateX(100%)';
        }

        // Update button active state
        document.querySelectorAll('.toggle-group .btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`label[for="${activeId}"]`).classList.add('active');
    }
</script>
<script>
function checkWorkerFormValidity() {
    const dobInput = document.getElementById('dob');
    const workerPhoneNumber=document.getElementById('workerPhoneNumber');
    const workerpassword=document.getElementById('workerpassword');
    const workerlogin=document.getElementById('workerloginbutton');

    const isValid   =   dobInput.classList.contains('is-valid') &&
                        workerPhoneNumber.classList.contains('is-valid') &&
                        workerpassword.classList.contains('is-valid');
            
                        workerlogin.disabled = !isValid; 

}
function checkcustomerFormValidity() {
    const customerPhoneNumber=document.getElementById('customerPhoneNumber');
    const customerpassword=document.getElementById('customerpassword');
    const customerlogin=document.getElementById('customerloginbutton');

    const isValid   =   customerPhoneNumber.classList.contains('is-valid') &&
                        customerpassword.classList.contains('is-valid');
            
                        customerlogin.disabled = !isValid; 

}


document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('dob').addEventListener('blur', function() {
        validateDOB();
        checkWorkerFormValidity();
    });
    document.getElementById('workerPhoneNumber').addEventListener('blur', function() {
        validatePhoneNumber('workerPhoneNumber', 'workerPhoneError');
        checkWorkerFormValidity();
    });
    document.getElementById('workerpassword').addEventListener('blur', function() {
        validateWorkerPassword();
        checkWorkerFormValidity();
    });


    document.getElementById('customerpassword').addEventListener('blur', function() {
        validatePassword();
        checkcustomerFormValidity();
    });

    document.getElementById('customerPhoneNumber').addEventListener('blur', function() {
        validatePhoneNumber('customerPhoneNumber', 'customerPhoneError');
        checkcustomerFormValidity();
    });
    checkWorkerFormValidity();
});
</script>
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
<script>
document.addEventListener("DOMContentLoaded", function () {
    const languageSelect = document.getElementById("languageSelect");

    // Load the saved language from localStorage (default is 'en')
    const savedLanguage = localStorage.getItem("language") || "en";
    languageSelect.value = savedLanguage;

    // Function to switch language
    function switchLanguage() {
        const selectedLanguage = languageSelect.value;

        // Save the selected language in localStorage
        localStorage.setItem("language", selectedLanguage);

        // Update the page text based on the selected language
        const elements = document.querySelectorAll("[data-en]");
        elements.forEach(function (element) {
            element.textContent = element.getAttribute(`data-${selectedLanguage}`);
            element.placeholder = element.getAttribute(`data-${selectedLanguage}`);
        });
    }

    // Apply the saved language on page load
    switchLanguage();

    // Change language when the user selects a different option
    languageSelect.addEventListener("change", function () {
        console.log("Language selected:", languageSelect.value);
        switchLanguage();
    });
});
</script>
<script>

function validatePhoneNumber(inputId, errorId) {
    const phoneInput = document.getElementById(inputId);
    const phoneError = document.getElementById(errorId);
    const phoneNumber = phoneInput.value;

    const phonePattern = /^[5-9][0-9]{9}$/;

    if (phoneNumber.length !== 10) {
        phoneError.style.display = 'block'; 
        phoneInput.classList.add('is-invalid'); 
        phoneInput.classList.remove('is-valid'); 
    } else if (!phonePattern.test(phoneNumber)) {
        phoneError.style.display = 'block'; 
        phoneInput.classList.add('is-invalid'); 
        phoneInput.classList.remove('is-valid'); 
    } else {
        phoneError.style.display = 'none';
        phoneInput.classList.remove('is-invalid'); 
        phoneInput.classList.add('is-valid'); 
    }
    checkWorkerFormValidity();
    checkcustomerFormValidity();
}

document.getElementById('workerPhoneNumber').addEventListener('blur', () => validatePhoneNumber('workerPhoneNumber', 'workerPhoneError'));
document.getElementById('customerPhoneNumber').addEventListener('blur', () => validatePhoneNumber('customerPhoneNumber', 'customerPhoneError'));

</script>
<script>
function validateDOB() {
const dobInput = document.getElementById('dob');
const dobError = document.getElementById('dobError');
const dobValue = dobInput.value;

if (dobValue) {

    const currentDate = new Date();
    const dob = new Date(dobValue);
    
    let age = currentDate.getFullYear() - dob.getFullYear();
    const m = currentDate.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && currentDate.getDate() < dob.getDate())) {
        age--; 
    }

    if (age < 18) {
        dobError.style.display = 'block'; 
        dobInput.classList.add('is-invalid'); 
        dobInput.classList.remove('is-valid'); 
    } else {
        dobError.style.display = 'none'; 
        dobInput.classList.add('is-valid'); 
        dobInput.classList.remove('is-invalid'); 
    }
} else {
    
    dobInput.classList.remove('is-invalid', 'is-valid'); 
    dobError.style.display = 'none'; 
}
checkWorkerFormValidity();
}

document.getElementById('dob').addEventListener('blur', validateDOB); 
document.getElementById('dob').addEventListener('input', validateDOB); 

</script>
<script>
function validateWorkerPassword() {
const passwordInput = document.getElementById('workerpassword');
const passwordError = document.getElementById('workerpassworderror');
const passwordValue = passwordInput.value;

// Regular expression to check for exactly 12 digits
const passwordPattern = /^\d{12}$/;

if (!passwordPattern.test(passwordValue)) {
    passwordError.style.display = 'block'; // Show error
    passwordInput.classList.add('is-invalid'); // Add invalid class
    passwordInput.classList.remove('is-valid'); // Remove valid class
} else {
    passwordError.style.display = 'none'; // Hide error
    passwordInput.classList.remove('is-invalid'); // Remove invalid class
    passwordInput.classList.add('is-valid'); // Add valid class
}
checkWorkerFormValidity();
}

const passwordInput = document.getElementById('workerpassword');
passwordInput.addEventListener('change', validateWorkerPassword);
</script>
<script>
function validatePassword() {
const passwordInput = document.getElementById('customerpassword');
const passwordError = document.getElementById('customerpassworderror');
const password = passwordInput.value;

// Password validation regex
const passwordPattern = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[^\s]{8,}$/;

if (!passwordPattern.test(password)) {
    passwordError.style.display = 'block'; 
    passwordInput.classList.add('is-invalid'); 
    passwordInput.classList.remove('is-valid'); 
} else {
    passwordError.style.display = 'none'; 
    passwordInput.classList.remove('is-invalid'); 
    passwordInput.classList.add('is-valid'); 
}
checkcustomerFormValidity();
}

const passwordinput = document.getElementById('customerpassword');
passwordinput.addEventListener('change', validatePassword);
</script>