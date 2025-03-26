
document.getElementById('customerform').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting normally
    // Validate Subdivision select
    const subdivisionSelect = document.getElementById('subdivision');
    if (!subdivisionSelect.value || subdivisionSelect.value === 'Choose Subdivision ▼') {
        alert('Please select a subdivision!');
        return; // Prevent form submission
    }

    const formData = new FormData(this);
    
    fetch('/register-customer', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log("Received Data from Server:", data);
        if (data.status === 'existing') {
            console.log("Showing existing user modal");
            $('#existingUserModal').modal('show');
        } else if (data.status === 'success') {
            $('#accountcreated').modal('show');
        }
    })
    .catch(error => console.error('Error:', error));
});


let uploadedImage = null;

function validateImage() {
    const fileInput = document.getElementById("uploadImage");
    const imageError = document.getElementById("imageError");
    const file = fileInput.files[0];
    const uploadButton = document.querySelector('.custom-file-upload'); 
    const submitButton = document.getElementById("submitButton");
    const uploadimagetext=document.getElementById('uploadimagetext');
    const uploadedimagetext=document.getElementById('uploadedimagetext');


    uploadButton.style.backgroundColor = "#dfe3e9"; 
    uploadButton.style.borderColor = "black";  
    

    if (file) {
        if (file.size > 500 * 1024) { 
            imageError.style.display = 'block';
            fileInput.value = ""; 
            uploadedImage = null;
            uploadButton.style.backgroundColor = "#f8d7da"; 
            uploadButton.style.borderColor = "red"; 
            uploadimagetext.style.display='block';
            uploadedimagetext.style.display='none';
        } else {
            imageError.style.display = 'none';
            uploadedImage = file;
            uploadButton.style.backgroundColor = "#98FB98"; 
            uploadButton.style.borderColor = "#28a745";
            uploadimagetext.style.display='none';
            uploadedimagetext.style.display='block';
        }
    } else {
        imageError.style.display = 'none';
        uploadedImage = null;
    }

    checkFormValidity(); 
}
function togglePreview() {
    const previewContainer = document.getElementById("imagePreviewContainer");
    const imagePreview = document.getElementById("imagePreview");
    if (uploadedImage) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            previewContainer.style.display = "flex";
        };
        reader.readAsDataURL(uploadedImage);
    } else {
        alert("Please select an image to preview.");
    }
}
function checkFormValidity() {
    const fullName = document.getElementById('fullName');
    const phoneNumber = document.getElementById('phoneNumber');
    const password = document.getElementById('password');
    const email = document.getElementById('email');
    const zipElement = document.getElementById('zip');
    const subdivisionSelect = document.getElementById("subdivision");
    const submitButton = document.getElementById("submitButton");
    const Address = document.getElementById('address1');


    const isValid = fullName.classList.contains('is-valid') &&
                    phoneNumber.classList.contains('is-valid') &&
                    password.classList.contains('is-valid') &&
                    email.classList.contains('is-valid') &&
                    zipElement.classList.contains('is-valid') &&
                    Address.classList.contains('is-valid') &&
                    subdivisionSelect.value !== 'Choose Subdivision ▼';
                            
            const isImageValid = uploadedImage !== null && uploadedImage.size <= 500 * 1024;

            console.log("Form Valid: ", isValid);
            console.log("Image Valid: ", isImageValid);

            submitButton.disabled = !(isValid && isImageValid); 
        }


    document.addEventListener("DOMContentLoaded", function() {

        const zipElement = document.getElementById("zip");
        const zipErrorElement = document.getElementById("zipError");
        const subdivisionSelect = document.getElementById("subdivision");
        const cityElement = document.getElementById("city");
        const stateElement = document.getElementById("state");
        

        zipElement.addEventListener("blur", function() {
            const pinCode = zipElement.value;
            if (pinCode.length === 6 && /^\d{6}$/.test(pinCode)) {
                zipElement.classList.add("is-valid");
                zipElement.classList.remove("is-invalid");
                fetchCityState(pinCode);
            } else {
                zipElement.classList.add("is-invalid");
                zipElement.classList.remove("is-valid");
                resetCityStateFields();
                showErrorMessage(zipErrorElement);
            }
            checkFormValidity(); 
        });

        zipElement.addEventListener("input", function() {
            const pinCode = zipElement.value;
            if (pinCode.length !== 6 || !/^\d{6}$/.test(pinCode)) {
                zipElement.classList.remove("is-valid");
                zipElement.classList.add("is-invalid");
                resetCityStateFields();
            }
            checkFormValidity(); 
        });
        
        function fetchCityState(pinCode) {
            const apiUrl = `https://api.postalpincode.in/pincode/${pinCode}`;

            zipErrorElement.style.display = "none"; 

            $.get(apiUrl, function(data) {
                if (data && data[0]?.Status === "Success") {
                    const postOffices = data[0].PostOffice;
                    subdivisionSelect.innerHTML = postOffices.length > 1 
                        ? `<option disabled selected>Choose Subdivision ▼</option>`
                        : '';

                    postOffices.forEach((office) => {
                        const option = document.createElement("option");
                        option.textContent = office.Name;
                        subdivisionSelect.appendChild(option);
                    });

                    cityElement.value = postOffices[0].District;
                    stateElement.value = postOffices[0].State;

                    subdivisionSelect.readOnly = postOffices.length <= 1;
                    checkFormValidity(); 
                } else {
                    showErrorMessage(zipErrorElement);
                }
            }).fail(() => showErrorMessage(zipErrorElement));
        }

        
        function showErrorMessage(errorElement) {
            const selectedLanguage = document.getElementById("languageSelect").value;
            const errorMessage = selectedLanguage === "hi"
                ? errorElement.getAttribute("data-hi")
                : errorElement.getAttribute("data-en");

            errorElement.textContent = errorMessage;
            errorElement.style.display = "block";
        }

        
        function resetCityStateFields() {
            cityElement.value = '';
            stateElement.value = '';
            subdivisionSelect.innerHTML = '';
            checkFormValidity(); 
        }
        
        document.getElementById("workerform").addEventListener("submit", function(event) {
            if (!subdivisionSelect.value || subdivisionSelect.value === "Choose Subdivision ▼") {
                event.preventDefault();
                alert("Please select a subdivision!");
            }
        });

        
        document.getElementById('fullName').addEventListener('input', function() {
            validateFullName();
            checkFormValidity();
        });

        document.getElementById('phoneNumber').addEventListener('blur', function() {
            validatePhoneNumber();
            checkFormValidity();
        });

        document.getElementById('password').addEventListener('blur', function() {
            validatePassword();
            checkFormValidity();
        });
        document.getElementById('address1').addEventListener('input', function() {
            validateAddress();
            checkFormValidity();
        });
        document.getElementById('email').addEventListener('input', function() {
            validateEmail(this);
            checkFormValidity();
        });

        document.getElementById('subdivision').addEventListener('change', function() {
            checkFormValidity();
        });
        document.getElementById('uploadImage').addEventListener('change', function(){
            validateImage();
            
        });
        
        checkFormValidity();
    });


