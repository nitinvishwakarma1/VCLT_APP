function validateUsername() {
    const username = document.getElementById("username");
    const usernamewarning = document.getElementById("usernamewarning");

    if (username.value.trim() == "") {
        usernamewarning.innerHTML = "Field required";
        usernamewarning.style.color.red;
        return false;
    }
    else {
        const namePattern = /^[A-Za-z\s]+$/;
        if (namePattern.test(username.value)) {
            usernamewarning.textContent = "";
            return true;
        }
        else {
            usernamewarning.textContent = "*Name is not valid.";
            usernamewarning.style.color = "red";
            return false;

        }
    }
}

function validatePhoneNumber() {
    const phone = document.getElementById("phone").value;
    const phoneWarning = document.getElementById("phonewarning");
    const phonePattern = /^[6789][0-9]{9}$/;

    if (phone.trim() === "") {
        phoneWarning.innerHTML = "Phone number is required.";
        return false;
    }

    if (!phonePattern.test(phone)) {
        phoneWarning.innerHTML = "Phone number is not valid. It should be 10 digits.";
        phoneWarning.style.color = "red";
        return false;
    }
    phoneWarning.innerHTML = "";
    return true;
}

function validateAddress() {
    const address = document.getElementById("address");
    const addresswarning = document.getElementById("addresswarning");
    if (address.value.trim() === "") {
        addresswarning.innerHTML = "*Field required";
        return false;
    }
    else {
        const addresspattern = /^[A-Za-z\s]+$/;
        if (addresspattern.test(address.value)) {
            addresswarning.textContent = "";
            return true;
        }
        else {
            addresswarning.textContent = "*Address is not valid.";
            addresswarning.style.color = "red";
            return false;
        }
    }
}
