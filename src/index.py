import logging
import sys
import os
import asyncio
from dotenv import load_dotenv

from utils import setup_logging, save_output_files_locally
from katalog import Katalog

load_dotenv()

ENVIRONMENT = os.environ.get('ENVIRONMENT', 'dev')

async def main():
    setup_logging() # Run the setup
    
    # Get secrets from environment
    COOKIE = os.environ.get('GOODREADS_COOKIE')
    USER_ID = os.environ.get('GOODREADS_USER_ID')

    if not COOKIE or not USER_ID:
        logging.critical("GOODREADS_COOKIE or GOODREADS_USER_ID not set. Exiting.")
        return

    scraper = Katalog(COOKIE, USER_ID)

    try:
        data = await scraper.scrape()
        
        if 'error' in data:
            logging.error(f"Scraper finished with a known error: {data['error']}")
        else:
            logging.info("Scrape job finished successfully.")

            if ENVIRONMENT != 'production':
                save_output_files_locally(data)
            else:
                logging.info("Skipping file save in production environment.")
                # TODO: insert stuff into db
            
    except Exception as e:
        # This will catch any fatal, unexpected error
        logging.exception("An unexpected, fatal error occurred. Job failed.")
        sys.exit(1) # Exit with a non-zero code

if __name__ == "__main__":
    asyncio.run(main())