
      document.addEventListener("DOMContentLoaded", function() {
        const backToTopButton = document.querySelector('.back-to-top');
        function handleScroll() {
          if (window.scrollY > window.innerHeight * 0.08) {
            backToTopButton.style.opacity = 1; 
          } else {
            backToTopButton.style.opacity = 0; 
          }
        }
        window.addEventListener('scroll', handleScroll);
        handleScroll();
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

  function sendEmail(){
    let parms = {
        name : document.getElementById("name").value,
        phonenumber : document.getElementById("phonenumber").value,
        message : document.getElementById("message").value,
    }
    emailjs.send("dailyrozgaar","template_s1mheu9",parms).then(alert("Email Sent"))
  }
  document.addEventListener("DOMContentLoaded", function () {
    const languageSelect = document.getElementById("languageSelect");
    const messageTextarea = document.getElementById("message");

    function updatePlaceholder() {
        const currentLanguage = localStorage.getItem("language") || "en";
        const placeholderText = messageTextarea.getAttribute(`data-${currentLanguage}`);
        messageTextarea.setAttribute("placeholder", placeholderText);
    }

    updatePlaceholder();
    languageSelect.addEventListener("change", function () {
        const selectedLanguage = languageSelect.value; 
        localStorage.setItem("language", selectedLanguage); 
        updatePlaceholder(); 
    });

   
    messageTextarea.value = "";
});
function reset(){
  document.getElementById("name").value="";
  document.getElementById("phonenumber").value="";
  document.getElementById("message").value="";
}
