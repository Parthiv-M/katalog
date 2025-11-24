from supabase import create_client, Client
from typing import List, Dict, Optional
from datetime import datetime
import dateutil.parser
import logging

from config import ENVIRONMENT, SUPABASE_KEY, SUPABASE_URL
from schemas import Book, FeedActivity, ReadingChallenge

logger = logging.getLogger(__name__)

supabase: Optional[Client] = None

BOOKS_TABLE_NAME = 'books'
FEED_TABLE_NAME = 'feed'
CHALLENGE_TABLE_NAME = 'reading_challenges' if ENVIRONMENT == 'production' else 'reading_challenges_dev'
METADATA_TABLE_NAME = 'metadata' if ENVIRONMENT == 'production' else 'metadata_dev'

if ENVIRONMENT != 'production':
    BOOKS_TABLE_NAME = 'books_dev'
    FEED_TABLE_NAME = 'feed_dev'

def get_db_client():
    """Initializes and returns a Supabase client instance."""
    global supabase
    if supabase:
        return supabase
    
    if not SUPABASE_URL or not SUPABASE_KEY:
        logger.error("SUPABASE_URL or SUPABASE_KEY not set. Cannot connect to database.")
        return None
    
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        logger.info("Supabase client initialized.")
        return supabase
    except Exception as e:
        logger.exception("Failed to initialize Supabase client: %s", e)
        return None

def get_feed_highwatermark() -> Optional[datetime]:
    """
    Fetches the most recent timestamp from the 'feed' table
    to use as a high-water mark.
    """
    client = get_db_client()
    if not client:
        return None

    try:
        response = client.table(FEED_TABLE_NAME).select('timestamp').order('timestamp', desc=True).limit(1).execute()
        if response.data:
            hwm_string = response.data[0]['timestamp']
            hwm_date = dateutil.parser.isoparse(hwm_string)
            logger.info("Found feed high-water mark: %s", hwm_date)
            return hwm_date
        else:
            logger.info("No existing data in 'feed' table. Will perform a full load.")
            return None
    except Exception as e:
        logger.exception("Error fetching feed high-water mark: %s", e)
        return None

def upsert_books(book_records: List[Book]):
    """
    Upserts a list of book objects into the 'books' table.
    """
    if not book_records:
        logger.info("No book records to upsert.")
        return

    client = get_db_client()
    if not client:
        return

    try:
        logger.info("Attempting to upsert %s book records...", len(book_records))

        records_to_upsert = [
            book.model_dump(exclude_none=True) for book in book_records
        ]

        response = client.table(BOOKS_TABLE_NAME).upsert(records_to_upsert, on_conflict='user_id,book_url').execute()
        
        if response.data:
            logger.info("Successfully upserted %s book records.", len(response.data))
        else:
            logger.warning("Supabase upsert returned no data. Check response: %s", response.error)
            
    except Exception as e:
        logger.exception("Error upserting book data: %s", e)

def insert_feed_items(feed_records: List[FeedActivity]):
    """
    Inserts a list of new feed item records into the 'feed' table.
    """
    if not feed_records:
        logger.info("No new feed items to insert.")
        return
        
    client = get_db_client()
    if not client:
        return
        
    try:
        records_to_insert = [
            item.model_dump(exclude_none=True) for item in feed_records
        ]

        if not records_to_insert:
            logger.info("No new feed items to insert after filtering.")
            return

        logger.info("Attempting to insert %s new feed items...", len(records_to_insert))
        # Pass the list of dictionaries to insert
        response = client.table(FEED_TABLE_NAME).insert(records_to_insert).execute()
        
        if response.data:
            logger.info("Successfully inserted %s feed items.", len(response.data))
        else:
            logger.warning("Supabase insert returned no data. Check response: %s", response.error)
            
    except Exception as e:
        if "duplicate key value" in str(e):
             logger.warning("Some feed items were duplicates and were ignored, as expected.")
        else:
            logger.exception("Error inserting feed data: %s", e)

def upsert_reading_challenge(challenge: ReadingChallenge):
    """
    Upserts the reading challenge status for the current year.
    """
    client = get_db_client()
    if not client:
        return

    try:
        data = challenge.model_dump(exclude_none=True)
        response = client.table(CHALLENGE_TABLE_NAME).upsert(data).execute()
        
        if response.data:
            logger.info("Successfully updated reading challenge for %s.", challenge.year)
        else:
            logger.warning("Supabase challenge upsert returned no data: %s", response.error)

    except Exception as e:
        logger.exception("Error upserting reading challenge: %s", e)

def set_system_metadata(key: str, value: str):
    """
    Updates a key-value pair in the metadata table.
    """
    client = get_db_client()
    if not client:
        return

    try:
        # Simple upsert: if key exists, update value; if not, insert.
        data = {"key": key, "value": value}
        client.table(METADATA_TABLE_NAME).upsert(data).execute()
        logger.info("Updated system metadata: %s", key)
    except Exception as e:
        logger.error("Error updating system metadata: %s", e)