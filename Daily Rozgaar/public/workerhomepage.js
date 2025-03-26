let isEditing = false;
document.addEventListener('DOMContentLoaded', function() {

      fetch('/workerprofile')
          .then(response => response.json())
          .then(data => {
              console.log('Profile data:', data);
              console.log('DOB:', data.dob); 
              const dobDate = new Date(data.dob);
              dobDate.setMinutes(dobDate.getMinutes() - dobDate.getTimezoneOffset());
              const formattedDOB = dobDate.toISOString().split('T')[0];
              document.getElementById('fullName').value = data.fullName;
              document.getElementById('phoneNumber').value = data.phoneNumber;
              document.getElementById('dob').value = formattedDOB; 
              document.getElementById('zip').value = data.zip;
              document.getElementById('state').value = data.state;
              document.getElementById('city').value = data.city;
              console.log('Subdivision:', data.subdivision); 

              const subdivisionElement = document.getElementById('subdivision');


              if (data.subdivision) {
                  subdivisionElement.innerHTML = `<option selected>${data.subdivision}</option>`; 
              }
              document.getElementById('address1').value = data.address1;
              document.getElementById('imagePreview').src = data.image;
          })
          .catch(err => console.error('Error fetching profile:', err));
      document.getElementById('cancelButton').addEventListener('click',function(e){
        e.preventDefault();
        toggleEditMode(false);
        removeValidClasses(['fullName', 'phoneNumber','dob', 'zip', 'address1','subdivision','state','city']);
        const buttonArea=document.getElementById("buttonArea");
        buttonArea.className = buttonArea.className.replace('col-sm-6', 'col-sm-12');
      });
      document.getElementById('editBut').addEventListener('click', function(e) {
          e.preventDefault();
          toggleEditMode(true);


          markFieldValid('fullName');
          markFieldValid('phoneNumber');
          markFieldValid('dob');
          markFieldValid('zip');
          markFieldValid('address1');
          markFieldValid('subdivision');
          markFieldValid('city');
          markFieldValid('state');
          checkFormValidity();

      });
      document.querySelectorAll('#workerform input, #workerform select').forEach(field => {
        field.addEventListener('input', () => {
          hasChanges = true;
        });
        field.addEventListener('change', () => {
          hasChanges = true;
        });
      });

      document.getElementById('workerform').addEventListener('submit', function(e) {
          e.preventDefault();

          if (isEditing) {
            if (!hasChanges) {
              alert('No changes were made. Please update your details before saving.');
              return;
            }
              const phoneNumber = document.getElementById('phoneNumber').value;
              const formData = new FormData(this);  

                fetch('/updateWorkerDetails', {
                    method: 'POST',
                    body: formData
                })
              .then(response => response.json())
              .then(data => {
                  if (data.status === 'existingPhone') {
                      document.getElementById('phoneexistError').style.display = 'block';
                  } else if (data.status === 'existingEmail') {
                      document.getElementById('emailexistError').style.display = 'block';
                  } else if (data.status === 'success') {
                      toggleEditMode(false);
                      hasChanges = false;
                      removeValidClasses(['fullName', 'phoneNumber','dob', 'zip', 'address1','subdivision','state','city']);
                      const successModal = new bootstrap.Modal(document.getElementById('updatedsuccessfully'));
                        successModal.show();
                        setTimeout(() => {
                          successModal.hide();
                        }, 1500);
                  }
              })
              .catch(err => console.error('Error updating details:', err));
          }
      });

      function removeValidClasses(fieldIds) {
        fieldIds.forEach(fieldId => {
          const field = document.getElementById(fieldId);
          field.classList.remove('is-valid');
        });
      }
      function markFieldValid(fieldId) {
        const field = document.getElementById(fieldId);
        field.classList.add('is-valid');
        field.classList.remove('is-invalid');
      }
      // Function to enable/disable form fields
      function toggleEditMode(enable) {
          const formFields = document.querySelectorAll("#workerform input, #workerform select");
          const submitButton = document.getElementById('submitButton');
          const cancelButton = document.getElementById('cancelButton');
          const imageUploadInput = document.getElementById("imageUploadInput");
          const uploadHint = document.getElementById("uploadHint");
          const buttonArea=document.getElementById("buttonArea");
  
          formFields.forEach(input => {
              input.disabled = !enable;  
          });

          
          submitButton.style.display=enable ? "block" : "none";
          cancelButton.style.display=enable ? "block" : "none";
          cancelButton.style.marginTop=enable ? "40px" : "0px";
          submitButton.style.marginTop=enable ? "40px" : "0px";
          buttonArea.className = buttonArea.className.replace('col-sm-12', 'col-sm-6');
          imageUploadInput.disabled = !enable;
          uploadHint.style.display = enable ? "block" : "none"; 
           
          isEditing = enable;  
      }
  

      const imagePreview = document.getElementById("imagePreview");
      const previewContainer = document.querySelector(".preview-container");
  
      previewContainer.addEventListener("mouseenter", () => {
          if (isEditing) {
            uploadHint.style.opacity = 1;
              imagePreview.style.filter = "brightness(50%)";
              imagePreview.style.backgroundColor = "black";
          }
      });
  
      previewContainer.addEventListener("mouseleave", () => {
          if (isEditing) {
            uploadHint.style.opacity = 0;

              imagePreview.style.filter = "brightness(100%)";
              imagePreview.style.backgroundColor = "transparent";
          }
      });
  });

