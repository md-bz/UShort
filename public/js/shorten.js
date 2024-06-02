import axios from "axios";
import { showAlert } from "./alerts";

export const shorten = async ({ url }) => {
    try {
        const res = await axios({
            method: "POST",
            url: "/api/v1/urls/",
            data: {
                url,
            },
        });
        if (res.data.status === "success") {
            showAlert("success", "shortened successfully");
            // location.assign("/");
            console.log(res.data);
            const shortUrl = document.getElementById("short-url");

            shortUrl.style.display = "inline";
            document.getElementById("short-url-link").href =
                res.data.data.url.shortUrl;
            document.getElementById("short-url-link").innerText =
                res.data.data.url.shortUrl;
        }
    } catch (error) {
        showAlert("error", error.response.data.message);
    }
};
