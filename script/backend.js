const SAVE_CONFIG_URL = "https://mdebono.pythonanywhere.com/save_config";
const LOAD_CONFIG_URL = "https://mdebono.pythonanywhere.com/load_config";

const promptTextarea = document.getElementById('prompt-text');
const tempInput = document.getElementById('temperature');
const topPInput = document.getElementById('top-p');
const topKInput = document.getElementById('top-k');
const statusDiv = document.getElementById('status');

const defaultConfig = {
    prompt: `You are an experienced workplace safety inspector with a keen eye for detail.

Format your entire response as a single, valid JSON object with three top-level keys: "description", "PPE" and "hazards".

1. **description**: A description of the workplace, the number of persons identified and what they are doing. When only one person is identified, do not refer to the person as "they".

2. **PPE**: A single descriptive string summarizing the personal protective equipment (PPE) worn by each person identified. Do not use arrays or objects. Example: "The forklift operator is wearing a hard hat, high-visibility vest, and steel-toe boots. The box stacker is wearing gloves and a back support belt."

3. **hazards**: A JSON array containing a list of hazards, where each object represents one distinct safety hazard you identify. Include workplace hazards, work equipment hazards and hazards created by other people, including visitors. Aim to identify a minimum of 6 hazards.

For each hazard in the array, provide:
- 'category': e.g., "PPE", "Ergonomics".
- 'observation': A description of the specific issue.
- 'risk': The risk level: "Low", "Medium", or "High".
- 'markup': An object for the bounding box with percentage-based coordinates.

Order the hazards in the array from high risk to low risk.

If you find no hazards, the 'hazards' key must contain an empty array: [].

Your entire output must be only the JSON object, with no introductory text, comments, or markdown formatting like \`\`\`json.`,
    temperature: 0.0,
    top_p: 1.0,
    top_k: 32
};

function populateForm(config) {
    promptTextarea.value = config.prompt.trim();
    tempInput.value = config.temperature;
    topPInput.value = config.top_p;
    topKInput.value = config.top_k;
}

function resetToDefaults() {
    if (confirm("Are you sure you want to reset the form to the default configuration? Any unsaved changes will be lost.")) {
        populateForm(defaultConfig);
        statusDiv.textContent = 'Form has been reset to defaults. Click "Save Configuration" to make this change permanent.';
        statusDiv.className = 'success';
        statusDiv.style.display = 'block';
    }
}

async function loadCurrentConfiguration() {
    try {
        const response = await fetch(LOAD_CONFIG_URL);
        const currentConfig = await response.json();
        if (!response.ok) { 
            populateForm(defaultConfig);
            console.warn('Could not load config from server, loading defaults.');
        } else {
            populateForm(currentConfig);
        }
    } catch (error) {
        promptTextarea.value = "Could not load configuration from server. Please check the server status and refresh.";
        console.error(error);
    }
}

async function saveConfiguration() {
    statusDiv.textContent = 'Saving...';
    statusDiv.style.display = 'block';
    statusDiv.className = '';
    
    const configData = {
        prompt: promptTextarea.value,
        temperature: parseFloat(tempInput.value),
        top_p: parseFloat(topPInput.value),
        top_k: parseInt(topKInput.value, 10)
    };

    try {
        const response = await fetch(SAVE_CONFIG_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(configData)
        });
        const result = await response.json();
        if (!response.ok) { throw new Error(result.error || `Server Error ${response.status}`); }
        statusDiv.textContent = result.message;
        statusDiv.className = 'success';
    } catch (error) {
        statusDiv.textContent = `Error: ${error.message}`;
        statusDiv.className = 'error';
    }
}

document.addEventListener('DOMContentLoaded', loadCurrentConfiguration);
