// --- Global Variables and Elements ---
// This makes them accessible to the other scripts (analysis.js) by attaching them to the window object.
window.currentFile = null;
window.displayableImageSrc = null; // To hold the potentially resized image source for UI display

const loaderContainer = document.getElementById('loaderContainer');
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const browseBtn = document.getElementById('browseBtn');
const imagePreview = document.getElementById('imagePreview');
const fileDetails = document.getElementById('fileDetails');
const analysisControls = document.getElementById('analysisControls');
window.analyzeBtn = document.getElementById('analyzeBtn');
window.progressBarFiller = document.getElementById('progressBarFiller');
window.analysisResult = document.getElementById('analysisResult');

// --- State Management ---
window.setState = (state) => {
    loaderContainer.className = 'image-loader-container';
    loaderContainer.classList.add(state);
};

// --- Utility Functions ---
const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// --- File Handling ---
const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
        window.currentFile = file; // Keep the original file for analysis
        const reader = new FileReader();

        reader.onload = (e) => {
            const dataUrl = e.target.result;
            const tempImg = new Image();

            tempImg.onload = () => {
                const MAX_WIDTH = 800;
                window.displayableImageSrc = dataUrl; // Default to the original image data

                // Check if resizing is needed for display
                if (tempImg.naturalWidth > MAX_WIDTH) {
                    const canvas = document.createElement('canvas');
                    const aspectRatio = tempImg.naturalHeight / tempImg.naturalWidth;
                    canvas.width = MAX_WIDTH;
                    canvas.height = MAX_WIDTH * aspectRatio;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(tempImg, 0, 0, canvas.width, canvas.height);
                    window.displayableImageSrc = canvas.toDataURL(file.type); // Overwrite with resized image data
                }

                // Create the image element for the preview with the final URL
                const previewImg = document.createElement('img');
                previewImg.src = window.displayableImageSrc;
                previewImg.alt = file.name;

                // Update the DOM
                imagePreview.innerHTML = '';
                imagePreview.appendChild(previewImg);
                imagePreview.appendChild(fileDetails);
                fileDetails.textContent = file.name;
                window.setState('image-loaded');
            };

            tempImg.src = dataUrl; // Trigger the temp image load
        };

        reader.readAsDataURL(file);
    } else {
        alert('Please select an image file!');
        window.resetToInitialState();
    }
};

// --- Reset Function ---
window.resetToInitialState = () => {
    window.currentFile = null;
    window.displayableImageSrc = null; // Reset the display image source
    fileInput.value = null;
    imagePreview.innerHTML = '';
    analysisResult.innerHTML = '';
    // Ensure fileDetails is re-appended if it was removed
    if (!imagePreview.contains(fileDetails)) {
        imagePreview.appendChild(fileDetails);
    }
    dropZone.classList.remove('drag-over');
    window.progressBarFiller.style.transition = 'none';
    window.progressBarFiller.style.width = '0%';
    window.setState('initial-state');
};


// --- Event Listeners for Upload ---
document.addEventListener('DOMContentLoaded', () => {
    browseBtn.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('click', (e) => {
        if (!window.currentFile && e.target.id !== 'browseBtn') {
            fileInput.click();
        }
    });
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) handleFile(fileInput.files[0]);
    });

    // --- Drag and Drop Events ---
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    });
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            if (!window.currentFile) dropZone.classList.add('drag-over');
        });
    });
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.remove('drag-over'));
    });
    dropZone.addEventListener('drop', (e) => {
        if (!window.currentFile && e.dataTransfer.files.length) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    // Initialize the component
    window.resetToInitialState();
});
