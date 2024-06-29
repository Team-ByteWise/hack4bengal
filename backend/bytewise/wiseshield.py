import time
import joblib
import pandas
import pandas as pd
import requests
import tldextract
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from bytewise import logd, loge, logi, logw


def extract_content(response: str) -> str | None:
    if not response:
        return None
    soup = BeautifulSoup(response, 'html.parser')
    text_content = ' '.join([element.get_text() for element in soup.find_all(['p', 'h1', 'h2', 'h3', 'a'])])
    return text_content


def get_url(url: str) -> str | None:
    try:
        logd(f"Fetching content from {url}")
        response = requests.get(url, allow_redirects=True, timeout=30)

        logd(f"Response status code: {response.status_code}")
        content = response.content
        logd(f"Response content length: {len(content)}")
        trimmed_content = content.decode(errors='ignore')[:100].replace('\n', ' ')
        logd(f"Response content: {trimmed_content}")
        return content.decode(errors='ignore')
    except Exception as e:
        loge(f"Error fetching content from {url}: {e}")
        return None


def extract_features(url: str, content: str) -> dict[str, str]:
    features = {
        "url": url,
        "domain": get_main_domain(url),
        "content": content
    }
    return features


def get_main_domain(url: str) -> str:
    ext = tldextract.extract(url)
    return f"{ext.domain}.{ext.suffix}"


def get_content_using_selenium(url: str) -> str:
    content = ""
    logi(f"Fetching content using Selenium from {url}")

    chrome_options = Options()
    # chrome_options.add_argument('--headless')

    driver = webdriver.Chrome(options=chrome_options)
    try:
        driver.get(url)
        driver.set_page_load_timeout(30)
        driver.set_script_timeout(30)
        driver.implicitly_wait(30)
        content = driver.page_source

        logi(f"Response Content length: {len(content)}")
        trimmed_content = content[:100].replace('\n', ' ')
        logi(f"Response Content: {trimmed_content}")
    finally:
        driver.quit()
        return content


def get_features_from_site(real_sites: list[str]) -> list[dict[str, str]]:
    real_sites_features = []
    for site in real_sites:
        print(f"Getting features from {site}...", end=' ')
        time_init = time.time()
        content = extract_content(get_url(site))
        if not content or not content.strip() or 'captcha' in content.lower():
            content = extract_content(get_content_using_selenium(site))

        if content:
            features = extract_features(site, content)
            real_sites_features.append(features)
            print(f"Done", end=' ')
        else:
            print(f"Failed", end=' ')

        time_finish = time.time()
        time_taken = round(time_finish - time_init, 4)
        print(f"[{time_taken} secs]")

    return real_sites_features


def check_similarity(url: str, content: str) -> dict[str, str]:
    vectorizer = joblib.load('data/tfidf_vectorizer_real_site_probability.pkl')
    real_sites_df = pandas.read_pickle('data/real_sites_features_probability.pkl')
    real_sites_tfidf = vectorizer.fit_transform(real_sites_df['content'])

    features = extract_features(url, content)
    tfidf_features = vectorizer.transform([features['content']])

    logi(f"TF-IDF features shape: {tfidf_features.shape}")

    similarities = cosine_similarity(tfidf_features, real_sites_tfidf).flatten()
    max_similarity_index = similarities.argmax()
    max_similarity = similarities[max_similarity_index]

    logi(f"Similarities: {similarities}")
    logi(f"Max similarity index: {max_similarity_index}")
    logi(f"Max similarity: {max_similarity}")

    real_site = real_sites_df.iloc[max_similarity_index]
    real_site_domain = real_site["domain"]
    real_site_url = real_site["url"]
    provided_url_domain = get_main_domain(url)

    print(f"Max similarity: {max_similarity}")
    print(f"Real site URL: {real_site_url}")
    print(f"Provided URL: {url}")

    if max_similarity > 0.7:
        if real_site_domain != provided_url_domain:
            return {"status": "fake", "real_domain": real_site_domain, "real_url": real_site_url,
                    "probability": max_similarity}
        else:
            return {"status": "real", "real_domain": real_site_domain, "real_url": real_site_url,
                    "probability": max_similarity}
    else:
        return {"status": "uncertain", "real_domain": real_site_domain, "real_url": real_site_url,
                "probability": max_similarity}


def check_similarity_using_url(url) -> dict[str, str | None]:
    content = extract_content(get_url(url))
    if not content:
        content = extract_content(get_content_using_selenium(url))

    if content:
        return check_similarity(url, content)
    else:
        logw(f"Could not fetch content from {url}")
        return {"status": "error", "real_domain": None, "real_url": None, "probability": None,
                "error": "Could not fetch content"}


def append_new_data(features: list[dict[str, int | str]]) -> bool:
    try:
        existing_data = pandas.read_pickle('data/real_sites_features_probability.pkl')
        print("Existing data loaded successfully.")
    except FileNotFoundError:
        print("File not found. Initializing empty DataFrame.")
        existing_data = pandas.DataFrame()

    try:
        new_data = pandas.DataFrame(features)
        combined_data = pd.concat([existing_data, new_data], ignore_index=True)

        logi(f"Combined data shape: {combined_data.shape}")
        logi(f"Combined data head: {combined_data.head()}")

        vectorizer = TfidfVectorizer(stop_words='english')
        real_sites_tfidf = vectorizer.fit_transform(combined_data['content'])

        logi(f"TF-IDF shape: {real_sites_tfidf.shape}")

        joblib.dump(vectorizer, 'data/tfidf_vectorizer_real_site_probability.pkl')
        combined_data.to_pickle('data/real_sites_features_probability.pkl')
        print("Data Updated Successfully")
        return True
    except Exception as e:
        print(f"Error updating data: {e}")
        return False


def check_url_list(url: list[str]):
    for url_to_check in url:
        result = check_similarity_using_url(url_to_check)
        print(f"Result for {url_to_check}: {result}")


def check_url(url: str):
    return check_similarity_using_url(url)


def check_url_content(url: str, content: str):
    text_content = extract_content(content)
    return check_similarity(url, text_content)


def train_new_real_sites(urls: list[str]):
    features = get_features_from_site(urls)
    if not features:
        return {"status": "error", "message": "Error fetching content from provided URLs", "urls": urls}
    if append_new_data(features):
        return {"status": "success", "message": "Training data updated successfully", "urls": urls}
    else:
        return {"status": "error", "message": "Error updating training data", "urls": urls}
