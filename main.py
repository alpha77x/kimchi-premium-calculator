import requests

UPBIT_API_URL = "https://api.upbit.com/v1/ticker?markets=KRW-TRX"
BINANCE_API_URL = "https://api.binance.com/api/v3/ticker/price?symbol=TRXUSDT"
NAVER_API_URL = "https://api.stock.naver.com/marketindex/exchange/FX_USDKRW"

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0'
}

def fetch_data(url, headers=None):
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"API 요청 오류 [{url}]: {e}")
        return None

def get_exchange_rate():
    data = fetch_data(NAVER_API_URL, HEADERS)
    if data:
        close_price = data.get("exchangeInfo", {}).get("closePrice")
        if close_price:
            return float(close_price.replace(',', ''))
    print("환율 정보를 찾을 수 없습니다.")
    return None

def upbit_trx():
    data = fetch_data(UPBIT_API_URL)
    return data[0]['trade_price'] if data else None

def binance_trx():
    data = fetch_data(BINANCE_API_URL)
    return float(data['price']) if data else None

def calculate_kimchi():
    exchange_rate = get_exchange_rate()
    if exchange_rate is None:
        return None, None

    upbit_price = upbit_trx()
    binance_price = binance_trx()

    if upbit_price is not None and binance_price is not None:
        kimchi_premium = ((upbit_price - (binance_price * exchange_rate)) / (binance_price * exchange_rate)) * 100
        return round(kimchi_premium, 2), exchange_rate

    print("업비트 또는 바이낸스 데이터를 가져올 수 없습니다.")
    return None, None

if __name__ == "__main__":
    print("김치 프리미엄 계산 중...")
    kimchi_premium, exchange_rate = calculate_kimchi()

    if kimchi_premium is not None:
        print(f"현재 김프: {kimchi_premium}%")
        print(f"환율: {exchange_rate:.2f} KRW/USD")
    else:
        print("김치 프리미엄 계산 실패.")