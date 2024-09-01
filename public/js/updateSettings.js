import { showAlert } from "./alerts";

import axios from "axios";

export const updateSettings = async (data, { type = "data" }) => {
    try {
        const url = type === "data" ? "update-me" : "change-password";

        const res = await axios({
            method: "PATCH",
            url: `/api/v1/users/${url}`,
            data,
        });
        if (res.data.status === "success") {
            showAlert("success", `${type.toUpperCase()} updated successfully`);
        }
        location.reload();
    } catch (error) {
        showAlert("error", error);
    }
};
