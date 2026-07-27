#!/usr/bin/env python3
"""Optimize LUMERIFT-owned source PNGs for mobile game production.

Third-party originals under art_source/open_art are intentionally left unchanged.
This tool is deterministic for the current Pillow version and preserves RGBA.
"""
from __future__ import annotations

from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = ROOT / "art_source" / "v0.9.0"


def target_size(path: Path, width: int, height: int) -> tuple[int, int]:
    normalized = path.as_posix()
    if "/keyart/" in normalized:
        return (1080, 1920)
    if "/portraits/heroes/" in normalized:
        return (768, 1152)
    if "/portraits/bosses/" in normalized:
        return (768, 768)
    if "/portraits/npc/" in normalized:
        return (576, 768)
    if "/contact_sheets/items_" in normalized:
        return (1536, 1536)
    if "/contact_sheets/skills_" in normalized:
        return (1536, 960)
    if "/ui/" in normalized:
        return (1920, 1440)
    return (width, height)


def optimize(path: Path) -> tuple[int, int, tuple[int, int], tuple[int, int]]:
    before = path.stat().st_size
    with Image.open(path) as source:
        image = source.convert("RGBA")
        original_size = image.size
        desired = target_size(path, *original_size)
        if desired[0] < original_size[0] or desired[1] < original_size[1]:
            image = image.resize(desired, Image.Resampling.LANCZOS)
        temporary = path.with_suffix(".optimized.png")
        image.save(temporary, format="PNG", optimize=False, compress_level=6)
    temporary.replace(path)
    return before, path.stat().st_size, original_size, desired


def main() -> None:
    files = sorted(SOURCE_ROOT.rglob("*.png"))
    before_total = 0
    after_total = 0
    resized = 0
    for path in files:
        before, after, original, desired = optimize(path)
        before_total += before
        after_total += after
        if original != desired:
            resized += 1
    print(f"Optimized {len(files)} PNG files; resized {resized}.")
    print(f"Before: {before_total / 1_000_000:.2f} MB")
    print(f"After:  {after_total / 1_000_000:.2f} MB")
    print(f"Saved:  {(before_total - after_total) / 1_000_000:.2f} MB")


if __name__ == "__main__":
    main()
