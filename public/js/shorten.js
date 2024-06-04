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
            console.log(res.data);
            const shortUrl = res.data.data.url.shortUrl;

            document.getElementById("shorten-header").innerText =
                "Here's Your short link";

            document.getElementById("shorten-form").style.display = "none";

            const shortLinkElement = document.getElementById("short-link");
            shortLinkElement.style.display = "inline";
            shortLinkElement.href = shortUrl;
            shortLinkElement.innerText = shortUrl;
        }
    } catch (error) {
        console.log(error);

        showAlert("error", error.response.data.message);
    }
};
