# Housing Trends Flask + Tableau Project

This project is a from-scratch Flask web application for a Tableau housing analysis workflow. It includes:

- A clean web UI with Home, About, Dashboard, and Story pages.
- A local Tableau-style dashboard fallback built with HTML, CSS, and JavaScript.
- A configurable Tableau Public embed slot for your published workbook.
- A sample finalized housing dataset and a repeatable data preparation script.

## Run locally

```powershell
python -m pip install -r requirements.txt
python app.py
```

Open `http://127.0.0.1:5000`.

## Deploy on GitHub Pages

GitHub Pages can serve the static `index.html` file in this repository. It cannot run the Flask `app.py` backend, so use `index.html` for GitHub Pages deployment and use `app.py` for the local Flask version.

## Use a Tableau Public dashboard

After publishing your workbook to Tableau Public, open `templates/dashboard.html` and replace the empty `data-tableau-url` value with your public view URL.

Example:

```html
<div id="tableau-embed" class="tableau-embed" data-tableau-url="https://public.tableau.com/views/YourWorkbook/YourDashboard"></div>
```

If no Tableau URL is provided, the app shows the built-in local dashboard.

## Prepare Kaggle data

Download the Kaggle housing CSV manually, then run:

```powershell
python scripts/prepare_housing_data.py path\to\kc_house_data.csv
```

The script writes:

- `data/Transformed_Housing_Data.csv`
- `data/validation_report.json`

The transformed file includes house age, renovation status, years since renovation, and sale price bins for Tableau analysis.

To rebuild the included finalized demonstration dataset with the same KPI totals used in the dashboard:

```powershell
python scripts/generate_final_dataset.py
```
