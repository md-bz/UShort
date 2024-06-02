import axios from "axios";
import { showAlert } from "./alerts";
export const signup = async ({ name, email, password, passwordConfirm }) => {
    if (password != passwordConfirm) {
        return showAlert(
            "error",
            "Password and password confirm should be the same!"
        );
    }
    try {
        const res = await axios({
            method: "POST",
            url: "/api/v1/users/signup",
            data: {
                name,
                email,
                password,
                passwordConfirm,
            },
        });
        if (res.data.status === "success") {
            showAlert("success", "Sign up was successful");
            location.assign("/");
        }
    } catch (error) {
        showAlert("error", error.response.data.message);
    }
};
