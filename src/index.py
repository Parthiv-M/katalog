import logging
import sys
import asyncio
import dateutil.parser

from config import GOODREADS_COOKIE, GOODREADS_USER_ID, ENVIRONMENT
from utils import setup_logging, save_output_files_locally
from katalog import Katalog
import db_client
from schemas import ReadingChallenge

async def main():
    setup_logging() # Run the setup
    
    # Get secrets from environment

    if not GOODREADS_COOKIE or not GOODREADS_USER_ID:
        logging.critical("GOODREADS_COOKIE or GOODREADS_USER_ID not set. Exiting.")
        return

    scraper = Katalog(GOODREADS_COOKIE, GOODREADS_USER_ID)

    try:
        data = await scraper.scrape()

        # Validate that we actually got data before we try to save it.
        # If selectors break, these lists will be empty.
        total_books = len(data.get('books', {}).get('all_books', []))
        feed_count = len(data.get('feed_activity', []))

        # Check Books
        if total_books == 0:
            logging.error("Health check failed: Scraped 0 books. Goodreads DOM likely changed.")
            sys.exit(1)
        else:
            logging.info(f"Health check passed: Found {total_books} books.")

        # Check feed, it could actually be empty as well
        if feed_count == 0:
            logging.warning("Health check warning: Scraped 0 feed items. Feed might be empty or selectors changed. Take a look nonetheless.")
        else:
            logging.info(f"Health check passed: Found {feed_count} feed items.")
        
        if 'error' in data:
            logging.error(f"Scraper finished with a known error: {data['error']}")
            sys.exit(1)
        
        logging.info("Scrape job finished successfully.")

        if ENVIRONMENT != 'production':
            save_output_files_locally(data)

        logging.info("Attempting to save data to Supabase.")
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

            challenge_data = data.get('reading_challenge', {})
            if challenge_data:
                try:
                    challenge_data['user_id'] = GOODREADS_USER_ID
                    challenge_data['updated_at'] = datetime.now(timezone.utc).isoformat()          
                    challenge_obj = ReadingChallenge(**challenge_data)
                    db_client.upsert_reading_challenge(challenge_obj)
                except Exception as e:
                    logging.error(f"Failed to process reading challenge data: {e}")
                
            logging.info("Supabase data sync complete.")
            
        except Exception as e:
            logging.exception("An error occurred during Supabase data insertion.")
            
    except Exception as e:
        # This will catch any fatal, unexpected error
        logging.exception("An unexpected, fatal error occurred. Job failed.")
        sys.exit(1) # Exit with a non-zero code

if __name__ == "__main__":
    asyncio.run(main())