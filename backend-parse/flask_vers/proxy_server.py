from flask import Flask, request, jsonify
from flask_cors import CORS
from playwright.sync_api import sync_playwright

app = Flask(__name__)
CORS(app)  # Добавляет поддержку CORS для всех маршрутов
port = 3000


@app.route('/proxy-rusprofile', methods=['GET'])
def proxy_rusprofile():
    inn = request.args.get('inn')
    url = f"https://www.rusprofile.ru/search?query={inn}"
    try:
        response = get_rusprofile_data(url)
        return jsonify(response)
    except Exception as e:
        return f"Error fetching data: {str(e)}", 500


@app.route('/proxy-zakupki', methods=['GET'])
def proxy_zakupki():
    num = request.args.get('num')
    url = f"https://zakupki.gov.ru/epz/order/extendedsearch/results.html?searchString={num}"
    try:
        response = get_zakupki_data(url)
        return jsonify(response)
    except Exception as e:
        return f"Error fetching data: {str(e)}", 500


def get_zakupki_data(url):
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(url, wait_until="networkidle")

        html = page.content()

        data = {
            "object": get_object(html),
            "nmc": get_nmc(html)
        }

        print(f"Запрос на {url}:")
        print(data)

        browser.close()
        return data


def get_object(text):
    object_search = '<div class="registry-entry__body-value">'
    index = text.find(object_search)
    last_index = text.find('</div>', index)
    return text[index + len(object_search):last_index] if index != -1 else None


def get_nmc(text):
    object_search = '<div class="price-block__value"'
    index = text.find(object_search)
    if index == -1:
        return None
    start_index = text.find('>', index) + 1
    last_index = text.find('</div>', index)
    nmc_raw = text[start_index:last_index]
    return ''.join(filter(str.isdigit, nmc_raw))


def get_rusprofile_data(url):
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(url, wait_until="networkidle")

        html = page.content()

        data = {
            "foundationDate": get_date(html),
            "companyName": get_name(html)
        }

        print(f"Запрос на {url}:")
        print(data)

        browser.close()
        return data


# def get_name(text):
#     name_search_term = '<meta property="og:title"'
#     index = text.find(name_search_term)
#     if index == -1:
#         return None
#     last_index = text.find('">', index)
#     name = text[index + len(name_search_term) + 1:last_index]
#     return name.replace('&quot;', '"')

def get_name(text):
    name_search_term = '<meta property="og:title" content="'
    index = text.find(name_search_term)
    if index == -1:
        return None
    start_index = index + len(name_search_term)
    end_index = text.find('"', start_index)
    name = text[start_index:end_index]
    return name.replace('&quot;', '"')

def get_date(text):
    date_search_term = '<dd class="company-info__text" itemprop="foundingDate">'
    index = text.find(date_search_term)
    if index == -1:
        return None
    date_start = index + len(date_search_term)
    date_end = date_start + 10  # 10 символов для даты
    return text[date_start:date_end]


if __name__ == '__main__':
    app.run(port=port)
