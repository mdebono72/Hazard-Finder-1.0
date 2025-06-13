async function uploadImage() {
    const file = document.getElementById('fileInput').files[0];
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData
    });

    const data = await response.json();
    document.getElementById("result").innerText = "Detected Hazards: " + data.hazards.join(", ");
}
