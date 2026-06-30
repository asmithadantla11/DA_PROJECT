import csv
import json
import sys
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
OUTPUT_CSV = PROJECT_ROOT / "data" / "Transformed_Housing_Data.csv"
REPORT_JSON = PROJECT_ROOT / "data" / "validation_report.json"
REFERENCE_YEAR = 2023


FIELD_MAP = {
    "price": "Sale Price",
    "bedrooms": "No of Bedrooms",
    "bathrooms": "No of Bathrooms",
    "floors": "No of Floors",
    "sqft_living": "Flat Area (in Sqft)",
    "sqft_basement": "Basement Area (in Sqft)",
    "yr_built": "Built Year",
    "yr_renovated": "Renovation Year",
}


def to_float(row, key, default=0.0):
    value = row.get(key, "")
    return default if value in ("", None) else float(value)


def to_int(row, key, default=0):
    return int(round(to_float(row, key, default)))


def sale_price_bin(price):
    rounded = int(round(price / 25000) * 25000)
    rounded = max(250000, min(625000, rounded))
    return f"{rounded // 1000}K"


def transform_row(row):
    sale_price = to_int(row, "price")
    built_year = to_int(row, "yr_built")
    renovation_year = to_int(row, "yr_renovated")
    was_renovated = renovation_year > 0
    house_age = max(0, REFERENCE_YEAR - built_year)
    years_since_renovation = max(0, REFERENCE_YEAR - renovation_year) if was_renovated else 0

    transformed = {output: row.get(source, "") for source, output in FIELD_MAP.items()}
    transformed.update(
        {
            "Sale Price": sale_price,
            "Built Year": built_year,
            "Renovation Year": renovation_year,
            "Age of House (in Years)": house_age,
            "Years Since Renovation": years_since_renovation,
            "Ever Renovated": "Yes" if was_renovated else "No",
            "Sale Price Bin": sale_price_bin(sale_price),
        }
    )
    return transformed


def validate(rows):
    required = [
        "Sale Price",
        "No of Bedrooms",
        "No of Bathrooms",
        "No of Floors",
        "Flat Area (in Sqft)",
        "Basement Area (in Sqft)",
        "Age of House (in Years)",
        "Years Since Renovation",
        "Ever Renovated",
        "Sale Price Bin",
    ]
    null_counts = {
        field: sum(1 for row in rows if row.get(field) in ("", None))
        for field in required
    }
    prices = [int(row["Sale Price"]) for row in rows]
    basement_total = sum(int(float(row["Basement Area (in Sqft)"] or 0)) for row in rows)

    return {
        "row_count": len(rows),
        "required_fields": required,
        "null_counts": null_counts,
        "sale_price_min": min(prices) if prices else None,
        "sale_price_max": max(prices) if prices else None,
        "sale_price_average": round(sum(prices) / len(prices), 2) if prices else None,
        "basement_area_total": basement_total,
        "ready_for_tableau": bool(rows) and all(count == 0 for count in null_counts.values()),
    }


def main():
    if len(sys.argv) != 2:
        print("Usage: python scripts/prepare_housing_data.py path\\to\\kc_house_data.csv")
        return 2

    source_path = Path(sys.argv[1])
    if not source_path.exists():
        print(f"Input file not found: {source_path}")
        return 1

    with source_path.open(newline="", encoding="utf-8-sig") as source_file:
        reader = csv.DictReader(source_file)
        rows = [transform_row(row) for row in reader]

    OUTPUT_CSV.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_CSV.open("w", newline="", encoding="utf-8") as output_file:
        writer = csv.DictWriter(output_file, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)

    report = validate(rows)
    REPORT_JSON.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))
    return 0 if report["ready_for_tableau"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
