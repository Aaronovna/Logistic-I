const updateStatus = async ( url = "", payload = {}, onSuccess = () => { } ) => {
    if (!url) {
        console.error("Error: API URL is required.");
        return;
    }

    try {
        const response = await axios.patch(url, payload);
        onSuccess();
        return response.data;
    } catch (error) {
        console.error("Error updating status:", error.response?.data || error.message);
    }
};

export default updateStatus;