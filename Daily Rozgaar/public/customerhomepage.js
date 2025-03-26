let isEditing = false;
          
document.addEventListener('DOMContentLoaded', function() {
    fetch('/customerprofile')
        .then(response => response.json())
        .then(data => {
            console.log('Profile data:', data);
            document.getElementById('fullName').value = data.fullName;
            document.getElementById('phoneNumber').value = data.phoneNumber;
            document.getElementById('email').value = data.email;
            document.getElementById('zip').value = data.zip;
            document.getElementById('state').value = data.state;
            document.getElementById('city').value = data.city;
            console.log('Subdivision:', data.subdivision);  

            const subdivisionElement = document.getElementById('subdivision');


            if (data.subdivision) {
                subdivisionElement.innerHTML = `<option selected>${data.subdivision}</option>`;
            }
            document.getElementById('address1').value = data.address1;
            document.getElementById('imagePreview').src = data.profileImage;
        })
        .catch(err => console.error('Error fetching profile:', err));
        document.getElementById('cancelButton').addEventListener('click',function(e){
          e.preventDefault();
          toggleEditMode(false);
          removeValidClasses(['fullName', 'phoneNumber', 'email', 'zip', 'address1','subdivision','state','city']);
          const buttonArea=document.getElementById("buttonArea");
          buttonArea.className = buttonArea.className.replace('col-sm-6', 'col-sm-12');
        });

        document.getElementById('editBut').addEventListener('click', function(e) {
            e.preventDefault();
            toggleEditMode(true);  
            markFieldValid('fullName');
            markFieldValid('phoneNumber');
            markFieldValid('email');
            markFieldValid('zip');
            markFieldValid('address1');
            markFieldValid('subdivision');
            markFieldValid('city');
            markFieldValid('state');
            checkFormValidity();

        });
      document.querySelectorAll('#customerform input, #customerform select').forEach(field => {
        field.addEventListener('input', () => {
          hasChanges = true;
        });
        field.addEventListener('change', () => {
          hasChanges = true;
        });
      });

      document.getElementById('customerform').addEventListener('submit', function(e) {
          e.preventDefault();

          if (isEditing) {
            if (!hasChanges) {
              alert('No changes were made. Please update your details before saving.');
              return;
            }
              const phoneNumber = document.getElementById('phoneNumber').value;
              const email = document.getElementById('email').value;
              const formData = new FormData(this); 

                fetch('/updateDetails', {
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
                      removeValidClasses(['fullName', 'phoneNumber', 'email', 'zip', 'address1','subdivision','state','city']);
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

    function toggleEditMode(enable) {
        const formFields = document.querySelectorAll("#customerform input, #customerform select");
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


document.addEventListener("DOMContentLoaded", function () {

  
  const serviceCategory = document.getElementById("servicecategory");
  const profileShow = document.getElementById("profileshow");
  const backButton = document.getElementById("backbutton");

  profileShow.style.display = "none";

  const categoryCards = document.querySelectorAll("#servicecategory .card");
  categoryCards.forEach((card) => {
    card.addEventListener("click", function () {
      const category = card.id;
      loadProfiles(category);
      serviceCategory.style.display = "none";
      profileShow.style.display = "block";
    });
  });

  backButton.addEventListener("click", function () {
    profileShow.style.display = "none";
    serviceCategory.style.display = "block";
  });

  
  function loadProfiles(category) {
  const currentLanguage = document.getElementById("languageSelect").value;
  const translations = {
    labour: { en: "Labour", hi: "श्रमिक" },
    mistri: { en: "Mistri", hi: "मिस्त्री" },
    electrician: { en: "Electrician", hi: "इलेक्ट्रिशियन" },
    plumber: { en: "Plumber", hi: "प्लंबर" },
    painter: { en: "Painter", hi: "पेंटर" },
    carpenter: { en: "Carpenter", hi: "कारपेंटर" },
  };

  fetch(`/profiles?category=${category}`)
    .then((res) => res.json())
    .then((data) => {

      const headingElement = document.querySelector(".h2.text-center");
      
      headingElement.setAttribute("data-category", category); 

      headingElement.setAttribute(
        "data-en",
        `${translations[category].en}'s Profiles in Your location`
      );
      headingElement.setAttribute(
        "data-hi",
        `यह आपके स्थान पर ${translations[category].hi} प्रोफ़ाइल है`
      );
      const currentLanguage = localStorage.getItem("language") || "en";
      headingElement.textContent = headingElement.getAttribute(
        `data-${currentLanguage}`
      );
      

      const profileRow = document.querySelector(".profileshowrow");
      profileRow.innerHTML = ""; 
      if (data.length === 0) {
        // No profiles found
        profileRow.innerHTML = `<p class="noprofilestatus" data-en="No profile in your location" data-hi="आपके स्थान पर कोई प्रोफ़ाइल नहीं है">No profile</p>`;
      } else {
      data.forEach((profile) => {
        let status = "";
        if (profile.requestStatus === "completed") {
          status = `
            <p style="color:#59d567" 
              data-en="Accepted" 
              data-hi="स्वीकार किया" 
              class="acceptedstatus"></p>`;
        } else if (profile.requestStatus === "pending") {
          status = `
            <p style="color:rgb(238, 0, 0)" 
              data-en="Pending" 
              data-hi="लंबित" 
              class="pendingstatus"></p>`;
        }
        else {
          status = `
            <p style="margin-bottom:5px;color:gray" 
               class="nostatus">&nbsp;</p>`;
        }            
        const profileDiv = `
          <div class="col-3 profilebox" id="profilediv">
            <div class="row">
              <div class="col-5" style="padding: 0;">
                <img src="${profile.image}" class="img-fluid" alt="${profile.fullName}">
              </div>
              <div class="col-7 d-flex flex-column justify-content-center align-items-center">
                <p style="margin-bottom:5px">${profile.fullName}</p>
                ${status}
                <button type="button" class="btn viewprofile" data-hi="प्रोफ़ाइल देखें" data-en="View Profile" data-bs-toggle="modal" data-bs-target="#profileviewmodal" data-id="${profile.workerid}"></button>
              </div>
            </div>
          </div>`;
          console.log(profile);
        profileRow.insertAdjacentHTML("beforeend", profileDiv);
      });}
      function updateButtonText() {
        const buttons = document.querySelectorAll('.viewprofile'); 
        buttons.forEach((btn) => {
            const textElement = btn.querySelector('span') || btn;  
            textElement.textContent = textElement.getAttribute(`data-${currentLanguage}`);
        });
      }
      updateButtonText();
      function updateStatusText() {
        const currentLanguage = localStorage.getItem("language") || "en"; // default to English
        const statusElements = document.querySelectorAll('.acceptedstatus, .pendingstatus, .noprofilestatus');
        
        statusElements.forEach((element) => {
          element.textContent = element.getAttribute(`data-${currentLanguage}`);
        });
      }
      updateStatusText();
      

      document.querySelectorAll(".viewprofile").forEach((btn) =>
        btn.addEventListener("click", function () {
          const workerId = btn.getAttribute("data-id");
          loadProfileDetails(workerId);
        })
      );
    });
}
          
function loadProfileDetails(workerId) {
  fetch(`/worker/${workerId}`)
    .then((res) => res.json())
    .then((profile) => {
      document.querySelector("#profileviewmodal img").src = profile.image;
      const tableBody = document.querySelector("#profileviewmodal table tbody");
      tableBody.innerHTML = `
        <tr>
          <th scope="row" data-en="NAME" data-hi="नाम">NAME</th>
          <td>${profile.fullName}</td>
        </tr>
        <tr>
          <th scope="row" data-en="Phone Number" data-hi="फ़ोन नंबर">Phone Number</th>
          <td>${profile.phoneNumber}</td>
        </tr>
        <tr>
          <th scope="row" data-en="Address" data-hi="पता">Address</th>
          <td>${profile.address}</td>
        </tr>`;
      const currentLanguage = localStorage.getItem("language") || "en";
      tableBody.querySelectorAll("th").forEach((th) => {
        th.textContent = th.getAttribute(`data-${currentLanguage}`);
      });

      const contactBtn = document.querySelector(".contactbutton");
      contactBtn.addEventListener("click", () => {
        const phoneLink = `tel:${profile.phoneNumber}`;
        window.location.href = phoneLink;
      });

      const sendRequestBtn = document.querySelector(".sendrequest");
      const cancelrequestbtn = document.querySelector(".cancelrequest");
      const acceptedrequestbtn = document.querySelector(".acceptedrequest");
      sendRequestBtn.workerId = profile.workerid;
      cancelrequestbtn.workerId = profile.workerid;
      acceptedrequestbtn.workerId = profile.workerid;

      checkRequestStatus(profile.workerid);


      if (!sendRequestBtn.hasEventListener) {
          sendRequestBtn.addEventListener("click", function () {
              const workerId = this.workerId;
              if (workerId) {
                  fetch(`/sendRequests/${workerId}`, { method: "POST" })
                      .then((res) => res.json())
                      .then((data) => {
                          if (data.success) {
                              this.style.display = "none";
                              cancelrequestbtn.style.display = "block";
                          }
                      })
                      .catch((err) => console.error("Error sending request:", err));
                      
              }
              
          });
          
          sendRequestBtn.hasEventListener = true;
      }
        
      if (!cancelrequestbtn.hasEventListener) {
            cancelrequestbtn.addEventListener("click", function () {
                const workerId = this.workerId;  
                console.log("Cancel Request Worker ID: ", workerId);
                if (workerId) {
                    fetch(`/cancelRequests/${workerId}`, { method: "POST" })
                        .then((res) => res.json())
                        .then((data) => {
                            if (data.success) {
                                cancelrequestbtn.style.display = "none";
                                sendRequestBtn.style.display = "block";
                            }
                        })
                        .catch((err) => console.error("Error canceling request:", err));
                }
            });
            cancelrequestbtn.hasEventListener = true;  
        }
      });
}
function checkRequestStatus(workerId) {
fetch(`/checkRequestStatus/${workerId}`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const status = data.requestStatus;
            const sendRequestButton = document.querySelector(".sendrequest");
            const cancelRequestButton = document.querySelector(".cancelrequest");
            const acceptedRequestButton = document.querySelector(".acceptedrequest");

            if (status === 'pending') {
                sendRequestButton.style.display = "none";
                cancelRequestButton.style.display = "inline-block";
                acceptedRequestButton.style.display = "none";
            } else if (status === 'completed') {
                sendRequestButton.style.display = "none";
                cancelRequestButton.style.display = "none";
                acceptedRequestButton.style.display = "inline-block";
            } else {
                sendRequestButton.style.display = "inline-block";
                cancelRequestButton.style.display = "none";
                acceptedRequestButton.style.display = "none";
            }
        }
    })
    .catch(error => console.error('Error checking request status:', error));
}

          // Ensure modal updates when language is switched
document.getElementById("languageSelect").addEventListener("change", () => {
  const currentLanguage = localStorage.getItem("language") || "en";
  updateButtonText();
  updateStatusText(); 
  const headingElement = document.querySelector(".h2.text-center");
  document.querySelectorAll("#profileviewmodal table th").forEach((th) => {
    th.textContent = th.getAttribute(`data-${currentLanguage}`);
  });
  headingElement.textContent = headingElement.getAttribute(
    `data-${currentLanguage}`
  );
});

});


function checkFormValidity() {
  const fullName = document.getElementById('fullName');
  const phoneNumber = document.getElementById('phoneNumber');
  const email = document.getElementById('email');
  const zipElement = document.getElementById('zip');
  const subdivisionSelect = document.getElementById("subdivision");
  const submitButton = document.getElementById("submitButton");
  const Address = document.getElementById('address1');


  const isValid = fullName.classList.contains('is-valid') &&
                  phoneNumber.classList.contains('is-valid') &&
                  email.classList.contains('is-valid') &&
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
    
document.getElementById("customerform").addEventListener("submit", function(event) {
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

document.getElementById('address1').addEventListener('load', function() {
    validateAddress();
    checkFormValidity();
});
document.getElementById('email').addEventListener('load', function() {
    validateEmail(this);
    checkFormValidity();
});

document.getElementById('subdivision').addEventListener('change', function() {
    checkFormValidity();
});
    
    checkFormValidity();
});

document.addEventListener("DOMContentLoaded", function () {
const serviceSection = document.getElementById("service");
const profileSection = document.getElementById("profile");
const navLinks = document.querySelectorAll(".nav-link");

  function activateSection(activeSection) {
      serviceSection.style.display = "none";
      profileSection.style.display = "none";
      navLinks.forEach(link => link.classList.remove("active", "bg-black"));
      activeSection.style.display = "block";
      const activeLink = document.querySelector(`.nav-link[data-en="${activeSection.id.charAt(0).toUpperCase() + activeSection.id.slice(1)}"]`);
      activeLink.classList.add("active", "bg-black");
  }
    navLinks.forEach(link => {
        link.addEventListener("click", function (event) {
            event.preventDefault();

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

function validateEmail() {
    const email = document.getElementById('email').value;
    const emailError = document.getElementById('emailError');
    const emailInput = document.getElementById('email');

    // Regular expression for validating email
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    // Check if the email is valid
    if (emailRegex.test(email)) {
        emailError.style.display = 'none'; // Hide error if valid
        emailInput.classList.remove('is-invalid'); // Remove 'invalid' class
        emailInput.classList.add('is-valid'); // Add 'valid' class
    } else {
        emailError.style.display = 'block'; // Show error if invalid
        emailInput.classList.remove('is-valid'); // Remove 'valid' class
        emailInput.classList.add('is-invalid'); // Add 'invalid' class
    }
    checkFormValidity(); 
}
const emailInput = document.getElementById('email');
emailInput.addEventListener('blur', validateEmail);