document.querySelector('.logout-button').addEventListener('click', function(e) {
e.preventDefault();

fetch('/logout', { method: 'GET' })
.then(response => {
    if (response.ok) {
        window.location.href = '/login.html';  
    } else {
        console.error('Logout failed');
    }
})
.catch(err => console.error('Logout failed:', err));
});

function checkFormValidity() {
const fullName = document.getElementById('fullName');
const phoneNumber = document.getElementById('phoneNumber');
const dob = document.getElementById('dob');
const zipElement = document.getElementById('zip');
const subdivisionSelect = document.getElementById("subdivision");
const submitButton = document.getElementById("submitButton");
const Address = document.getElementById('address1');


const isValid = fullName.classList.contains('is-valid') &&
            phoneNumber.classList.contains('is-valid') &&
            dob.classList.contains('is-valid') &&
            zipElement.classList.contains('is-valid') &&
            Address.classList.contains('is-valid') &&
            subdivisionSelect.value !== 'Choose Subdivision ▼';
                    
            console.log("Form Valid: ", isValid);
    submitButton.disabled = !isValid; 
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

    const existingSubdivision = document.getElementById('subdivision').value;

    postOffices.forEach((office) => {
        const option = document.createElement("option");
        option.textContent = office.Name;
        subdivisionSelect.appendChild(option);
    });

    cityElement.value = postOffices[0].District;
    stateElement.value = postOffices[0].State;

    if (!existingSubdivision || existingSubdivision === 'Choose Subdivision ▼') {
        subdivisionSelect.value = existingSubdivision || postOffices[0].Name;
    }

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


document.getElementById('fullName').addEventListener('load', function() {
    validateFullName();
    checkFormValidity();
});

document.getElementById('phoneNumber').addEventListener('load', function() {
    validatePhoneNumber();
    checkFormValidity();
});
document.getElementById('dob').addEventListener('load', function() {
    validateDOB();
    checkFormValidity();
});
document.getElementById('address1').addEventListener('load', function() {
    validateAddress();
    checkFormValidity();
});

document.getElementById('subdivision').addEventListener('change', function() {
    checkFormValidity();
});

checkFormValidity();
});

