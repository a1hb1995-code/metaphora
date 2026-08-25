"""AAPL/BTC/MSTR 시세를 내려받아 차트로 보여주고 MSTR·BITO 데이터를 CSV로 저장한다."""

import matplotlib.pyplot as plt
import yfinance as yf

OUTPUT_DIR = "."


def show_recent_aapl(start: str = "2026-01-01") -> None:
    df = yf.download("AAPL", start=start)
    print(df.tail())


def plot_btc_vs_mstr(start: str = "2022-11-21", end: str = "2024-01-11") -> None:
    btc = yf.download("BTC-USD", start=start, end=end)
    mstr = yf.download("MSTR", start=start, end=end)

    fig, ax = plt.subplots()
    btc["Close"].plot(ax=ax, label="BTC-USD")
    mstr["Close"].plot(ax=ax, label="MSTR")
    ax.set_title(f"BTC-USD vs MSTR ({start} ~ {end})")
    ax.set_ylabel("Close")
    ax.legend()
    plt.show()


def save_to_csv(ticker: str, start: str, filename: str) -> None:
    data = yf.download(ticker, start=start)
    data.to_csv(f"{OUTPUT_DIR}/{filename}")


def main() -> None:
    show_recent_aapl()
    plot_btc_vs_mstr()
    save_to_csv("MSTR", start="2020-01-01", filename="MSTR.csv")
    save_to_csv("BITO", start="2022-11-01", filename="BITO.csv")
    print("Done!!!")


if __name__ == "__main__":
    main()
