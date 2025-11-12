from pydantic import BaseModel
from typing import Optional

class Book(BaseModel):
    """
    Pydantic schema for a single book record.
    """
    title: Optional[str] = None
    book_url: Optional[str] = None
    author: Optional[str] = None
    isbn: Optional[str] = None
    rating: Optional[int] = None
    avg_rating: Optional[float] = None
    num_pages: Optional[int] = None
    date_published: Optional[str] = None
    date_added: Optional[str] = None
    date_started: Optional[str] = None
    date_read: Optional[str] = None
    review: Optional[str] = None
    shelf: Optional[str] = None
    user_id: Optional[str] = None

class FeedActivity(BaseModel):
    """
    Pydantic schema for a single feed activity item.
    """
    user_name: Optional[str] = None 
    user_url: Optional[str] = None
    action: Optional[str] = None
    header_text: Optional[str] = None
    book_title: Optional[str] = None
    book_url: Optional[str] = None
    author: Optional[str] = None
    author_url: Optional[str] = None
    timestamp: Optional[str] = None
    time_ago: Optional[str] = None
    rating: Optional[int] = None
    book_description: Optional[str] = None