# HP Downloader

> **A production-ready, full-stack media downloader created by Harsh Kumar.**  
> Inspired by the UX and design language of [VidsSave](https://vidssave.com/youtube-video-downloader-8hs), re-architected with original branding, enterprise security controls, and high-performance streaming extraction.

**Creator:** Harsh Kumar  
**Support Email:** [kum.harshofficial@gmail.com](mailto:kum.harshofficial@gmail.com)  
**License:** MIT

---

## 🌟 Key Features

- **Reference-Matched Visual Craft**: Clean, modern interface reproducing the responsive hero, URL search pill, format selection cards, 5-step guide, and FAQ accordion with `#00c246` brand accent and slate dark `#1a1d2b` footer.
- **Universal Platform Support**: Native adapters for **YouTube** (Videos, Shorts, Music), **Instagram** (Reels, Posts), and **Facebook** (Watch, Reels) with extensible adapter design.
- **Full HD & Audio Extraction**: Multi-resolution format choices (1080p Full HD, 720p HD, 480p, 360p) and crystal clear MP3 audio extraction (320 kbps, 192 kbps, 128 kbps).
- **Real-Time Job Orchestration**: Asynchronous download jobs with live progress percentage, stream multiplexing (FFmpeg), and instant browser download delivery.
- **Anti-Slop Design Polish**: Adheres strictly to `better-web-ui` and `frontend-design-pro` rules with layout-matching shimmer loading skeletons, action-oriented button copy, and complete keyboard accessibility (`Escape` dismissal, focus-visible states).
- **Enterprise Security**:
  - **SSRF Defense**: Deep DNS validation blocking localhost, private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), loopback (`127.0.0.0/8`, `::1`), and cloud metadata (`169.254.169.254`).
  - **Zero Shell Concatenation**: Isolated `execFile` / `spawn` subprocess invocations using strictly validated argument vectors.
  - **Path Traversal Protection**: Cryptographic UUID job tokens and rigorous filename sanitization.
  - **Rate Limiting & Bounded Storage**: IP-based rate limiting with automatic background temporary file purging (15-minute TTL).
  - **Platform Terms Respect**: Zero DRM circumvention, no credential theft, and transparent user explanations for restricted media.

---

## 🏗️ Architecture

```
hp-downloader/
├── backend/                  # Production Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── config/           # Environment variables & constants
│   │   ├── controllers/      # Media & system request handlers
│   │   ├── middleware/       # Rate limiting & security
│   │   ├── routes/           # REST endpoints (/api/analyze, /api/download, /api/health)
│   │   ├── services/         # yt-dlp execution & job queue manager
│   │   ├── utils/            # SSRF validation, filename sanitization
│   │   └── tests/            # Automated security & integration tests
│   └── package.json
├── frontend/                 # React 19 + Vite + Tailwind CSS + Lucide
│   ├── src/
│   │   ├── components/       # Header, Hero, UrlInput, ResultCard, Modals, FAQ, Footer
│   │   ├── types.ts          # Strongly typed interfaces
│   │   └── App.tsx           # State management & download polling
│   └── package.json
├── Dockerfile                # Multi-stage production container
├── docker-compose.yml        # One-command local/production runner
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites

- **Node.js**: v18.0.0+ (Tested on v24.20.0)
- **Python**: 3.9+ with `yt-dlp` (`pip install yt-dlp`)
- **FFmpeg**: Installed and on system PATH

### 1. Clone & Install Dependencies

```bash
cd hp-downloader

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Run in Development Mode

In Terminal 1 (Backend API):
```bash
cd backend
npm run dev
# Server starts on http://localhost:5000
```

In Terminal 2 (Frontend Dev Server):
```bash
cd frontend
npm run dev
# Vite runs on http://localhost:3000 (proxies /api to :5000)
```

---

## 📦 Production Build & Unified Server

The Express backend is configured to automatically serve the optimized frontend build from `frontend/dist`.

```bash
# Build both frontend and backend
npm run build

# Start the unified production server
npm start
# Visit http://localhost:5000 in your browser
```

---

## 🐳 Docker Deployment

A multi-stage `Dockerfile` is provided that installs Alpine Linux, Python 3, Node.js, FFmpeg, and `yt-dlp`, runs under an unprivileged `appuser`, and includes automated healthchecks:

```bash
docker compose up -d --build
```

Access the application at `http://localhost:5000`.

---

## 📡 API Specification

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | `GET` | Service status, creator info, yt-dlp version, and FFmpeg verification |
| `/api/analyze` | `POST` | Accepts `{ url }`, validates SSRF, and returns media title, thumbnail, duration, and format matrix |
| `/api/download` | `POST` | Accepts `{ url, formatId, formatType, title }` and initiates asynchronous extraction job |
| `/api/download/status/:id` | `GET` | Polling endpoint for real-time extraction progress (0–100%) |
| `/api/download/file/:id` | `GET` | Streams the downloaded file with safe `Content-Disposition` attachment headers |
| `/api/contact` | `POST` | Handles validated contact form inquiries with rate-limiting |

---

## 🧪 Testing Matrix

Run the automated test suite:
```bash
cd backend
npm test
```

### Verified Scenarios:
- [x] **SSRF Protection**: Blocks `localhost`, `127.0.0.1`, `[::1]`, `169.254.169.254`, `10.0.0.0/8`, `192.168.0.0/16`, and non-HTTP protocols.
- [x] **Platform Identification**: Correctly categorizes YouTube (`youtube.com`, `youtu.be`), Instagram, and Facebook URLs.
- [x] **Filename Sanitization**: Eliminates path traversal (`../../etc/passwd`), null bytes, reserved symbols, and caps length at 120 chars.
- [x] **Health Check**: Validates Python subprocess execution, `yt-dlp` availability, FFmpeg integration, and temporary directory writeability.
- [x] **Production Build**: 100% clean compilation on both TypeScript and Vite without warnings or type errors.

---

## 📄 Legal & Compliance

- **Creator Attribution**: HP Downloader was authored by **Harsh Kumar**.
- **User Responsibility**: Users must ensure they have legitimate rights or authorization to download any target content.
- **Platform Adherence**: HP Downloader strictly abides by platforms' terms of service, fair-use guidelines, and does not harvest cookies, steal user credentials, or circumvent DRM.

### Optional server-side yt-dlp cookies

By default, extraction runs without account cookies. If a platform requires an authorized session for content the service operator is entitled to access, an administrator can optionally configure a Netscape-format `cookies.txt` file as a Render Secret File and set `YT_DLP_COOKIES_FILE=/etc/secrets/youtube-cookies.txt`. The backend copies that file to a mode-0600 temporary file for each extraction and removes the temporary copy when the process ends. Cookie contents are never sent to the frontend or written to application logs. yt-dlp reads the cookie file using its supported `--cookies FILE` option.

Treat these cookies as account credentials: use a dedicated account, rotate or revoke them when no longer needed, and never commit them. **This application currently has no per-user authentication, so configured cookies are shared by every caller of the public API. Do not enable this option on an unrestricted public service.** Use it only behind access controls and for content the account owner is authorized to access. Cookies do not bypass DRM, paywalls, private-content policy, age restrictions, or platform anti-bot decisions, and may not resolve Render egress-IP blocking. To configure on Render, add the file under the service's Environment → Secret Files and set `YT_DLP_COOKIES_FILE` to its runtime path; saving changes triggers a deploy.
