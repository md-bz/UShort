// import "@babel/polyfill";
import { login, logout } from "./login";
import { signup } from "./signup";
import { updateSettings } from "./updateSettings";
import { showAlert } from "./alerts";
import { shorten } from "./shorten";

const loginForm = document.getElementById("login");
const signupForm = document.getElementById("signup");
const logoutBtn = document.getElementById("logout");
const shortenForm = document.getElementById("shorten-form");
const dataUpdateForm = document.getElementById("data-update");
const passwordUpdateForm = document.getElementById("password-update");
const createFunc = (fields, callback, callbackOptions = {}) => {
    return (event) => {
        event.preventDefault();
        const data = {};

        fields.forEach((element) => {
            data[element] = document.getElementById(element).value;
        });

        callback(data, callbackOptions);
    };
};

if (shortenForm) {
    shortenForm.addEventListener("submit", createFunc(["url"], shorten));
}

if (loginForm) {
    loginForm.addEventListener(
        "submit",
        createFunc(["email", "password"], login)
    );
}
if (signupForm) {
    signupForm.addEventListener(
        "submit",
        createFunc(["name", "email", "password", "passwordConfirm"], signup)
    );
}
if (dataUpdateForm) {
    dataUpdateForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const form = new FormData();
        form.append("name", document.getElementById("name").value);
        form.append("email", document.getElementById("email").value);
        form.append("photo", document.getElementById("photo").files[0]);

        updateSettings(form, {});
    });
}
if (passwordUpdateForm) {
    passwordUpdateForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const data = {};
        const fields = ["oldPassword", "newPassword", "newPasswordConfirm"];

        document.getElementById("password-button").textContent = "Updating...";
        fields.forEach((element) => {
            data[element] = document.getElementById(element).value;
        });
        await updateSettings(data, { type: "password" });
        fields.forEach((element) => {
            document.getElementById(element).value = "";
        });
        document.getElementById("password-button").textContent =
            "Save password";
    });
}
if (logoutBtn) logoutBtn.addEventListener("click", logout);

const alertMessage = document.querySelector("body").dataset.alert;
if (alertMessage) showAlert("success", alertMessage, 20);
