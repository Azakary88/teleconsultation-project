#!/bin/bash
# Script to render all .puml files in docs/uml to SVG using the official PlantUML Docker image.
# Requires Docker to be installed locally.
set -e
UML_DIR=docs/uml
OUT_DIR=docs/uml_rendered_plantuml
mkdir -p "$OUT_DIR"
# Use plantuml Docker image to render .puml to SVG
docker run --rm -v "$(pwd)/$UML_DIR":/work -v "$(pwd)/$OUT_DIR":/out plantuml/plantuml -tsvg -o /out /work
echo "Rendered PlantUML files to $OUT_DIR"
