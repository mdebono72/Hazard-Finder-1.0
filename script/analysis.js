document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.analyzeBtn === 'undefined') {
        console.error("analysis.js: analyzeBtn not found on window object. Make sure frontend.js is loaded and has initialized it.");
        return;
    }

    const GOOGLE_BACKEND_URL = "https://mdebono.pythonanywhere.com/analyze";

    window.analyzeBtn.addEventListener('click', async () => {
        if (!window.currentFile) {
            alert("No file selected for analysis!");
            return;
        }

        const pbf = window.progressBarFiller;

        // Reset progress bar
        pbf.classList.remove('is-animating', 'is-completing');
        pbf.style.width = '0%';
        pbf.style.backgroundColor = '#007bff';

        window.setState('analyzing');

        // Simulate progress from 0% to 80%
        let simulatedProgress = 0;
        const progressInterval = setInterval(() => {
            if (simulatedProgress < 80) {
                simulatedProgress += 1;
                pbf.style.width = simulatedProgress + '%';
            } 
        }, 50);

        let analysisSuccessful = false;
        let lastError = null;
        const MAX_RETRIES = 3;

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                const formData = new FormData();
                formData.append('file', window.currentFile);

                const response = await fetch(GOOGLE_BACKEND_URL, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) throw new Error(`Server error: ${response.status}`);

                const data = await response.json();

                clearInterval(progressInterval);
                pbf.classList.add('is-completing');
                pbf.style.backgroundColor = '#28a745';
                pbf.style.width = '100%';

                setTimeout(() => {
                    pbf.classList.remove('is-completing');
                }, 400);

                // Render result
                let imageHTML = `
<div id="image-container">
<img id="image-display" src="${window.displayableImageSrc}">
`;

                if (data.markup && Array.isArray(data.markup)) {
                    data.markup.forEach((box, idx) => {
                        const risk = box.risk ? box.risk.toLowerCase() : 'info';
                        imageHTML += `
<div class="markup-box ${risk}" style="
    left: ${box.left}%;
    top: ${box.top}%;
    width: ${box.width}%;
    height: ${box.height}%;
"></div>
<div class="markup-label ${risk}" style="
    left: ${box.left}%;
    top: calc(${box.top}% - 20px);
">
    ${box.name || "Hazard"}
</div>
`;
                    });
                }

                imageHTML += `</div>`;

                let reportHTML = ``;

                if (data.description) {
                    reportHTML += `
<div class="section-title dark-box">Workplace and Identified Activities</div>
<div class="section-content light-box">${data.description}</div>
`;
                }

                if (data.PPE) {
                    reportHTML += `
<div class="section-title dark-box">PPE Assessment</div>
<div class="section-content light-box">${data.PPE}</div>
`;
                }

                reportHTML += `<div class="section-title dark-box">Identified Hazards</div>`;

                if (data.hazards && data.hazards.length > 0) {
                    data.hazards.forEach((hazard, index) => {
                        const riskValue = hazard.risk;
                        const riskClass = (riskValue || 'info').toLowerCase();
                        let riskColor;
                        switch (riskValue) {
                            case "High": riskColor = "#dc3545"; break;
                            case "Medium": riskColor = "#ffc107"; break;
                            case "Low": riskColor = "#17b833"; break;
                            default: riskColor = "#17a2b8";
                        }
                        reportHTML += `
<div class="hazard-card ${riskClass}">
    <div class="hazard-title" style="color:${riskColor}">${hazard.name || "Hazard"}</div>
    <div class="hazard-description">${hazard.description || ""}</div>
    <div><strong>Risk:</strong> ${riskValue || "Info"}</div>
</div>`;
                    });
                } else {
                    reportHTML += `<div>No hazards identified.</div>`;
                }

                // Download buttons (Excel/PDF)
                reportHTML += `<div class="result-actions">
<button class="action-btn" id="downloadExcelBtn">Download Excel</button>
<button class="action-btn" id="downloadPdfBtn">Download PDF</button>
<button class="action-btn" id="resetBtn">Analyze Another Image</button>
</div>
`;

                window.analysisResult.innerHTML = imageHTML + reportHTML;
                document.getElementById('resetBtn').addEventListener('click', window.resetToInitialState);

                // Attach download event listeners if implemented
                const downloadExcelBtn = document.getElementById('downloadExcelBtn');
                const downloadPdfBtn = document.getElementById('downloadPdfBtn');
                if (downloadExcelBtn) {
                    downloadExcelBtn.addEventListener('click', () => {
                        // Insert your Excel download logic here
                        alert("Excel download not implemented in this sample.");
                    });
                }
                if (downloadPdfBtn) {
                    downloadPdfBtn.addEventListener('click', () => {
                        // Insert your PDF download logic here
                        alert("PDF download not implemented in this sample.");
                    });
                }

                window.setState('results-shown');
                analysisSuccessful = true;
                break;
            } catch (error) {
                console.error("A non-recoverable error occurred during analysis:", error);
                lastError = error;
                break;
            }
        }

        if (!analysisSuccessful) {
            clearInterval(progressInterval);
            pbf.classList.add('is-completing');
            pbf.style.backgroundColor = '#dc3545';
            pbf.style.width = '100%';
            await new Promise(resolve => setTimeout(resolve, 400));
            pbf.classList.remove('is-completing');
            alert(
                "There was an error analyzing the image." +
                (lastError ? `\n\nDetails: ${lastError.message || lastError}` : "")
            );
            window.setState('image-loaded');
        }
    });
});
