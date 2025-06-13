const BACKEND_URL = "http://localhost:8000/upload"; // Adjust when deploying

async function uploadImage() {
    const file = document.getElementById("fileInput").files[0];
    const formData = new FormData();
    formData.append("image", file);

    try {
        const response = await fetch(BACKEND_URL, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) throw new Error("Failed to analyze image");

        const data = await response.json();
        document.getElementById("result").innerText = "Detected Hazards: " + data.hazards.join(", ");
    } catch (error) {
        console.error("Error:", error);
        document.getElementById("result").innerText = "Error processing image.";
    }
}
