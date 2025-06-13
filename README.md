# Risk Alert 🚨

Risk Alert is an AI-powered web application designed to **identify safety hazards in photos** using **computer vision**. It helps detect potential risks in workplaces, construction sites, or any environment where safety is a priority.

## Features
✅ **Hazard Detection** – Identifies missing safety gear, fire risks, and environmental hazards.  
✅ **FastAPI Backend** – Lightweight, efficient, and scalable Python-based server.  
✅ **YOLO & OpenCV Integration** – Uses machine learning for advanced image analysis.  
✅ **Web-Based Interface** – Simple HTML + JavaScript frontend for easy usage.  
✅ **Free & Open Source** – Designed for public use and improvement by the community.  

## Technologies Used
- **Frontend:** HTML, CSS, JavaScript  
- **Backend:** FastAPI (Python)  
- **Image Processing:** OpenCV, YOLO  
- **Hosting:** GitHub Pages (Frontend), Render (Backend)  

## How to Use
1. Upload an image of the environment.
2. The AI scans for potential **safety hazards**.
3. Detected risks are displayed with visual indicators.

## Installation
To run locally:
```sh
git clone https://github.com/YOUR_USERNAME/risk-alert.git
cd risk-alert
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000
