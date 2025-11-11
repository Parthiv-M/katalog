from dotenv import load_dotenv
import pandas as pd
import os
import logging
import sys
from datetime import datetime
import json
import sentry_sdk

load_dotenv()

SENTRY_DSN = os.environ.get('SENTRY_DSN')
ENVIRONMENT = os.environ.get('ENVIRONMENT', 'dev')
IS_DOCKER = os.path.exists('/.dockerenv')

if SENTRY_DSN and ENVIRONMENT == 'production':
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        environment=ENVIRONMENT,
        enable_logs=True,
        traces_sample_rate=1.0
    )
    print("Sentry initialized for production.")
else:
    print("Sentry not initialized (DSN not found or not in production env).")

def setup_logging():
    """Configures the root logger based on the environment."""
    logger = logging.getLogger()
    
    # Define a consistent format
    formatter = logging.Formatter(
        '%(asctime)s [%(levelname)s] (%(name)s) %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )

    # Clear existing handlers
    if logger.hasHandlers():
        logger.handlers.clear()

    if ENVIRONMENT == 'production':
        # In production, log INFO and higher to stderr (for Render/Sentry)
        logger.setLevel(logging.INFO)
        handler = logging.StreamHandler(sys.stderr)
        handler.setLevel(logging.INFO)
    else:
        # In local, log DEBUG and higher to a file
        logger.setLevel(logging.DEBUG) # Be more verbose locally
        handler = logging.FileHandler('kata.log', mode='w') # 'w' to overwrite
        handler.setLevel(logging.DEBUG)
        
        # Also add a console logger for local dev
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.INFO) # Console can be less verbose
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)

    handler.setFormatter(formatter)
    logger.addHandler(handler)
    
    logger.info(f"Logging configured for {ENVIRONMENT} environment.")

def save_output_files_locally(data):
    """Saves all scraped data to CSV/JSON files in the local /app/output dir."""
    try:
        output_dir = 'output/'
        if IS_DOCKER:
            output_dir = '/app/output'
        os.makedirs(output_dir, exist_ok=True)
        logging.info(f"Saving output files to {output_dir}...")

        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        # Save all data to JSON
        json_filename = os.path.join(output_dir, f'goodreads_data_{timestamp}.json')
        with open(json_filename, 'w') as f:
            json.dump(data, f, indent=2, default=str)
        logging.info(f"Data saved to {json_filename}")
        
        # Save books to CSV
        if 'books' in data and data['books']['all_books']:
            df_books = pd.DataFrame(data['books']['all_books'])
            csv_filename = os.path.join(output_dir, f'goodreads_books_{timestamp}.csv')
            df_books.to_csv(csv_filename, index=False)
            logging.info(f"Books data saved to {csv_filename}")
            
        # Save feed to CSV
        if 'feed_activity' in data and data['feed_activity']:
            df_feed = pd.DataFrame(data['feed_activity'])
            csv_filename = os.path.join(output_dir, f'goodreads_feed_{timestamp}.csv')
            df_feed.to_csv(csv_filename, index=False)
            logging.info(f"Feed data saved to {csv_filename}")
            
    except Exception as e:
        logging.error(f"Failed to save local output files: {e}", exc_info=True)


