#!/usr/bin/env python3
from __future__ import annotations

import csv
from collections import Counter
from pathlib import Path


ROOT = Path("/Users/santinodegra/Documents/VSCODE/olmos-bebidas")
INPUT_PRODUCTS = Path("/Users/santinodegra/Downloads/lista de precios - Productos-3.csv")
INPUT_CATEGORIES = Path("/Users/santinodegra/Downloads/lista de precios - Categorias.csv")
OUTPUT_DIR = ROOT / "outputs" / "recategorizacion"
OUTPUT_PRODUCTS = OUTPUT_DIR / "lista de precios - Productos-3-recategorizado.csv"
OUTPUT_CATEGORIES = OUTPUT_DIR / "lista de precios - Categorias-recategorizadas.csv"
OUTPUT_SUMMARY = OUTPUT_DIR / "resumen-recategorizacion.csv"
OUTPUT_REVIEW = OUTPUT_DIR / "revisar-recategorizaciones.csv"


CATEGORY_STRUCTURE = [
    {
        "category": "Combos",
        "subcategories": ["Combos"],
        "note": "Promos queda como filtro dinamico por Destacado o Descuento.",
    },
    {
        "category": "Vinos y espumantes",
        "subcategories": ["Vinos", "Espumantes", "Champagne"],
        "note": "Familia para vinos tranquilos, espumantes y champagne.",
    },
    {
        "category": "Cervezas",
        "subcategories": ["Cervezas", "Listas para tomar"],
        "note": "Incluye cervezas y bebidas alcoholicas gasificadas/RTD.",
    },
    {
        "category": "Destilados",
        "subcategories": [
            "Whisky",
            "Gin",
            "Vodka",
            "Ron",
            "Tequila",
            "Licores",
            "Pisco",
            "Coñac",
            "Grapas",
        ],
        "note": "Bebidas espirituosas y licores.",
    },
    {
        "category": "Aperitivos y coctelería",
        "subcategories": [
            "Aperitivos",
            "Vermouth",
            "Botánicos",
            "Pulpas",
            "Hielo",
            "Copas y utensilios",
        ],
        "note": "Insumos para aperitivo, cocteles y servicio.",
    },
    {
        "category": "Sin alcohol",
        "subcategories": [
            "Gaseosas",
            "Aguas",
            "Agua saborizada",
            "Jugos",
            "Energizantes",
            "Sin alcohol",
        ],
        "note": "Bebidas sin alcohol.",
    },
    {
        "category": "Snacks y almacén",
        "subcategories": [
            "Snacks",
            "Alfajores",
            "Chocolates",
            "Golosinas",
            "Conservas",
            "Mermeladas",
            "Aceite de oliva",
        ],
        "note": "Kiosco, picadas y almacen.",
    },
    {
        "category": "Regalos y varios",
        "subcategories": [
            "Estuchería y regalos",
            "Artículos para fumar",
            "Preservativos",
            "Varios",
        ],
        "note": "Regalos, accesorios no gastronomicos y miscelaneos.",
    },
]


BASE_CATEGORY_MAP = {
    "Combos y Promociones": ("Combos", "Combos"),
    "Vinos": ("Vinos y espumantes", "Vinos"),
    "Espumantes": ("Vinos y espumantes", "Espumantes"),
    "Champagne": ("Vinos y espumantes", "Champagne"),
    "Cervezas": ("Cervezas", "Cervezas"),
    "Bebidas Alcohólicas Gasificadas": ("Cervezas", "Listas para tomar"),
    "Whisky": ("Destilados", "Whisky"),
    "Gin": ("Destilados", "Gin"),
    "Vodka": ("Destilados", "Vodka"),
    "Ron": ("Destilados", "Ron"),
    "Tequila": ("Destilados", "Tequila"),
    "Licores": ("Destilados", "Licores"),
    "Licor de Hierbas": ("Destilados", "Licores"),
    "Pisco": ("Destilados", "Pisco"),
    "Coñac": ("Destilados", "Coñac"),
    "Grapas": ("Destilados", "Grapas"),
    "Aperitivos": ("Aperitivos y coctelería", "Aperitivos"),
    "Vermouth": ("Aperitivos y coctelería", "Vermouth"),
    "Botánicos": ("Aperitivos y coctelería", "Botánicos"),
    "Pulpas": ("Aperitivos y coctelería", "Pulpas"),
    "Hielo": ("Aperitivos y coctelería", "Hielo"),
    "Copas y Utensilios": ("Aperitivos y coctelería", "Copas y utensilios"),
    "Gaseosas": ("Sin alcohol", "Gaseosas"),
    "Aguas": ("Sin alcohol", "Aguas"),
    "Agua Saborizada": ("Sin alcohol", "Agua saborizada"),
    "Jugos": ("Sin alcohol", "Jugos"),
    "Energizantes": ("Sin alcohol", "Energizantes"),
    "Sin alcohol": ("Sin alcohol", "Sin alcohol"),
    "Snacks": ("Snacks y almacén", "Snacks"),
    "Alfajores": ("Snacks y almacén", "Alfajores"),
    "Chocolates": ("Snacks y almacén", "Chocolates"),
    "Chicles y Golosinas": ("Snacks y almacén", "Golosinas"),
    "Conservas": ("Snacks y almacén", "Conservas"),
    "Mermeladas": ("Snacks y almacén", "Mermeladas"),
    "Aceite de Oliva": ("Snacks y almacén", "Aceite de oliva"),
    "Estuchería y Regalos": ("Regalos y varios", "Estuchería y regalos"),
    "Artículos para Fumar": ("Regalos y varios", "Artículos para fumar"),
    "Preservativos": ("Regalos y varios", "Preservativos"),
    "Varios": ("Regalos y varios", "Varios"),
}


