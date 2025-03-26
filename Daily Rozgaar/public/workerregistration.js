
function updateUploadedImageText(language) {
    const uploadedImageText = document.getElementById('uploadedimagetext');
    const text = uploadedImageText.getAttribute(`data-${language}`);

    // Replace \n with an actual line break
    uploadedImageText.innerHTML = text.replace(/\n/g, '<br>');
}


updateUploadedImageText('hi');

let uploadedImage = null;
let UploadAadhar=null;
function validateFileSize(inputElement) {
            let file = inputElement.files[0];
            let errorMessage = document.getElementById('aadharError');
            const uploadaadhartext=document.getElementById('uploadaadhartext');
            const uploadedaadhartext=document.getElementById('uploadedaadhartext');
            const aadharuploadlabel=document.querySelector('.custom-file-label');
            errorMessage.style.display = 'none'; 

            if (file) {
                if (file.size > 500 * 1024) { 
                    aadharuploadlabel.style.border = '2px dashed red'; 
                    aadharuploadlabel.style.backgroundColor = "#f8d7da";
                    errorMessage.style.display = 'block';  
                    UploadAadhar=null;
                    uploadaadhartext.style.display='block';
                    uploadedaadhartext.style.display='none';
                    aadharuploadlabel.style.color="black";
                } else {
                    inputElement.style.border = '2px solid green'; 
                    UploadAadhar=file;
                    aadharuploadlabel.style.border = '2px dashed #5c656d'; 
                    aadharuploadlabel.style.backgroundColor = "#d5ecff";
                    uploadaadhartext.style.display='none';
                    uploadedaadhartext.style.display='block';
                    aadharuploadlabel.style.color="black";
                }
                
            }
            else{
                    errorMessage.style.display = 'none';
                    UploadAadhar=null;
                }
                checkFormValidity();
        }

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
    const zipElement = document.getElementById('zip');
    const subdivisionSelect = document.getElementById("subdivision");
    const submitButton = document.getElementById("submitButton");
    const Address = document.getElementById('address1');
    const DOB = document.getElementById('dob');
    const AadharNumber=document.getElementById('aadhaarNumber');

    const isValid = fullName.classList.contains('is-valid') &&
                    phoneNumber.classList.contains('is-valid') &&
                    zipElement.classList.contains('is-valid') &&
                    Address.classList.contains('is-valid') &&
                    DOB.classList.contains('is-valid') &&
                    AadharNumber.classList.contains('is-valid') &&
                    subdivisionSelect.value !== 'Choose Subdivision ▼';
                            
            const isImageValid = uploadedImage !== null && uploadedImage.size <= 500 * 1024 && UploadAadhar !==null && UploadAadhar.size<=500 * 1024;

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
        document.getElementById('aadhaarNumber').addEventListener('blur', function() {
            handleAadhaarNumber(this);
            checkFormValidity();
        });
        document.getElementById('dob').addEventListener('blur', function() {
            validateDOB();
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
        document.getElementById('uploadAadharCard').addEventListener('change', function(){
            validateFileSize(this);
        });
        
        
        checkFormValidity();
    });


document.getElementById('workerform').addEventListener('submit', function(event) {
    event.preventDefault();  
    const subdivisionSelect = document.getElementById('subdivision');
    if (!subdivisionSelect.value || subdivisionSelect.value === 'Choose Subdivision ▼') {
        alert('Please select a subdivision!');
        return; 
    }

    const formData = new FormData(this); 
    fetch('/register', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())  
    .then(data => {
        console.log(data);  
        if (data.password) {
            document.getElementById('passwordMessage').innerText = `${data.password}`;
            $('#passwordModal').modal('show');  
        } else if(data.message){
            $('#existingUserModal').modal('show'); 
        }
    })
    .catch(error => {
        console.error('Error:', error);  
    });
   
});

    
  
  

function handleAadhaarNumber(input) {
    let aadhaarNumber = input.value.replace(/\D/g, ''); 
    input.value = aadhaarNumber.replace(/(\d{4})(?=\d)/g, '$1-');
    const aadhaarError = document.getElementById('aadhaarError');
    if (aadhaarNumber.length === 12) {
        aadhaarError.style.display = 'none';
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
    } else if (aadhaarNumber.length > 0 && aadhaarNumber.length < 12) {
        aadhaarError.style.display = 'block';
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
    } else {
        aadhaarError.style.display = 'none';
        input.classList.remove('is-invalid', 'is-valid');
    }
    checkFormValidity();
}

const aadhaarInput = document.getElementById('aadhaarNumber');
aadhaarInput.addEventListener('input', function() {
    handleAadhaarNumber(this);
});
aadhaarInput.addEventListener('blur', function() {
    handleAadhaarNumber(this);
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

    function validateDOB() {
        const dobInput = document.getElementById('dob');
        const dobError = document.getElementById('dobError');
        const dobValue = dobInput.value;

        if (dobValue) {
            const age = new Date().getFullYear() - new Date(dobValue).getFullYear();
            const isValid = age >= 18;

            dobInput.classList.toggle('is-valid', isValid);
            dobInput.classList.toggle('is-invalid', !isValid);
            dobError.style.display = isValid ? 'none' : 'block';
        } else {
            dobInput.classList.remove('is-invalid', 'is-valid');
            dobError.style.display = 'none';
        }
        checkFormValidity(); 
    }

    document.getElementById('dob').addEventListener('blur', validateDOB);
    document.getElementById('dob').addEventListener('input', validateDOB);
