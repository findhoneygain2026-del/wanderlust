document.addEventListener('DOMContentLoaded', function () {
  'use strict'


  var forms = document.querySelectorAll('.needs-validation')


  Array.prototype.slice.call(forms)
    .forEach(function (form) {
      form.addEventListener('submit', function (event) {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
          console.log("Form validation failed. Stopping submission."); 
        } else {
          console.log("Form is valid. Submitting...");
        }

        form.classList.add('was-validated')
      }, false)
    })
})