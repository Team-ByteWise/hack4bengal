import json

from bytewise import wiseshield


def main():
    real_sites = json.load(open('training_data/tech_sites.json'))
    wiseshield.train_new_real_sites(real_sites)


if __name__ == '__main__':
    main()
