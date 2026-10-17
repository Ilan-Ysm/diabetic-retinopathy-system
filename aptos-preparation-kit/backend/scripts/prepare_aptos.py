"""Validate APTOS 2019 labeled fundus data and create reproducible stratified splits.

Run inside the existing FastAPI backend container:
  python -m scripts.prepare_aptos --data-dir /app/data/aptos2019

IMPORTANT: The split is image-level, not guaranteed patient-level; patient identity is
not provided in APTOS train.csv. Do not claim clinical-level external validation.
"""
from __future__ import annotations

import argparse
import csv
import json
import random
from collections import Counter
from pathlib import Path

CLASSES = set(range(5))
EXPECTED_FIELDS = {"id_code", "diagnosis"}


def _read_labels(csv_path: Path, image_dir: Path) -> list[dict[str, str]]:
    if not csv_path.is_file():
        raise ValueError(f"Нет файла разметки: {csv_path}")
    if not image_dir.is_dir():
        raise ValueError(f"Нет папки с изображениями: {image_dir}")

    with csv_path.open("r", encoding="utf-8-sig", newline="") as stream:
        reader = csv.DictReader(stream)
        if not reader.fieldnames or not EXPECTED_FIELDS.issubset(reader.fieldnames):
            raise ValueError("train.csv должен содержать столбцы id_code,diagnosis")
        rows = list(reader)

    result: list[dict[str, str]] = []
    ids_seen: set[str] = set()
    missing_images: list[str] = []
    for line, row in enumerate(rows, start=2):
        name = (row.get("id_code") or "").strip()
        label = (row.get("diagnosis") or "").strip()
        if not name or not name.replace("_", "").replace("-", "").isalnum():
            raise ValueError(f"Некорректный id_code в строке {line}: {name!r}")
        if name in ids_seen:
            raise ValueError(f"Повторяющийся id_code: {name}")
        ids_seen.add(name)
        try:
            grade = int(label)
        except ValueError as exc:
            raise ValueError(f"Неизвестная метка в строке {line}: {label!r}") from exc
        if grade not in CLASSES:
            raise ValueError(f"Метка вне диапазона 0..4 в строке {line}: {grade}")
        img_path = image_dir / f"{name}.png"
        if not img_path.is_file():
            missing_images.append(name)
        result.append({"id_code": name, "diagnosis": str(grade)})

    if missing_images:
        sample = ", ".join(missing_images[:5])
        raise ValueError(f"Не найдены {len(missing_images)} PNG из train.csv, например: {sample}")
    if not result:
        raise ValueError("В train.csv нет записей")
    return result


def _verify_images(rows: list[dict[str, str]], image_dir: Path) -> None:
    from PIL import Image, UnidentifiedImageError

    for i, row in enumerate(rows, 1):
        img_path = image_dir / f"{row['id_code']}.png"
        try:
            with Image.open(img_path) as image:
                if image.format != "PNG":
                    raise ValueError(f"Не PNG файл: {img_path}")
                image.verify()
        except (UnidentifiedImageError, OSError) as exc:
            raise ValueError(f"Повреждённое изображение: {img_path}") from exc
        if i % 500 == 0:
            print(f"Проверены изображения: {i}/{len(rows)}")


def _allocate(n: int) -> tuple[int, int, int]:
    """Approximate 70/15/15 with at least one sample in each subset/class."""
    if n < 3:
        raise ValueError("В каждом из пяти классов должно быть хотя бы 3 снимка")
    val_n = max(1, round(n * 0.15))
    test_n = max(1, round(n * 0.15))
    if val_n + test_n >= n:
        val_n, test_n = 1, 1
    return n - val_n - test_n, val_n, test_n


def stratified_split(rows: list[dict[str, str]], seed: int = 42) -> dict[str, list[dict[str, str]]]:
    by_grade: dict[int, list[dict[str, str]]] = {c: [] for c in sorted(CLASSES)}
    for row in rows:
        by_grade[int(row["diagnosis"])].append(row)
    rng = random.Random(seed)
    sets = {"train": [], "val": [], "test": []}
    for grade, group in by_grade.items():
        if len(group) < 3:
            raise ValueError(f"Класс {grade}: всего {len(group)} изображений (нужно >= 3)")
        copied = group[:]
        rng.shuffle(copied)
        train_n, val_n, _ = _allocate(len(copied))
        sets["train"].extend(copied[:train_n])
        sets["val"].extend(copied[train_n : train_n + val_n])
        sets["test"].extend(copied[train_n + val_n :])
    for group in sets.values():
        rng.shuffle(group)
    ids = [item["id_code"] for group in sets.values() for item in group]
    assert len(ids) == len(set(ids)) == len(rows), "Утечка/потеря изображений при разделении"
    return sets


def _write_csv(path: Path, rows: list[dict[str, str]]) -> None:
    with path.open("w", encoding="utf-8", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=["id_code", "diagnosis"])
        writer.writeheader()
        writer.writerows(rows)


def prepare(data_dir: Path, out_dir: Path, seed: int = 42, verify_images: bool = False) -> dict:
    rows = _read_labels(data_dir / "train.csv", data_dir / "train_images")
    if verify_images:
        _verify_images(rows, data_dir / "train_images")
    sets = stratified_split(rows, seed)
    out_dir.mkdir(parents=True, exist_ok=True)
    for name, group in sets.items():
        _write_csv(out_dir / f"{name}.csv", group)
    report = {
        "dataset": "APTOS2019 training portion",
        "seed": seed,
        "method": "deterministic stratified image-level 70/15/15 split",
        "note": "No patient IDs in train.csv; patient-level independence is NOT verified. "
                "Kaggle public test.csv has no diagnostic labels and is NOT used for scoring.",
        "images": len(rows),
        "overall": {str(k): v for k, v in sorted(Counter(r["diagnosis"] for r in rows).items())},
        "splits": {
            name: {"total": len(group), "grades": {str(k): v for k, v in sorted(Counter(r["diagnosis"] for r in group).items())}}
            for name, group in sets.items()
        },
    }
    (out_dir / "split_report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return report


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data-dir", type=Path, default=Path("/app/data/aptos2019"))
    parser.add_argument("--out-dir", type=Path, default=Path("/app/data/aptos2019/splits"))
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--verify-images", action="store_true", help="Check the integrity of every PNG (slower)")
    args = parser.parse_args()
    try:
        report = prepare(args.data_dir, args.out_dir, args.seed, args.verify_images)
    except ValueError as exc:
        parser.exit(2, f"Ошибка подготовки данных: {exc}\n")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    print(f"\nГотово! train.csv, val.csv, test.csv и split_report.json: {args.out_dir}")


if __name__ == "__main__":
    main()
