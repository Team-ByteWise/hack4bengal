import hashlib
import json

from flask import Flask, request
from flask_caching import Cache

from bytewise import wiseshield

app = Flask(__name__)

app.config['CACHE_TYPE'] = 'simple'
cache = Cache(app)


def generate_cache_key(data):
    key = hashlib.md5(json.dumps(data, sort_keys=True).encode()).hexdigest()
    return f"wiseshield_cache_{key}"


@app.route("/")
def hello_world():
    return "<h1>Team ByteWise</h1><h3>WiseShield Ai Backend</h3>"


@app.route("/check", methods=["POST"])
def check_for_phishing_site():
    cache_key = generate_cache_key(request.get_json())
    cached_response = cache.get(cache_key)
    if cached_response:
        return cached_response

    data = request.get_json()
    if 'content' in data and data['content']:
        response = wiseshield.check_url_content(url=data['url'], content=data['content'])
    else:
        response = wiseshield.check_url(url=data['url'])

    cache.set(cache_key, response, timeout=86400)
    return response


@app.route("/train", methods=["POST"])
def train_model():
    data = request.get_json()
    if 'urls' in data and isinstance(data['urls'], list):
        return wiseshield.train_new_real_sites(urls=data['urls'])
    else:
        return wiseshield.train_new_real_sites(urls=[data['url']])


def main():
    append_urls = json.load(open('training_data/tech_sites.json'))
    wiseshield.train_new_real_sites(urls=append_urls)


if __name__ == "__main__":
    # main()
    app.run()
