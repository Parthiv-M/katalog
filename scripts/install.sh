#! /bin/bash

echo "Activating virtual environment..."
source venv/bin/activate

echo ""

pip install -r requirements.txt

echo ""
echo "Installing chrome browser (and dependencies) for playwright..."
playwright install chrome --with-deps

echo "Done."
echo ""