#!/usr/bin/env python3
import requests
import json
import os
import time
from urllib.parse import urlparse, parse_qs, urlencode

def read_urls(filename):
    with open(filename, 'r') as file:
        return [line.strip() for line in file if line.strip()]

def encode_url(url):
    # First, replace any potential HTML entities
    url = url.replace('&amp;', '&')
    
    # Parse the URL
    parsed = urlparse(url)
    
    # Parse and encode the query parameters
    query_params = parse_qs(parsed.query)
    encoded_query = urlencode(query_params, doseq=True)
    
    # Reconstruct the URL
    encoded_url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}?{encoded_query}"
    
    return encoded_url

def fetch_json(url, max_retries=3):
    encoded_url = encode_url(url)
    for attempt in range(max_retries):
        try:
            response = requests.get(encoded_url)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            if attempt == max_retries - 1:
                raise
            print(f"Attempt {attempt + 1} failed. Retrying in {2 ** attempt} seconds...")
            time.sleep(2 ** attempt)

# ... (rest of the script remains the same)
def save_json(data, filename):
    with open(filename, 'w') as file:
        json.dump(data, file, indent=2)

def create_filename(url):
    # First, replace any potential HTML entities
    url = url.replace('&amp;', '&')
    
    parsed_url = urlparse(url)
    query_params = parse_qs(parsed_url.query)
    filename = f"{parsed_url.path.replace('/', '_')}"
    for key, value in query_params.items():
        filename += f"_{key}_{value[0]}"
    return filename[:200] + ".json"

def main():
    urls = read_urls('urls.txt')
    
    if not os.path.exists('responses'):
        os.makedirs('responses')
    
    for url in urls:
        try:
            data = fetch_json(url)
            filename = create_filename(url)
            save_json(data, os.path.join('responses', filename))
            print(f"Successfully saved response for: {url}")
        except Exception as e:
            print(f"Error processing {url}: {str(e)}")
            error_data = {
                "error": str(e),
                "url": url,
                "details": getattr(e, 'response', {}).text if hasattr(e, 'response') else None
            }
            error_filename = f"error_{create_filename(url)}"
            save_json(error_data, os.path.join('responses', error_filename))

if __name__ == "__main__":
    main()