import { useState } from "react";
import axios from "axios";

const useUpdateStatus = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const updateStatus = async (url = "", payload = {}) => {
        if (!url) {
            console.error("Error: API URL is required.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.patch(url, payload);
            return response;
        } catch (err) {
            setError(err);
            toast.error(`${error.status} ${error.response.data.message}`);
        } finally {
            setLoading(false);
        }
    };

    return { updateStatus, loading, error };
};

export default useUpdateStatus;