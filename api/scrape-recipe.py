import json
import os
import sys
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

# A partial header set is enough for Cloudflare to reject the request even
# from a residential IP. Sending the full set a real Chrome navigation sends
# (client hints + Sec-Fetch-*) flips some sites from 403 to 200.
FETCH_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/139.0.0.0 Safari/537.36"
    ),
    "Accept": (
        "text/html,application/xhtml+xml,application/xml;q=0.9,"
        "image/avif,image/webp,image/apng,*/*;q=0.8"
    ),
    "Accept-Language": "en-US,en;q=0.9",
    "sec-ch-ua": '"Chromium";v="139", "Not;A=Brand";v="99"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"macOS"',
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
}

# Each attempt goes out through a different proxy IP.
FETCH_ATTEMPTS = 5

# Chrome TLS fingerprint to replay. curl_cffi has no rolling "chrome"
# alias, so this pins a version and needs bumping as curl_cffi adds targets.
IMPERSONATE_TARGET = "chrome146"

FIRECRAWL_ENDPOINT = "https://api.firecrawl.dev/v2/scrape"


def _json_response(handler: BaseHTTPRequestHandler, status: int, body: dict) -> None:
    payload = json.dumps(body).encode("utf-8")
    handler.send_response(status)
    for k, v in CORS_HEADERS.items():
        handler.send_header(k, v)
    handler.send_header("Content-Type", "application/json")
    handler.send_header("Content-Length", str(len(payload)))
    handler.end_headers()
    handler.wfile.write(payload)


def _fetch_via_firecrawl(url: str, api_key: str) -> str | None:
    """Last-resort fetch for sites curl_cffi cannot reach. HTML or None.

    Firecrawl refuses some domains outright (Dotdash Meredith properties
    return "we do not support this site"), so this is not a guaranteed win.
    """
    import requests

    try:
        r = requests.post(
            FIRECRAWL_ENDPOINT,
            headers={"Authorization": f"Bearer {api_key}"},
            json={"url": url, "formats": ["rawHtml"], "proxy": "stealth"},
            timeout=60,  # stealth rendering is slow
        )
        if r.status_code != 200:
            return None
        payload = r.json()
        data = payload.get("data", payload)
        return data.get("rawHtml") or None
    except (requests.exceptions.RequestException, ValueError):
        return None


def _safe_call(fn, default=None):
    try:
        return fn()
    except Exception:
        return default


def _log(msg: str) -> None:
    print(f"[scrape-recipe] {msg}", file=sys.stderr, flush=True)


