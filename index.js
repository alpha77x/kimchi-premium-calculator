const axios = require("axios");

const UPBIT_API_URL = "https://api.upbit.com/v1/ticker?markets=KRW-TRX";
const BINANCE_API_URL = "https://api.binance.com/api/v3/ticker/price?symbol=TRXUSDT";
const NAVER_API_URL = "https://api.stock.naver.com/marketindex/exchange/FX_USDKRW";

const HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0"
};

async function fetchData(url, headers = {}) {
    try {
        const response = await axios.get(url, { headers });
        return response.data;
    } catch (error) {
        console.error(`API 요청 오류 [${url}]:`, error.message);
        throw new Error(`API 요청 실패: ${url}`);
    }
}

async function getExchangeRate() {
    try {
        const data = await fetchData(NAVER_API_URL, HEADERS);
        const closePrice = data?.exchangeInfo?.closePrice;
        return closePrice ? parseFloat(closePrice.replace(',', '')) : null;
    } catch (error) {
        console.error("환율 정보를 가져올 수 없습니다.");
        return null;
    }
}

async function upbitTrx() {
    try {
        const data = await fetchData(UPBIT_API_URL);
        return data ? data[0].trade_price : null;
    } catch (error) {
        console.error("업비트 가격 정보를 가져올 수 없습니다.");
        return null;
    }
}

async function binanceTrx() {
    try {
        const data = await fetchData(BINANCE_API_URL);
        return data ? parseFloat(data.price) : null;
    } catch (error) {
        console.error("바이낸스 가격 정보를 가져올 수 없습니다.");
        return null;
    }
}

async function calculateKimchi() {
    try {
        const [exchangeRate, upbitPrice, binancePrice] = await Promise.all([
            getExchangeRate(),
            upbitTrx(),
            binanceTrx()
        ]);

        if (!exchangeRate) throw new Error("환율 정보를 가져올 수 없습니다.");
        if (!upbitPrice) throw new Error("업비트 가격 정보를 가져올 수 없습니다.");
        if (!binancePrice) throw new Error("바이낸스 가격 정보를 가져올 수 없습니다.");

        const kimchiPremium = ((upbitPrice - (binancePrice * exchangeRate)) / (binancePrice * exchangeRate)) * 100;
        return { kimchiPremium: Math.round(kimchiPremium * 100) / 100, exchangeRate };
    } catch (error) {
        console.error(error.message);
        return { kimchiPremium: null, exchangeRate: null };
    }
}

(async () => {
    console.log("김치 프리미엄 계산 중...");
    const { kimchiPremium, exchangeRate } = await calculateKimchi();

    if (kimchiPremium !== null) {
        console.log(`현재 김프: ${kimchiPremium}%`);
        console.log(`환율: ${exchangeRate.toFixed(2)} KRW/USD`);
    } else {
        console.log("김치 프리미엄 계산 실패.");
    }
})();