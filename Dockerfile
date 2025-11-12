# Use the official Playwright image from Microsoft.
FROM mcr.microsoft.com/playwright/python

WORKDIR /app

COPY requirements.txt /app/

RUN pip3 install --no-cache-dir -r requirements.txt

RUN playwright install chromium --with-deps

COPY ./src/* /app/

CMD ["python", "index.py"]