class handler(BaseHTTPRequestHandler):  # noqa: N801
    def do_OPTIONS(self):
        self.send_response(204)
        for k, v in CORS_HEADERS.items():
            self.send_header(k, v)
        self.end_headers()

    def do_POST(self):
        try:
            from curl_cffi import requests as curl_requests
        except ModuleNotFoundError as e:
            _json_response(
                self,
                500,
                {
                    "error": (
                        "Missing Python dependency: curl_cffi. "
                        "Install requirements.txt and restart `vercel dev`."
                    ),
                    "details": str(e),
                },
            )
            return

        try:
            from recipe_scrapers import (
                NoSchemaFoundInWildMode,
                WebsiteNotImplementedError,
                scrape_html,
            )
        except ModuleNotFoundError as e:
            _json_response(
                self,
                500,
                {
                    "error": (
                        "Missing Python dependency: recipe-scrapers. "
                        "Install requirements.txt and restart `vercel dev`."
                    ),
                    "details": str(e),
                },
            )
            return

        # Parse request body
        content_length = int(self.headers.get("Content-Length", 0))
        raw_body = self.rfile.read(content_length) if content_length > 0 else b""
        try:
            body = json.loads(raw_body)
        except (json.JSONDecodeError, ValueError):
            _json_response(self, 400, {"error": "Request body must be valid JSON."})
            return

        url = body.get("url")
        if not url or not isinstance(url, str):
            _json_response(self, 400, {"error": "Missing required field: url"})
            return

        _log(f"POST url={url}")

        # Validate protocol
        parsed = urlparse(url)
        if parsed.scheme not in ("http", "https"):
            _json_response(
                self, 400, {"error": "Only http and https URLs are allowed."}
            )
            return

        # Recipe sites block datacenter IPs, so all fetches go through the
        # rotating residential proxy. Both values use an http:// scheme even
        # for https targets: requests opens a CONNECT tunnel over the proxy.
        http_proxy = os.environ.get("PROXY_HTTP_URL")
        https_proxy = os.environ.get("PROXY_HTTPS_URL")
        if not http_proxy or not https_proxy:
            _json_response(
                self,
                500,
                {
                    "error": (
                        "Server is missing PROXY_HTTP_URL / PROXY_HTTPS_URL. "
                        "Recipe sites block direct requests."
                    )
                },
            )
            return

        proxies = {"http": http_proxy, "https": https_proxy}
        _log("fetching via curl_cffi through proxy")

        # Cloudflare fingerprints the TLS handshake, so browser-like headers
        # alone still get a 403 - plain requests fails every attempt on those
        # sites. curl_cffi replays a real Chrome handshake, which clears it.
        # Blocks are probabilistic, so retry: each attempt also gets a fresh
        # proxy IP.
        resp = None
        last_error = None
        for _attempt in range(FETCH_ATTEMPTS):
            try:
                resp = curl_requests.get(
                    url,
                    headers=FETCH_HEADERS,
                    proxies=proxies,
                    impersonate=IMPERSONATE_TARGET,
                    timeout=30,
                )
                if resp.status_code == 200:
                    _log(f"attempt {_attempt + 1}/{FETCH_ATTEMPTS}: ok")
                    break
                last_error = f"HTTP {resp.status_code}"
                resp = None
            except Exception as e:  # curl_cffi raises its own error hierarchy
                last_error = str(e) or type(e).__name__
            _log(f"attempt {_attempt + 1}/{FETCH_ATTEMPTS}: {last_error}")

        html = resp.text if resp is not None else None

        # Firecrawl renders in a real browser and can reach a few sites that
        # block us outright. Optional: without a key we simply skip the tier.
        if html is None:
            firecrawl_key = os.environ.get("FIRECRAWL_API_KEY")
            if firecrawl_key:
                _log("curl_cffi exhausted, trying Firecrawl")
                html = _fetch_via_firecrawl(url, firecrawl_key)
                _log(f"Firecrawl {'returned HTML' if html else 'failed'}")

        if not html:
            _log(f"fetch failed: {last_error}")
            host = parsed.netloc.replace("www.", "") or "this site"
            _json_response(
                self,
                502,
                {
                    "error": (
                        f"Could not fetch the recipe from {host}. "
                        "Copy the recipe text and use the Paste tab instead."
                    ),
                    # Raw transport error stays out of the user-facing string:
                    # it may be our own proxy failing, not the site blocking.
                    "details": last_error,
                },
            )
            return

        # Parse with recipe-scrapers
        try:
            scraper = scrape_html(html, org_url=url, wild_mode=True)
        except (WebsiteNotImplementedError, NoSchemaFoundInWildMode):
            _json_response(
                self,
                422,
                {
                    "error": (
                        "Could not extract a recipe from this page. "
                        "Try pasting the recipe text directly."
                    )
                },
            )
            return
        except Exception as e:
            _json_response(self, 500, {"error": f"Recipe parsing failed: {e}"})
            return

        result = {
            "title": _safe_call(scraper.title, ""),
            "ingredients": _safe_call(scraper.ingredients, []),
            "instructions_list": _safe_call(scraper.instructions_list, []),
            "yields": _safe_call(scraper.yields, ""),
            "total_time": _safe_call(scraper.total_time, None),
            "prep_time": _safe_call(scraper.prep_time, None),
            "cook_time": _safe_call(scraper.cook_time, None),
            "image": _safe_call(scraper.image, ""),
            "host": _safe_call(scraper.host, ""),
            "language": _safe_call(scraper.language, ""),
            "description": _safe_call(scraper.description, ""),
        }

        # Two ways a fetch can look successful but yield nothing usable:
        # an anti-bot interstitial served as HTTP 200, or a site-specific
        # scraper that breaks upstream (simplyrecipes raises AttributeError
        # on instructions, which _safe_call turns into an empty list).
        # A recipe missing either half is not usable, so require both.
        _log(
            f"scraped title={result['title']!r} "
            f"ingredients={len(result['ingredients'])} "
            f"steps={len(result['instructions_list'])}"
        )

        if not result["ingredients"] or not result["instructions_list"]:
            _json_response(
                self,
                422,
                {
                    "error": (
                        "Could not extract a recipe from this page. "
                        "Try pasting the recipe text directly."
                    )
                },
            )
            return

        _log("200 OK")
        _json_response(self, 200, result)

    def log_message(self, format, *args):  # noqa: A002
        pass  # Suppress default Vercel log noise