document.addEventListener('DOMContentLoaded', function() {
    const currentLanguage = localStorage.getItem("language") || "en"; 

    function updateLanguage() {
    document.querySelectorAll("[data-en], [data-hi]").forEach((element) => {
    const languageText = element.getAttribute(`data-${currentLanguage}`);
    if (languageText) {
        element.textContent = languageText;
    }
    });
    }
    fetch(`/workerrequests`)
    .then(response => response.json())
    .then(data => {
    if (!data.success) {
        console.error("Failed to fetch requests:", data.message);
        return;
    }

    const requestContainer = document.querySelector(".requestshowrow");
    requestContainer.innerHTML = '';
    data.requests.forEach(request => {
        if (request.status === 'cancelled') {
            return;
        }

        const isCompleted = request.status === 'completed';
        const requestHTML = `
            <div class="col-sm-3 customerrequestbox" id="customerrequest-${request.id}">
                <div class="position-relative"> 
                    <button type="button" class="btn deleterequestbutton position-absolute" data-id="${request.id}" style="display: ${isCompleted ? 'inline-block' : 'none'};">
                        <i class="bi bi-x-lg"></i>
                    </button>
                    <div class="col-sm-12" style="margin: auto;">
                        <img src="${request.profileImage}" class="img" style="object-fit: cover;width:100px;height: 100px;border-radius: 50%;border: 2px solid black;">
                    </div>
                    <div class="col-sm-11" style="text-align: center;margin: auto;">
                        <h1 class="customerrequestname">${request.fullName}</h1>
                        <p data-hi="ने आपको एक अनुरोध भेजा है" data-en="Sent you Request" class="sendrequesttext" style="display: ${isCompleted ? 'none' : 'inline-block'};"></p>
                        <p data-hi="अनुरोध स्वीकार कर लिया" data-en="Accepted" class="requestacceptedtext" style="display: ${isCompleted ? 'inline-block' : 'none'};color:#bffc4f;font-weight:600"></p>
                    </div>
                    <div class="col-sm-12 justify-content-between" style="margin: auto;">
                        <button type="button" class="btn acceptbutton" data-id="${request.id}" 
                        style="display: ${isCompleted ? 'none' : 'inline-block'};"><i class="bi bi-check-lg"></i><span data-en="Accept" data-hi="स्वीकार करें"></span></button>
                        <button type="button" class="btn rejectbutton" data-id="${request.id}" 
                        style="display: ${isCompleted ? 'none' : 'inline-block'};">
                        <i class="bi bi-x-circle-fill"></i><span data-en="Reject" data-hi="अस्वीकार करें">Reject</span>
                        </button>
                        <button type="button" class="btn contactbutton" data-phone="${request.phoneNumber}" 
                        style="display: ${isCompleted ? 'inline-block' : 'none'};">
                        <i class="bi bi-telephone-fill"></i><span data-en="Contact" data-hi="संपर्क करें"></span>
                        </button>
                    </div>
                </div>
            </div>`;              
        // Insert the request HTML into the container
        requestContainer.insertAdjacentHTML('beforeend', requestHTML);
            });
        updateLanguage();
        attachEventListeners();
    })
});
function attachEventListeners() {
// Accept Button
document.querySelectorAll(".acceptbutton").forEach(button => {
button.addEventListener("click", function () {
    const requestId = button.getAttribute("data-id");
    fetch(`/worker/request/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId })
    }).then(response => response.json()).then(data => {
        if (data.success) {
            button.style.display = "none";
            button.closest(".customerrequestbox").querySelector(".rejectbutton").style.display = "none";
            button.closest(".customerrequestbox").querySelector(".contactbutton").style.display = "inline-block";
            button.closest(".customerrequestbox").querySelector(".deleterequestbutton").style.display = "inline-block";
            button.closest(".customerrequestbox").querySelector(".requestacceptedtext").style.display = "inline-block";
            button.closest(".customerrequestbox").querySelector(".sendrequesttext").style.display = "none";
            
        }
    }).catch(err => console.error("Error accepting request:", err));
});
});

// Reject Button
document.querySelectorAll(".rejectbutton").forEach(button => {
button.addEventListener("click", function () {
    const requestId = button.getAttribute("data-id");
    fetch(`/worker/request/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId })
    }).then(response => response.json()).then(data => {
        if (data.success) {
            button.closest(".customerrequestbox").remove();
        }
    }).catch(err => console.error("Error rejecting request:", err));
});
});

// Delete Button
document.querySelectorAll(".deleterequestbutton").forEach(button => {
button.addEventListener("click", function () {
    const requestId = button.getAttribute("data-id");
    fetch(`/worker/request/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId })
    }).then(response => response.json()).then(data => {
        if (data.success) {
            button.closest(".customerrequestbox").remove();
        }
    }).catch(err => console.error("Error deleting request:", err));
});
});

// Contact Button
document.querySelectorAll(".contactbutton").forEach(button => {
button.addEventListener("click", function () {
    const phoneNumber = button.getAttribute("data-phone");
    window.location.href = `tel:${phoneNumber}`;
});
});
}

document.addEventListener("DOMContentLoaded", function () {
    const serviceSection = document.getElementById("requests");
    const profileSection = document.getElementById("profile");
    const navLinks = document.querySelectorAll(".nav-link");

    function activateSection(activeSection) {
        serviceSection.style.display = "none";
        profileSection.style.display = "none";
        navLinks.forEach(link => link.classList.remove("active", "bg-black"));
        activeSection.style.display = "block";

        // Add active styles to the clicked link
        const activeLink = document.querySelector(`.nav-link[data-en="${activeSection.id.charAt(0).toUpperCase() + activeSection.id.slice(1)}"]`);
        activeLink.classList.add("active", "bg-black");
    }

    // Add click event listeners to navigation links
    navLinks.forEach(link => {
        link.addEventListener("click", function (event) {
            event.preventDefault(); // Prevent default link behavior

            const sectionId = link.dataset.en.toLowerCase();
            const activeSection = document.getElementById(sectionId);
            activateSection(activeSection);
        });
});

activateSection(serviceSection);
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

document.addEventListener("DOMContentLoaded", function() {
    const imagePreview = document.getElementById("imagePreview");
    const imageUploadInput = document.getElementById("imageUploadInput");
    const uploadHint = document.getElementById("uploadHint");
    const imageError = document.getElementById("imageError");

    imagePreview.addEventListener("click", () => {
    imageUploadInput.click();
    });

    imageUploadInput.addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 500 * 1024) {
            imageError.style.display = "block";
            return;
        }
        imageError.style.display = "none"; 
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
        };
        reader.readAsDataURL(file);
        window.uploadedImageFile = file;
    }
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
