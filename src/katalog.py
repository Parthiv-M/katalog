import logging
from datetime import datetime
import time
import re
from typing import Dict, List, Optional
import os
import ast
import json

import pydantic
import pandas as pd
import requests
from bs4 import BeautifulSoup
import asyncio
from playwright.async_api import async_playwright

from schemas import Book, FeedActivity

class Katalog:
    def __init__(self, cookie_string: str, user_id: str):
        """Initialize the scraper with session cookie and user ID."""
        self.logger = logging.getLogger(__name__) # Get a logger instance
        self.logger.info(f"Initializing Katalog for user_id: {user_id}")
        
        self.session = requests.Session()
        self.user_id = user_id
        self.base_url = "https://www.goodreads.com"
        
        # Parse cookies from the cookie string
        self.cookies = {}
        if cookie_string:
            for cookie_pair in cookie_string.split(';'):
                cookie_pair = cookie_pair.strip()
                if '=' in cookie_pair:
                    key, value = cookie_pair.split('=', 1)
                    self.cookies[key.strip()] = value.strip()
        
        # Set up headers with user agent
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'X-Requested-With': 'XMLHttpRequest',
            'Referer': 'https://www.goodreads.com/',
            'Origin': 'https://www.goodreads.com',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin'
        } 
        
        # Set cookies in session
        for key, value in self.cookies.items():
            self.session.cookies.set(key, value, domain='.goodreads.com', path='/')
        
        # Update session headers
        self.session.headers.update(self.headers)
        
    def verify_session(self) -> bool:
        """
        Verify that the session cookie is valid by checking for the
        "Edit profile" link on the user's own profile page.
        """
        url = f"{self.base_url}/user/show/{self.user_id}"
        
        try:
            response = self.session.get(url, allow_redirects=False, timeout=10)

            if response.status_code in (301, 302, 307):
                self.logger.warning("Session invalid (Redirected to: %s)", response.headers.get('Location'))
                return False

            if response.status_code != 200:
                self.logger.warning("Session invalid (Got HTTP Status %s)", response.status_code)
                return False

            soup = BeautifulSoup(response.content, 'html.parser')
            edit_profile_link = soup.find('a', href='/user/edit')
            
            if edit_profile_link:
                self.logger.info("Session valid for user ID: %s (Found 'Edit profile' link)", self.user_id)
                return True
            else:
                self.logger.warning("Session invalid (Landed on profile but could not find 'Edit profile' link)")
                return False

        except requests.exceptions.Timeout:
            self.logger.error("Error verifying session: Request timed out")
            return False
        except Exception as e:
            # logger.exception automatically includes the stack trace
            self.logger.exception("Unexpected error verifying session: %s", e)
            return False
    
    def get_books_data(self) -> Dict:
        """Scrape books data including read status and dates."""
        books_data = {
            'read': [], 'currently_reading': [], 'want_to_read': [], 'all_books': []
        }
        
        try:
            shelves = ['read', 'currently-reading', 'to-read']
            
            for shelf in shelves:
                self.logger.info("Scraping %s shelf...", shelf)
                page = 1
                books_found = 0
                consecutive_empty_pages = 0
                
                while consecutive_empty_pages < 2:
                    url = f"{self.base_url}/review/list/{self.user_id}?shelf={shelf}&page={page}&per_page=100"
                    response = self.session.get(url)
                    
                    if response.status_code != 200:
                        self.logger.warning("Got status code %s for %s page %s", response.status_code, shelf, page)
                        break
                        
                    soup = BeautifulSoup(response.content, 'html.parser')
                    
                    book_rows = soup.find_all('tr', class_='bookalike review')
                    if not book_rows:
                        book_rows = soup.find_all('tr', id=re.compile(r'review_\d+'))
                    
                    if not book_rows:
                        consecutive_empty_pages += 1
                        if page == 1:
                            self.logger.info("No books found in %s shelf", shelf)
                            break
                    else:
                        consecutive_empty_pages = 0
                        page_books = 0
                        
                        for row in book_rows:
                            book = {}
                            
                            # Title
                            title_elem = row.find('td', class_='field title')
                            if title_elem:
                                title_link = title_elem.find('a', class_='bookTitle')
                                if not title_link:
                                    title_link = title_elem.find('a')
                                if title_link:
                                    book['title'] = title_link.text.strip()
                                    book['book_url'] = self.base_url + title_link.get('href', '')
                            
                            # Author
                            author_elem = row.find('td', class_='field author')
                            if author_elem:
                                author_link = author_elem.find('a')
                                if author_link:
                                    book['author'] = author_link.text.strip()
                            
                            # ISBN
                            isbn_elem = row.find('td', class_='field isbn13')
                            if isbn_elem:
                                value_div = isbn_elem.find('div', class_='value')
                                if value_div:
                                    isbn_text = value_div.text.strip()
                                    if isbn_text and isbn_text != '—':
                                        book['isbn'] = isbn_text
                            
                            # Rating
                            rating_elem = row.find('td', class_='field rating')
                            if rating_elem:
                                stars_div = rating_elem.find('div', class_='stars')
                                if stars_div and stars_div.get('data-rating'):
                                    try:
                                        rating_value = stars_div.get('data-rating')
                                        if int(rating_value) > 0:
                                            book['rating'] = int(rating_value)
                                    except Exception:
                                        pass # Non-fatal, just skip
                            
                            # Average rating
                            avg_rating_elem = row.find('td', class_='field avg_rating')
                            if avg_rating_elem:
                                value_div = avg_rating_elem.find('div', class_='value')
                                if value_div:
                                    avg_text = value_div.text.strip()
                                    try:
                                        book['avg_rating'] = float(avg_text)
                                    except Exception:
                                        pass # Non-fatal, just skip

                            # Number of pages
                            pages_elem = row.find('td', class_='field num_pages')
                            if pages_elem:
                                value_div = pages_elem.find('div', class_='value')
                                if value_div:
                                    nobr_tag = value_div.find('nobr')
                                    if nobr_tag and nobr_tag.contents:
                                        pages_text = str(nobr_tag.contents[0]).strip().replace(',', '')
                                        try:
                                            book['num_pages'] = int(pages_text)
                                        except Exception:
                                            pass # Non-fatal, just skip
                            
                            # Date published
                            date_pub_elem = row.find('td', class_='field date_pub')
                            if date_pub_elem:
                                value_div = date_pub_elem.find('div', class_='value')
                                if value_div:
                                    date_text = value_div.text.strip()
                                    book['date_published'] = date_text
                            
                            # Date added
                            date_added_elem = row.find('td', class_='field date_added')
                            if date_added_elem:
                                date_text = ''
                                span_with_title = date_added_elem.find('span', title=True)
                                if span_with_title:
                                    date_text = span_with_title.get('title')
                                if not date_text:
                                    date_span = date_added_elem.find('span', class_='date_added_value')
                                    if date_span:
                                        date_text = date_span.text.strip()
                                if not date_text:
                                    date_text = date_added_elem.get_text(strip=True)
                                if date_text:
                                    book['date_added'] = self._parse_date(date_text)
                            
                            # Date started
                            if shelf == 'currently-reading':
                                date_started_elem = row.find('td', class_='field date_started')
                                if date_started_elem:
                                    date_text = ''
                                    span_with_title = date_started_elem.find('span', title=True)
                                    if span_with_title:
                                        date_text = span_with_title.get('title')
                                    if not date_text:
                                        date_span = date_started_elem.find('span', class_='date_started_value')
                                        if date_span:
                                            date_text = date_span.text.strip()
                                    if not date_text:
                                        date_text = date_started_elem.get_text(strip=True)
                                    if date_text:
                                        book['date_started'] = self._parse_date(date_text)
                            
                            # Date read
                            if shelf == 'read':
                                date_read_elem = row.find('td', class_='field date_read')
                                if date_read_elem:
                                    date_span = date_read_elem.find('span', class_='date_read_value')
                                    if not date_span:
                                        date_span = date_read_elem.find('span')
                                    if date_span:
                                        date_text = date_span.get('title', '')
                                        if not date_text:
                                            date_text = date_span.text.strip()
                                    else:
                                        date_text = date_read_elem.get_text(strip=True)
                                    if date_text:
                                        book['date_read'] = self._parse_date(date_text)
                            
                            # Review
                            review_elem = row.find('td', class_='field review')
                            if review_elem:
                                review_text = review_elem.find('span', id=re.compile(r'freeText\d+'))
                                if review_text:
                                    book['review'] = review_text.text.strip()[:500]
                            
                            book['shelf'] = shelf.replace('-', '_')
                            
                            if book.get('title'):
                                try:
                                    book_obj = Book(
                                        title=book.get('title'),
                                        book_url=book.get('book_url'),
                                        author=book.get('author'),
                                        isbn=book.get('isbn'),
                                        rating=book.get('rating'),
                                        avg_rating=book.get('avg_rating'),
                                        num_pages=book.get('num_pages'),
                                        date_published=book.get('date_published'),
                                        date_added=book.get('date_added'),
                                        date_started=book.get('date_started'),
                                        date_read=book.get('date_read'),
                                        review=book.get('review'),
                                        shelf=book.get('shelf')
                                    )
                                    
                                    books_found += 1
                                    page_books += 1
                                    
                                    if shelf == 'read':
                                        books_data['read'].append(book_obj)
                                    elif shelf == 'currently-reading':
                                        books_data['currently_reading'].append(book_obj)
                                    else:
                                        books_data['want_to_read'].append(book_obj)
                                    books_data['all_books'].append(book_obj)
                                except pydantic.ValidationError as e:
                                    self.logger.warning(
                                        "Skipping book, failed validation: %s. Data: %s",
                                        e, book
                                    )
                                    continue
                        
                        if page_books > 0:
                            self.logger.debug("Page %s: Found %s books", page, page_books)
                    
                    next_link = soup.find('a', class_='next_page')
                    if next_link and 'disabled' in next_link.get('class', []):
                        break
                    
                    page += 1
                    
                    if page > 100:
                        self.logger.warning("Reached page limit (100) for %s shelf", shelf)
                        break
                    
                    time.sleep(0.5)
                
                self.logger.info("Total found: %s books in %s shelf", books_found, shelf)
                    
        except Exception as e:
            self.logger.exception("Error scraping books: %s", e)
            
        return books_data
    
    def get_account_metadata(self) -> Dict:
        """Get general metadata about the account."""
        metadata = {}
        self.logger.info("Fetching account metadata...")
        
        try:
            response = self.session.get(f"{self.base_url}/user/show/{self.user_id}")
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # ... (all your metadata parsing logic remains identical) ...
            # Username
            username_elem = soup.find('h1', class_='userProfileName')
            if not username_elem:
                username_elem = soup.find('h1')
            if username_elem:
                metadata['username'] = username_elem.text.strip()
            
            # Profile stats
            stats_divs = soup.find_all('div', class_='leftContainer')
            for div in stats_divs:
                text = div.get_text()
                books_match = re.search(r'(\d+)\s+books?', text, re.IGNORECASE)
                if books_match:
                    metadata['total_books'] = int(books_match.group(1))
                friends_match = re.search(r'(\d+)\s+friends?', text, re.IGNORECASE)
                if friends_match:
                    metadata['friends_count'] = int(friends_match.group(1))
                following_match = re.search(r'(\d+)\s+following', text, re.IGNORECASE)
                if following_match:
                    metadata['following_count'] = int(following_match.group(1))
                followers_match = re.search(r'(\d+)\s+followers?', text, re.IGNORECASE)
                if followers_match:
                    metadata['followers_count'] = int(followers_match.group(1))
            
            # Year reading goal
            goal_elem = soup.find('div', class_='challengePic')
            if goal_elem:
                goal_text = goal_elem.get_text()
                goal_match = re.search(r'(\d+)\s+of\s+(\d+)', goal_text)
                if goal_match:
                    metadata['books_read_this_year'] = int(goal_match.group(1))
                    metadata['yearly_reading_goal'] = int(goal_match.group(2))
            
            # Member since
            profile_divs = soup.find_all('div', class_='infoBoxRowItem')
            for div in profile_divs:
                if 'member since' in div.get_text().lower():
                    date_text = div.get_text().replace('member since', '').strip()
                    metadata['member_since'] = date_text
            
            # Get shelf counts
            shelves_elem = soup.find('div', id='shelvesSection')
            if shelves_elem:
                shelf_links = shelves_elem.find_all('a', href=re.compile(r'/review/list/'))
                for link in shelf_links:
                    shelf_text = link.get_text()
                    count_match = re.search(r'\((\d+)\)', shelf_text)
                    if count_match:
                        shelf_name = shelf_text.split('(')[0].strip()
                        metadata[f'shelf_{shelf_name.replace(" ", "_").replace("-", "_")}'] = int(count_match.group(1))
            
            metadata['user_id'] = self.user_id
            metadata['scraped_at'] = datetime.now().isoformat()
            
        except Exception as e:
            self.logger.exception("Error getting account metadata: %s", e)
            
        return metadata

    async def get_home_feed_activity(self) -> List[FeedActivity]:
        """Scrape home page feed activity using Playwright's Async API."""
        activities = []
        self.logger.info("Fetching home feed with Playwright (Async)...")

        try:            
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                context = await browser.new_context(user_agent=self.headers['User-Agent'])
                
                playwright_cookies = []
                for name, value in self.cookies.items():
                    playwright_cookies.append({
                        'name': name, 'value': value, 'domain': '.goodreads.com', 'path': '/'
                    })
                await context.add_cookies(playwright_cookies)
                
                page = await context.new_page()
                await page.goto(self.base_url)
                
                try:
                    await page.wait_for_selector('div.gr-newsfeedItem', timeout=20000)
                    self.logger.info("Feed container found. Parsing items...")
                    await asyncio.sleep(3)
                except Exception as e:
                    self.logger.warning("Timed out waiting for feed items: %s", e)
                    # Save to /app/output for container consistency
                    output_dir = '/app/output'
                    os.makedirs(output_dir, exist_ok=True)
                    screenshot_path = os.path.join(output_dir, 'debug_screenshot.png')
                    await page.screenshot(path=screenshot_path)
                    self.logger.info(f"Saved debug screenshot to {screenshot_path}")
                    pass # Don't raise, just return empty list

                html_content = await page.content()
                await browser.close()
                
                soup = BeautifulSoup(html_content, 'html.parser')
                feed_items = soup.find_all('div', class_='gr-newsfeedItem')
                
                if not feed_items:
                    self.logger.info("No feed items found in the rendered HTML.")
                    return []

                for item in feed_items[:50]:
                    try:
                        activity = {}
                        
                        # User info
                        user_link = item.find('a', class_='gr-user__profileLink')
                        if user_link:
                            user_text = user_link.text.strip()
                            user_url = user_link.get('href', '')
                            
                            # List of action texts that might be inside the link
                            action_texts = ('wants to read', 'is currently reading', 
                                              'started reading', 'finished reading', 
                                              'has read', 'rated', 'reviewed', 'added')

                            # If the link text is an action, parse name from URL
                            if user_text.lower() in action_texts:
                                if user_url and '-' in user_url:
                                    # Get name from '.../12345-user-name'
                                    name_part = user_url.split('-')[-1]
                                    # Format it to be readable
                                    activity['user_name'] = ' '.join(
                                        [word.capitalize() for word in name_part.split('-')]
                                    )
                                else:
                                    activity['user_name'] = "Unknown" # Fallback
                            else:
                                # This is the old, working logic
                                activity['user_name'] = user_text
                            
                            activity['user_url'] = user_url
                        
                        # Header
                        header = item.find('div', class_='gr-newsfeedItem__header')
                        if header:
                            header_text = header.get_text(' ', strip=True)
                            if 'wants to read' in header_text: activity['action'] = 'wants_to_read'
                            elif 'is currently reading' in header_text: activity['action'] = 'currently_reading'  
                            elif 'started reading' in header_text: activity['action'] = 'started_reading'
                            elif 'finished reading' in header_text or 'has read' in header_text: activity['action'] = 'read'
                            elif 'rated' in header_text:
                                activity['action'] = 'rated'
                                rating_elem = item.find('div', class_='communityRating__stars')
                                if rating_elem and rating_elem.get('style'):
                                    width_match = re.search(r'width:\s*(\d+)%', rating_elem.get('style', ''))
                                    if width_match: activity['rating'] = round(int(width_match.group(1)) / 20)
                            elif 'reviewed' in header_text: activity['action'] = 'reviewed'
                            elif 'added' in header_text: activity['action'] = 'added_book'
                            else: activity['action'] = 'other'
                            activity['header_text'] = header_text[:200]
                        
                        # Book details
                        book_title = item.find('a', class_='gr-book__titleLink')
                        if book_title:
                            activity['book_title'] = book_title.text.strip()
                            activity['book_url'] = book_title.get('href', '')
                            if activity['book_url'] and not activity['book_url'].startswith('http'):
                                activity['book_url'] = self.base_url + activity['book_url']
                        
                        # Author
                        author_link = item.find('a', class_='gr-book__authorLink')
                        if author_link:
                            activity['author'] = author_link.text.strip()
                            activity['author_url'] = author_link.get('href', '')
                            if activity['author_url'] and not activity['author_url'].startswith('http'):
                                activity['author_url'] = self.base_url + activity['author_url']
                        
                        timestamp_elem = item.find('small', class_='gr-newsfeedItem__headerTimestamp')
                        if timestamp_elem:
                            time_tag = timestamp_elem.find('time')
                            
                            # Case 1: Found a <time> tag inside
                            if time_tag and time_tag.get('datetime'):
                                activity['timestamp'] = time_tag.get('datetime', '')
                                activity['time_ago'] = time_tag.text.strip()
                            # Case 2: Check the <small> tag itself for datetime
                            elif timestamp_elem.get('datetime'):
                                activity['timestamp'] = timestamp_elem.get('datetime', '')
                                activity['time_ago'] = timestamp_elem.text.strip()
                            # Case 3: Just get text
                            else:
                                activity['time_ago'] = timestamp_elem.get_text(strip=True)
                        
                        # Description
                        book_desc = item.find('div', class_='gr-book__description')
                        if book_desc:
                            desc_text = book_desc.get_text(' ', strip=True)
                            desc_text = re.sub(r'Continue reading$', '', desc_text).strip()
                            activity['book_description'] = desc_text[:500]
                        
                        if activity.get('user_name') or activity.get('book_title'):
                            try:
                                activity_obj = FeedActivity(
                                    user_name=activity.get('user_name'),
                                    user_url=activity.get('user_url'),
                                    action=activity.get('action'),
                                    header_text=activity.get('header_text'),
                                    book_title=activity.get('book_title'),
                                    book_url=activity.get('book_url'),
                                    author=activity.get('author'),
                                    author_url=activity.get('author_url'),
                                    timestamp=activity.get('timestamp'),
                                    time_ago=activity.get('time_ago'),
                                    rating=activity.get('rating'),
                                    book_description=activity.get('book_description')
                                )
                                activities.append(activity_obj)
                            except pydantic.ValidationError as e:
                                self.logger.warning(
                                    "Skipping feed item, failed validation: %s. Data: %s",
                                    e, activity
                                )
                                continue

                    except Exception as e:
                        # Log the non-fatal error but continue the loop
                        self.logger.warning("Skipping problematic feed item: %s", e, exc_info=True)
                        continue
            
            self.logger.info("Found %s activities in feed", len(activities))
            
        except Exception as e:
            # This is a fatal error for this function
            self.logger.exception("Error scraping feed with Playwright: %s", e)
            
        return activities
    
    def get_reading_challenge_details(self) -> Dict:
        """Get detailed reading challenge information using the API endpoint."""
        challenge_data = {}
        self.logger.info("Fetching reading challenge details...")
        
        try:
            api_url = f"{self.base_url}/readingchallenges/goals/data"
            response = self.session.get(api_url)
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    
                    # ... (all your challenge parsing logic remains identical) ...
                    if 'readingGoal' in data:
                        challenge_data['goal'] = data['readingGoal']
                    if 'booksRead' in data:
                        books_read_data = ast.literal_eval(data['booksRead'])
                        challenge_data['books_completed'] = len(books_read_data) if isinstance(books_read_data, list) else 0
                    
                    if 'goal' in challenge_data and challenge_data['goal'] > 0:
                        books_completed = challenge_data.get('books_completed', 0)
                        challenge_data['percentage'] = round((books_completed / challenge_data['goal']) * 100, 2)
                        
                        current_day = datetime.now().timetuple().tm_yday
                        days_in_year = 365
                        expected_progress = (current_day / days_in_year) * challenge_data['goal']
                        books_difference = books_completed - expected_progress
                        
                        if books_difference > 0:
                            challenge_data['books_ahead'] = round(books_difference, 1)
                        else:
                            challenge_data['books_behind'] = round(abs(books_difference), 1)
                    
                    if 'readingProgress' in data:
                        challenge_data['reading_progress'] = data['readingProgress']
                    
                    challenge_data['year'] = datetime.now().year
                    
                except Exception as e: # Changed from JSONDecodeError to catch ast.literal_eval
                    self.logger.error("Failed to parse JSON response: %s. Response text: %s", e, response.text[:500])
            else:
                self.logger.warning("Reading challenge API request failed with status %s", response.status_code)
                            
        except Exception as e:
            self.logger.exception("Error getting reading challenge: %s", e)
            
        return challenge_data

    def _parse_date(self, date_str: str) -> Optional[str]:
        # This is a utility function, no logging needed
        if not date_str: return None
        date_str = date_str.strip()
        if 'unknown' in date_str.lower() or 'not set' in date_str.lower(): return None
        date_str = re.sub(r'^\w+,\s*', '', date_str).strip()
        date_str = re.sub(r'\s+\d+:\d+(AM|PM)?$', '', date_str).strip()
        try:
            if re.match(r'^\d{1,2},\s*\d{4}$', date_str):
                year = date_str.split(',')[-1].strip()
                return year if len(year) == 4 and year.isdigit() else None
            if re.match(r'^[A-Za-z]{3,}\s+\d{1,2},\s+\d{4}$', date_str):
                try: date_obj = datetime.strptime(date_str, "%b %d, %Y")
                except ValueError: date_obj = datetime.strptime(date_str, "%B %d, %Y")
                return date_obj.strftime("%Y-%m-%d")
            if re.match(r'^[A-Za-z]{3,}\s+\d{4}$', date_str):
                try: date_obj = datetime.strptime(date_str, "%b %Y")
                except ValueError: date_obj = datetime.strptime(date_str, "%B %Y")
                return date_obj.strftime("%Y-%m")
            if len(date_str) == 4 and date_str.isdigit():
                return date_str
            return date_str
        except Exception:
            return date_str
    
    def calculate_statistics(self, books_data: Dict) -> Dict:
        # This is a pure function, no logging needed
        stats = {
            'books_per_month': {}, 'books_per_year': {}, 'books_read_per_month': {},
            'books_read_per_year': {}, 'overall_stats': {}, 'status_change_frequency': {},
            'shelf_additions_per_month': {}, 'shelf_additions_per_year': {}, 'reading_pace': {}
        }
        if not books_data['all_books']: return stats
        df = pd.DataFrame([book.model_dump() for book in books_data['all_books']])
        date_columns = ['date_added', 'date_read', 'date_started']
        for col in date_columns:
            if col in df.columns:
                df[col] = pd.to_datetime(df[col], errors='coerce')
        read_valid = df[(df['shelf'] == 'read') & (df['date_read'].notna())]
        if not read_valid.empty:
            monthly_read = read_valid.groupby(read_valid['date_read'].dt.to_period('M')).size()
            yearly_read = read_valid.groupby(read_valid['date_read'].dt.year).size()
            stats['books_read_per_month'] = {str(k): int(v) for k, v in monthly_read.to_dict().items()}
            stats['books_read_per_year'] = {int(k): int(v) for k, v in yearly_read.to_dict().items() if pd.notna(k)}
        added_valid = df[df['date_added'].notna()]
        if not added_valid.empty:
            monthly_added = added_valid.groupby(added_valid['date_added'].dt.to_period('M')).size()
            yearly_added = added_valid.groupby(added_valid['date_added'].dt.year).size()
            stats['books_per_month'] = {str(k): int(v) for k, v in monthly_added.to_dict().items()}
            stats['books_per_year'] = {int(k): int(v) for k, v in yearly_added.to_dict().items() if pd.notna(k)}
        stats['overall_stats'] = {
            'total_books': len(df), 'read': len(df[df['shelf'] == 'read']),
            'currently_reading': len(df[df['shelf'] == 'currently_reading']),
            'want_to_read': len(df[df['shelf'] == 'to_read']),
            'average_rating': round(df['rating'].mean(), 2) if 'rating' in df.columns and df['rating'].notna().any() else None,
            'total_pages_read': int(df[df['shelf'] == 'read']['num_pages'].sum()) if 'num_pages' in df.columns else None,
            'average_pages_per_book': round(df['num_pages'].mean(), 1) if 'num_pages' in df.columns and df['num_pages'].notna().any() else None
        }
        for shelf in ['read', 'currently_reading', 'to_read']:
            shelf_valid = df[(df['shelf'] == shelf) & (df['date_added'].notna())]
            if not shelf_valid.empty:
                monthly_shelf = shelf_valid.groupby(shelf_valid['date_added'].dt.to_period('M')).size()
                yearly_shelf = shelf_valid.groupby(shelf_valid['date_added'].dt.year).size()
                stats['shelf_additions_per_month'][shelf] = {str(k): int(v) for k, v in monthly_shelf.to_dict().items()}
                stats['shelf_additions_per_year'][shelf] = {int(k): int(v) for k, v in yearly_shelf.to_dict().items() if pd.notna(k)}
        if 'date_read' in df.columns and 'date_added' in df.columns:
            valid_days = df[(df['shelf'] == 'read') & df['date_read'].notna() & df['date_added'].notna()]
            if not valid_days.empty:
                valid_days = valid_days.copy()
                valid_days['days_to_read'] = (valid_days['date_read'] - valid_days['date_added']).dt.days
                valid_days = valid_days[valid_days['days_to_read'] >= 0]
                if not valid_days.empty:
                    stats['status_change_frequency']['avg_days_to_read'] = round(valid_days['days_to_read'].mean(), 1)
                    stats['status_change_frequency']['median_days_to_read'] = round(valid_days['days_to_read'].median(), 1)
        return stats
    
    async def scrape(self) -> Dict:
        """Main method to scrape all data."""
        self.logger.info("Starting Goodreads scraping...")
        self.logger.info("User ID: %s", self.user_id)
        
        if not self.verify_session():
            self.logger.error("Session verification failed. Aborting scrape.")
            return {"error": "Invalid or expired session cookie. Please update your cookie."}
        
        self.logger.info("Scraping home feed activity...")
        feed_activity = await self.get_home_feed_activity()

        self.logger.info("Scraping books data...")
        books_data = self.get_books_data()
        
        self.logger.info("Getting account metadata...")
        metadata = self.get_account_metadata()
        
        self.logger.info("Getting reading challenge details...")
        challenge = self.get_reading_challenge_details()
        
        self.logger.info("Calculating statistics...")
        statistics = self.calculate_statistics(books_data)
        
        all_data = {
            'metadata': metadata,
            'books': books_data,
            'feed_activity': feed_activity,
            'reading_challenge': challenge,
            'statistics': statistics,
            'scraped_timestamp': datetime.now().isoformat()
        }
        
        self.logger.info("Scraping complete!")
        return all_data