KEYWORD_OVERRIDES = [
    ("vermouth", ("Aperitivos y coctelería", "Vermouth")),
    ("fernet", ("Aperitivos y coctelería", "Aperitivos")),
    ("campari", ("Aperitivos y coctelería", "Aperitivos")),
    ("aperol", ("Aperitivos y coctelería", "Aperitivos")),
    ("cynar", ("Aperitivos y coctelería", "Aperitivos")),
    ("gancia", ("Aperitivos y coctelería", "Aperitivos")),
    ("martini", ("Aperitivos y coctelería", "Vermouth")),
    ("cinzano", ("Aperitivos y coctelería", "Vermouth")),
]

PROTECTED_CATEGORY_OVERRIDES = {
    "Combos y Promociones",
    "Estuchería y Regalos",
    "Bebidas Alcohólicas Gasificadas",
}


def normalize(value: str) -> str:
    return value.casefold().strip()


def classify(row: dict[str, str]) -> tuple[str, str]:
    original_category = row.get("Categoria", "").strip()
    if original_category in PROTECTED_CATEGORY_OVERRIDES:
        return BASE_CATEGORY_MAP[original_category]

    name = normalize(row.get("Producto", ""))
    for keyword, result in KEYWORD_OVERRIDES:
        if keyword in name:
            return result

    return BASE_CATEGORY_MAP.get(original_category, ("Regalos y varios", "Varios"))


def read_csv(path: Path) -> list[list[str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        return list(csv.reader(handle))


def write_csv(path: Path, rows: list[list[str]]) -> None:
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerows(rows)


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    category_rows = read_csv(INPUT_CATEGORIES)
    product_rows = read_csv(INPUT_PRODUCTS)
    if len(product_rows) < 2:
        raise RuntimeError("La planilla de productos no tiene las dos filas de encabezado esperadas.")

    header = product_rows[0]
    helper = product_rows[1]
    category_index = header.index("Categoria")

    output_product_rows: list[list[str]] = [
        header + ["Subcategoria", "Categoria Original"],
        helper + [
            "Subcategoria dentro de la categoria principal",
            "Categoria anterior antes de la reorganizacion",
        ],
    ]

    summary = Counter()
    original_summary = Counter()
    review_rows = [["SKU", "Producto", "Categoria Original", "Categoria Nueva", "Subcategoria"]]
    product_count = 0

    for source in product_rows[2:]:
        row = list(source)
        if len(row) < len(header):
            row += [""] * (len(header) - len(row))

        row_dict = dict(zip(header, row))
        if not row_dict.get("Producto", "").strip():
            output_product_rows.append(row + ["", row[category_index].strip()])
            continue

        product_count += 1
        original_category = row[category_index].strip()
        category, subcategory = classify(row_dict)
        if original_category and BASE_CATEGORY_MAP.get(original_category) != (category, subcategory):
            review_rows.append([
                row_dict.get("SKU", ""),
                row_dict.get("Producto", ""),
                original_category,
                category,
                subcategory,
            ])

        row[category_index] = category
        output_product_rows.append(row + [subcategory, original_category])
        summary[(category, subcategory)] += 1
        original_summary[original_category] += 1

    category_output_rows = [
        ["Categorias", "Subcategorias", "Notas"],
        [
            "← Categorias principales para la web",
            "Subcategorias sugeridas para filtros de segundo nivel",
            "Promos no es una categoria: sale de Destacado o Descuento.",
        ],
    ]
    for item in CATEGORY_STRUCTURE:
        category_output_rows.append([
            item["category"],
            " | ".join(item["subcategories"]),
            item["note"],
        ])

    summary_rows = [
        ["Categoria nueva", "Subcategoria", "Cantidad de productos"],
    ]
    for (category, subcategory), count in sorted(summary.items()):
        summary_rows.append([category, subcategory, str(count)])

    summary_rows.extend([
        [],
        ["Categoria original", "Cantidad de productos"],
    ])
    for category, count in sorted(original_summary.items()):
        summary_rows.append([category, str(count)])

    summary_rows.extend([
        [],
        ["Productos con recategorizacion por palabra clave", str(len(review_rows) - 1)],
        ["Filas de categorias fuente", str(len(category_rows))],
        ["Productos con nombre procesados", str(product_count)],
        ["Filas de productos fuente", str(len(product_rows))],
    ])

    write_csv(OUTPUT_PRODUCTS, output_product_rows)
    write_csv(OUTPUT_CATEGORIES, category_output_rows)
    write_csv(OUTPUT_SUMMARY, summary_rows)
    write_csv(OUTPUT_REVIEW, review_rows)

    print(f"Productos: {OUTPUT_PRODUCTS}")
    print(f"Categorias: {OUTPUT_CATEGORIES}")
    print(f"Resumen: {OUTPUT_SUMMARY}")
    print(f"Revision: {OUTPUT_REVIEW}")
    print(f"Productos procesados: {product_count}")
    print(f"Categorias nuevas: {len(CATEGORY_STRUCTURE)}")
    print(f"Recategorizaciones por palabra clave: {len(review_rows) - 1}")


if __name__ == "__main__":
    main()
