from flask import Flask, request
from bytewise import wiseshield
import json

app = Flask(__name__)


@app.route("/")
def hello_world():
    return "<h1>Team ByteWise</h1><h3>WiseShield Ai Backend</h3>"


@app.route("/check", methods=["POST"])
def check_for_phishing_site():
    data = request.get_json()
    if 'content' in data and data['content']:
        return wiseshield.check_url_content(url=data['url'], content=data['content'])
    else:
        return wiseshield.check_url(url=data['url'])


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
