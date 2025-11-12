import logging
import sys
import asyncio
import dateutil.parser

from config import GOODREADS_COOKIE, GOODREADS_USER_ID, ENVIRONMENT
from utils import setup_logging, save_output_files_locally
from katalog import Katalog
import db_client

async def main():
    setup_logging() # Run the setup
    
    # Get secrets from environment

    if not GOODREADS_COOKIE or not GOODREADS_USER_ID:
        logging.critical("GOODREADS_COOKIE or GOODREADS_USER_ID not set. Exiting.")
        return

    scraper = Katalog(GOODREADS_COOKIE, GOODREADS_USER_ID)

    try:
        data = await scraper.scrape()
        
        if 'error' in data:
            logging.error(f"Scraper finished with a known error: {data['error']}")
        else:
            logging.info("Scrape job finished successfully.")

            if ENVIRONMENT != 'production':
                save_output_files_locally(data)

            logging.info("Attempting to save data to Supabase...")
            try:
                hwm = db_client.get_feed_highwatermark()
                all_feed_items = data.get('feed_activity', [])
                new_feed_items = []

                if hwm:
                    for item in all_feed_items:
                        item_time = dateutil.parser.isoparse(item.timestamp)
                        if item_time > hwm:
                            new_feed_items.append(item)
                else:
                    # If no high-water mark, insert all items
                    new_feed_items = all_feed_items
                
                db_client.insert_feed_items(new_feed_items)

                all_books = data.get('books', {}).get('all_books', [])
                if all_books:
                    # Add the user_id to each book record for the primary key
                    for book in all_books:
                        book.user_id = GOODREADS_USER_ID
                    db_client.upsert_books(all_books)
                else:
                    logging.info("No books found in scrape data. Nothing to upsert.")
                    
                logging.info("Supabase data sync complete.")
                
            except Exception as e:
                logging.exception("An error occurred during Supabase data insertion.")
            
    except Exception as e:
        # This will catch any fatal, unexpected error
        logging.exception("An unexpected, fatal error occurred. Job failed.")
        sys.exit(1) # Exit with a non-zero code

if __name__ == "__main__":
    asyncio.run(main())