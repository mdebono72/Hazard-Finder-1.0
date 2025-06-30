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
        pbf.classList.remove('is-animating', 'is-completing', 'indeterminate');
        pbf.style.width = '0%';
        pbf.style.backgroundColor = '#007bff';

        window.setState('analyzing');

        // Simulate progress from 0% to 90%
        let simulatedProgress = 0;
        const progressInterval = setInterval(() => {
            if (simulatedProgress < 90) {
                simulatedProgress += 1;
                pbf.style.width = simulatedProgress + '%';
            } else {
                clearInterval(progressInterval);
            }
        }, 100); // Increase every 100ms

        const MAX_RETRIES = 3;
        let analysisSuccessful = false;
        let lastError = null;

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                const formData = new FormData();
                formData.append('image', window.currentFile);

                const response = await fetch(GOOGLE_BACKEND_URL, { method: 'POST', body: formData });
                const data = await response.json();
                console.log(`Received data from backend (attempt ${attempt}):`, data);

                if (!response.ok) {
                    throw new Error(data.error || `Server Error ${response.status}`);
                }

                let validationPassed = true;
                if (data.hazards && data.hazards.length > 0) {
                    for (const hazard of data.hazards) {
                        if (hazard.markup) {
                            const { top, left, width, height } = hazard.markup;
                            const areNumbers = [top, left, width, height].every(v => typeof v === 'number' && !isNaN(v));
                            if (!areNumbers || top < 0 || left < 0 || width <= 0 || height <= 0 || (top + height) > 100.1 || (left + width) > 100.1) {
                                console.warn(`Validation failed on attempt ${attempt}: Invalid markup found.`, hazard.markup);
                                lastError = new Error("The AI returned invalid markup coordinates.");
                                validationPassed = false;
                                break;
                            }
                        }
                    }
                }

                if (validationPassed) {
                    analysisSuccessful = true;

                    clearInterval(progressInterval);
                    pbf.style.width = '100%';
                    pbf.classList.add('is-completing');
                    await new Promise(resolve => setTimeout(resolve, 500));
                    pbf.classList.remove('is-completing');

                    // Build the report
                    let reportHTML = '';
                    let imageHTML = '';
                    imageHTML += `
<div class="section-title dark-box">Analysis Results</div><br>
<div id="image-container">
<img id="image-display" src="${window.displayableImageSrc}">
`;

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
                                default: riskColor = "#000000";
                            }

                            reportHTML += `<div class="hazard-card ${riskClass}">` +
                                `<strong>[${index + 1}] ${hazard.category}:</strong> ${hazard.observation}<br>` +
                                `<strong>Risk Level: <span style="color:${riskColor};">${riskValue || 'N/A'}</span></strong>` +
                                `</div>`;

                            if (hazard.markup) {
                                const { top, left, width, height } = hazard.markup;
                                imageHTML += `
<div class="markup-box ${riskClass}" style="top:${top}%; left:${left}%; width:${width}%; height:${height}%;"></div>
<div class="markup-label ${riskClass}" style="top:${top}%; left:${left}%;">${index + 1}</div>
`;
                            }
                        });
                    } else {
                        reportHTML += `<p>No specific hazards were identified in this image.</p>`;
                    }

                    imageHTML += `</div>`;
                    const resetButtonHTML = `
<div class="result-actions">
<button class="action-btn" id="resetBtn">Analyze Another Image</button>
</div>
`;

                    window.analysisResult.innerHTML = imageHTML + reportHTML + resetButtonHTML;
                    document.getElementById('resetBtn').addEventListener('click', window.resetToInitialState);
                    window.setState('results-shown');
                    break;
                } else {
                    console.log(`Retrying analysis (attempt ${attempt + 1} of ${MAX_RETRIES})...`);
                }

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

            const finalErrorMessage = (lastError && lastError.message.includes("Server Error"))
                ? lastError.message
                : "The analysis could not be completed because the AI returned inconsistent data after multiple attempts. Please try again.";

            window.analysisResult.innerHTML = `<h3 style="color:red;">Error</h3><p>${finalErrorMessage}</p><div class="result-actions"><button class="action-btn" id="resetBtn">Try Again</button></div>`;
            document.getElementById('resetBtn').addEventListener('click', window.resetToInitialState);
            window.setState('results-shown');
        }
    });
});
