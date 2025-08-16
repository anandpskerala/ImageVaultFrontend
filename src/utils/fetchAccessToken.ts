import config from "@/config";
import axios from "axios";

export const fetchAccessToken = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    await axios.post(
        `${config.backendUrl}/auth/refresh`,
        {},
        {
            withCredentials: true,
            signal: controller.signal,
        }
    );
    clearTimeout(timeoutId);
}