document.addEventListener("DOMContentLoaded", function () {
    const languageSelect = document.getElementById("languageSelect");

    const savedLanguage = localStorage.getItem("language") || "en";
    languageSelect.value = savedLanguage;

    function switchLanguage() {
        const selectedLanguage = languageSelect.value;
        localStorage.setItem("language", selectedLanguage);
        const elements = document.querySelectorAll("[data-en]");
        elements.forEach(function (element) {
            element.textContent = element.getAttribute(`data-${selectedLanguage}`);
            element.placeholder = element.getAttribute(`data-${selectedLanguage}`);
        });
    }
    switchLanguage();
    languageSelect.addEventListener("change", function () {
        console.log("Language selected:", languageSelect.value);
        switchLanguage();
    });
});


function validatePhoneNumber() {
    const phoneInput = document.getElementById('phoneNumber');
    const phoneError = document.getElementById('phoneError');
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
    checkFormValidity(); 
}

const phoneInput = document.getElementById('phoneNumber');
phoneInput.addEventListener('blur', validatePhoneNumber);


function validateFullName() {
    const nameInput = document.getElementById('fullName');
    const fullNameError = document.getElementById('fullNameError');
    const fullName = nameInput.value;

    if (fullName.startsWith(" ")) {
        fullNameError.style.display = 'block'; 
        nameInput.classList.add('is-invalid'); 
        nameInput.classList.remove('is-valid'); 
    } else {
        fullNameError.style.display = 'none';
        nameInput.classList.remove('is-invalid'); 
        nameInput.classList.add('is-valid'); 
    }
    checkFormValidity(); 
}
document.getElementById('fullName').addEventListener('input', validateFullName);

function validateAddress() {
    const addressInput = document.getElementById('address1');
    const addressError = document.getElementById('addressError');
    const Address = addressInput.value;

    if (Address.startsWith(" ")) {
        addressError.style.display = 'block'; 
        addressInput.classList.add('is-invalid'); 
        addressInput.classList.remove('is-valid'); 
    } else {
        addressError.style.display = 'none';
        addressInput.classList.remove('is-invalid'); 
        addressInput.classList.add('is-valid'); 
    }
    checkFormValidity(); 
}
document.getElementById('address1').addEventListener('input', validateAddress);



function validatePassword() {
    const passwordInput = document.getElementById('password');
    const passwordError = document.getElementById('passworderror');
    const password = passwordInput.value;

    // Regex pattern for password: At least 8 characters, including at least one letter, one number, and one special character
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

    // Check if password is valid
    if (password.length < 8) {
        passwordError.style.display = 'block';
        passwordInput.classList.add('is-invalid');
        passwordInput.classList.remove('is-valid');
    } else if (!passwordPattern.test(password)) {
        passwordError.style.display = 'block';
        passwordInput.classList.add('is-invalid');
        passwordInput.classList.remove('is-valid');
    } else {
        passwordError.style.display = 'none';
        passwordInput.classList.remove('is-invalid');
        passwordInput.classList.add('is-valid');
    }
        checkFormValidity(); 
    }
const passwordInput = document.getElementById('password');
passwordInput.addEventListener('blur', validatePassword);



document.getElementById('toggle-password').addEventListener('click', function () {
        const passwordField = document.getElementById('password');
        const eyeIcon = document.getElementById('eye-icon');

        if (passwordField.type === 'password') {
            passwordField.type = 'text'; 
            eyeIcon.classList.remove('bi-eye');
            eyeIcon.classList.add('bi-eye-slash'); 
        } else {
            passwordField.type = 'password'; 
            eyeIcon.classList.remove('bi-eye-slash');
            eyeIcon.classList.add('bi-eye');
        }
});

function validateEmail() {
    const email = document.getElementById('email').value;
    const emailError = document.getElementById('emailError');
    const emailInput = document.getElementById('email');

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    // Check if the email is valid
    if (emailRegex.test(email)) {
        emailError.style.display = 'none'; 
        emailInput.classList.remove('is-invalid'); 
        emailInput.classList.add('is-valid'); 
    } else {
        emailError.style.display = 'block'; 
        emailInput.classList.remove('is-valid'); 
        emailInput.classList.add('is-invalid');
    }
    checkFormValidity(); 
}
const emailInput = document.getElementById('email');
emailInput.addEventListener('blur', validateEmail);
