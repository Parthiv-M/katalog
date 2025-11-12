import os
from dotenv import load_dotenv
from typing import Optional

load_dotenv()

ENVIRONMENT: str = os.environ.get('ENVIRONMENT', 'dev')
IS_DOCKER: bool = os.path.exists('/.dockerenv')
GOODREADS_COOKIE: Optional[str] = os.environ.get('GOODREADS_COOKIE')
GOODREADS_USER_ID: Optional[str] = os.environ.get('GOODREADS_USER_ID')
SUPABASE_URL: Optional[str] = os.environ.get('SUPABASE_URL')
SUPABASE_KEY: Optional[str] = os.environ.get('SUPABASE_KEY')
SENTRY_DSN: Optional[str] = os.environ.get('SENTRY_DSN')