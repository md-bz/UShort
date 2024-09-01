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
            const shortUrl = res.data.data.url.shortUrl;

            document.getElementById("shorten-header").innerText =
                "Here's Your short link";

            // document.getElementById("shorten-form").style.display = "none";

            // const shortLinkElement = document.getElementById("short-link");
            const shortLinkLi = document.createElement("li");
            shortLinkLi.style.display = "inline";
            const shortLinkA = document.createElement("a");
            shortLinkA.href = shortUrl;
            shortLinkA.innerText = shortUrl;

            shortLinkLi.appendChild(shortLinkA);
            document.getElementById("links").appendChild(shortLinkLi);
        }
    } catch (error) {
        console.log(error);

        showAlert("error", error.response.data.message);
    }
};

export const getMyUrls = async({ url });
