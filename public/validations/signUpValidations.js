

const fnameError = document.getElementById("fnameErr")
const lnameError = document.getElementById("lnameErr")
const mobileError = document.getElementById("mobileErr")
const emailError = document.getElementById("emailErr")
const passwordError = document.getElementById("passwordErr")
const cPasswordError = document.getElementById("confirmPasswordErr")
const dobErr = document.getElementById('dobErr')



const nameRegex = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z])$/;
const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
const mobileRegex = /^(\+\d{1,3}[- ]?)?\d{10}$/
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/


//fname
function validateFName() {
    let name = document.getElementById("fname").value.trim()
    console.log('validating fname');
    if (name.length === 0) {
        fnameError.innerHTML = "Name required!";
        return false;
    }
    if (!name.match(nameRegex)) {
        fnameError.innerHTML = "No numbers allowed";
        return false;
    }
    fnameError.innerHTML = "";
    return true;
}


function validateEmail() {
    let email = document.getElementById("email").value.trim()
    if (email.length === 0) {
        emailError.innerHTML = "Email required!";
        return false;
    }
    if (!email.match(emailRegex)) {
        emailError.innerHTML = "Enter a valid email";

        return false;
    }
    emailError.innerHTML = "";
    return true;
}

function validateMobile() {
    let mobile = document.getElementById('mobile').value.trim()

    if (mobile.length === 0) {
        mobileError.innerHTML = "Mobile required!";
        return false;
    }
    if (!mobile.match(mobileRegex)) {
        mobileError.innerHTML = 'Enter a valid mobile no.'
        return false
    }
    mobileError.innerHTML = ""
    return true
}



function validatePassword() {
    let password = document.getElementById("password").value.trim()
    if (password.length === 0) {
        passwordError.innerHTML = "Password required!";
        return false;
    }else if(password.length < 8){
        passwordError.innerHTML = 'Password must contain 8 characters'
        return false
    }

    if (!password.match(passwordRegex)) {
        passwordError.innerHTML = 'Invalid password'
        return false
    }
    passwordError.innerHTML = ''
    return true
}

function validateConfirmPassword() {
    let password = document.getElementById("password").value.trim()
    let cPassword = document.getElementById("confirmPassword").value.trim()
    if (cPassword.length === 0) {
        cPasswordError.innerHTML = "Confirm Password required!";
        return false;
    }
    if (password !== cPassword) {

        cPasswordError.innerHTML = `Passwords doesn't match`
        return false
    }
    cPasswordError.innerHTML = ""
    return true
}




function validateSignUp() {
    return validateFName() && validateEmail() && validateMobile() && validatePassword() && validateConfirmPassword()
}

function validateLogin(){
    return validateEmail() && validatePassword()
}

function validateProfile(){
    return validateFName() && validateMobile() 
}



