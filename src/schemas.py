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

class ReadingChallenge(BaseModel):
    """
    Pydantic schema for a reading challenge.
    """
    year: int
    user_id: str
    goal: int
    books_completed: int
    percentage: Optional[float] = None
    books_ahead: Optional[float] = None
    books_behind: Optional[float] = None
    updated_at: Optional[str] = None