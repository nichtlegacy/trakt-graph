# 📺 Trakt Contribution Graph

<p align="center">
  <img src="https://img.shields.io/github/actions/workflow/status/nichtlegacy/trakt-graph/update-trakt-graph.yml?label=action&style=flat-square" alt="GitHub Workflow Status">
  <img src="https://img.shields.io/github/release/nichtlegacy/trakt-graph.svg?style=flat-square" alt="GitHub Release">
  <img src="https://img.shields.io/badge/Made%20with-Node.js-green?style=flat-square" alt="Made with Node.js">
  <img src="https://img.shields.io/badge/JavaScript-ES6+-yellow?style=flat-square" alt="JavaScript">
  <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License">
</p>

<p align="center">
  <strong>Transform your Trakt watch history into a beautiful GitHub-style contribution graph</strong>
</p>

> [!WARNING]
> **Project status: unmaintained / archived in practice.**
>
> Trakt has changed its API access policy: **free accounts can now only register a single API application**. Since my one available app slot is used by [Kometa](https://kometa.wiki/), I can no longer run this project on my own account, and my graph is no longer updated.
>
> The code still works if you have a free API app slot available (or a Trakt VIP account, which allows more applications). But I am no longer actively developing or testing it. Issues and pull requests may go unanswered — feel free to fork.
>
> See [Trakt API limitations](#-trakt-api-limitations) for details and workarounds.

<p align="center">
  <a href="https://trakt.tv/users/TheLagacyMiner/" target="_blank">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://github.com/nichtlegacy/trakt-graph/raw/main/images/github-trakt-dark.svg">
      <source media="(prefers-color-scheme: light)" srcset="https://github.com/nichtlegacy/trakt-graph/raw/main/images/github-trakt-light.svg">
      <img alt="Trakt contribution graph" src="https://github.com/nichtlegacy/trakt-graph/raw/main/images/github-trakt-light.svg" width="100%">
    </picture>
  </a>
</p>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎨 **Light & Dark Themes** | Automatically adapts to GitHub's theme preference |
| 📊 **Activity Heatmap** | GitHub-style contribution graph showing movie & episode activity |
| 👤 **Profile Integration** | Shows profile picture, display name, and all-time stats |
| 🎬 **Content Filtering** | Display movies only, shows only, or everything together |
| 📅 **Multi-Year Support** | Generate vertical graphs spanning multiple years |
| 🎯 **Streak Highlighting** | Hover over stats to highlight your longest activity streak |
| 💬 **Interactive Tooltips** | Hover over cells to see specific titles watched that day |
| 🏎️ **Fast & Efficient** | Uses the Trakt API with intelligent pagination and caching |
| 🔄 **Daily Updates** | Automated updates via GitHub Actions |

---

## 📸 Examples

### Movies Only
<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://github.com/nichtlegacy/trakt-graph/raw/main/images/trakt-movies-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://github.com/nichtlegacy/trakt-graph/raw/main/images/trakt-movies-light.svg">
    <img alt="Trakt movies only graph" src="https://github.com/nichtlegacy/trakt-graph/raw/main/images/trakt-movies-light.svg" width="100%">
  </picture>
</p>

### Episodes Only
<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://github.com/nichtlegacy/trakt-graph/raw/main/images/trakt-shows-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://github.com/nichtlegacy/trakt-graph/raw/main/images/trakt-shows-light.svg">
    <img alt="Trakt episodes only graph" src="https://github.com/nichtlegacy/trakt-graph/raw/main/images/trakt-shows-light.svg" width="100%">
  </picture>
</p>

---

## 🚀 Quick Start

### 1. Fork this Repository

Click the **Fork** button at the top-right of this page.

### 2. Configure Trakt API

> [!IMPORTANT]
> Free Trakt accounts are limited to **one API application**. If that slot is already taken by another tool (Kometa, Tautulli integrations, a Trakt scrobbler, ...), you must either reuse that application's Client ID or upgrade to Trakt VIP. See [Trakt API limitations](#-trakt-api-limitations).

1. Go to [Trakt API App Setup](https://trakt.tv/oauth/applications) and create a new application.
2. For **Redirect URI**, use `urn:ietf:wg:oauth:2.0:oob`.
3. Copy your **Client ID**.
4. In your GitHub repository, go to **Settings** → **Secrets and variables** → **Actions**.
5. Add a new **Repository secret**:
   - Name: `TRAKT_API_KEY`
   - Value: `(Your Trakt Client ID)`

### 3. Update Your Username

Edit `.github/workflows/update-trakt-graph.yml`:

```yaml
env:
  TRAKT_USERNAME: "YOUR_TRAKT_USERNAME"
```

### 4. Enable GitHub Actions

Go to **Actions** tab → Enable workflows if prompted.

The automatic triggers (`schedule` and `push`) are **commented out** in this repository, because there is no working API key here anymore. In your fork, uncomment them in `.github/workflows/update-trakt-graph.yml` to get daily updates.

### 5. Run the Workflow

The graph updates daily at midnight UTC, or trigger manually via the **Actions** tab.

---

## 📖 CLI Usage

```bash
# Install dependencies
npm install

# Set your API Key (Client ID)
$env:TRAKT_API_KEY = "your_client_id" # Windows PowerShell
# export TRAKT_API_KEY="your_client_id" # Linux/macOS

# Basic usage
node src/cli.js <username>

# With options
node src/cli.js <username> [options]
```

### Arguments

| Flag | Description | Default |
|------|-------------|---------|
| `-y <years>` | Year(s) to generate, comma-separated (e.g. `2025,2024`) | Current year |
| `-t <type>` | Content type: `movies`, `shows`, or `all` | `all` |
| `-w <day>` | Week start: `sunday` or `monday` | `sunday` |
| `-o <path>` | Output path (without extension) | `images/github-trakt` |
| `-g <bool>` | Enable username gradient: `true` or `false` | `true` |
| `-p` | Export PNG files in addition to SVG | Disabled |
| `--all-variants` | Generate combined, movies-only, and shows-only graphs in one run | Disabled |

---

## 🔧 GitHub Actions Setup

### 1. Repository Secret

To use the automated workflow, you must provide your Trakt API Key as a GitHub Secret:

1. Go to your repository on GitHub.
2. Navigate to **Settings** → **Secrets and variables** → **Actions**.
3. Create a **New repository secret**.
4. Set the name to `TRAKT_API_KEY` and the value to your Trakt **Client ID**.

### 2. Workflow File

Full configuration is available in the workflow file header:

```yaml
env:
  TRAKT_USERNAME: "TheLagacyMiner"
  YEARS: ""              # e.g. "2025,2024" or empty for current
  WEEK_START: "sunday"
  GRADIENT: "true"
```

The workflow always generates all three graph variants:

- `images/github-trakt-*.svg`
- `images/trakt-movies-*.svg`
- `images/trakt-shows-*.svg`

It does this in a single CLI run, so Trakt data is fetched once and then reused for all outputs.

---

## 📂 Project Structure

```
trakt-graph/
├── .github/
│   └── workflows/
│       └── update-trakt-graph.yml
├── fonts/               # Required for SVG text measurement
├── images/              # Target directory for generated graphs
├── src/
│   ├── cli.js           # CLI entry point
│   ├── fetcher.js       # Trakt API interaction
│   ├── generator.js     # SVG layout and rendering
│   ├── stats.js         # Activity calculations
│   └── exporter.js      # PNG export (Sharp)
├── package.json
└── README.md
```

---

## 🖼️ Embed in Your README

```html
<p align="center">
  <a href="https://trakt.tv/users/YOUR_TRAKT_USERNAME/" target="_blank">
    <picture>
      <source
        media="(prefers-color-scheme: dark)"
        srcset="https://github.com/YOUR_GITHUB_USERNAME/trakt-graph/blob/main/images/github-trakt-dark.svg"
      />
      <source
        media="(prefers-color-scheme: light)"
        srcset="https://github.com/YOUR_GITHUB_USERNAME/trakt-graph/blob/main/images/github-trakt-light.svg"
      />
      <img
        alt="Trakt contribution graph"
        src="https://github.com/YOUR_GITHUB_USERNAME/trakt-graph/blob/main/images/github-trakt-light.svg"
      />
    </picture>
  </a>
</p>
```

---

## ⚠️ Trakt API Limitations

Trakt tightened its API policy: a **free Trakt account can only have one registered API application** at a time. The Client ID of that single application is what this project uses as `TRAKT_API_KEY`.

This has a direct consequence: if you already use your API app for another service — for example [Kometa](https://kometa.wiki/), a scrobbler, or a media-server integration — you cannot simply register a second app for `trakt-graph`.

**Options if you hit this limit:**

| Option | What it means |
|--------|---------------|
| **Reuse the existing Client ID** | Trakt applications are not bound to one tool. You can put the same Client ID into `TRAKT_API_KEY` and use it for both Kometa and this project. Only viable if the other tool does not depend on app-specific OAuth setup, and it means both tools share the same rate limit. |
| **Trakt VIP** | A [VIP subscription](https://trakt.tv/vip) lifts the application limit, so you can register a dedicated app for this project. |
| **Delete the other application** | Frees the slot, but breaks whatever tool was using it. |
| **Stop using the project** | What I did — my slot is needed for Kometa. |

Note that this project only performs **public, read-only** requests (watch history and profile of a public Trakt user), so it needs nothing more than a Client ID — no OAuth tokens, no user authorization.

---

## 🛠️ Requirements

- **Node.js** v18 or higher
- **Trakt API Key** (Client ID)
- **GitHub Actions** enabled for automation

---

## 🤝 Contributing & License

MIT License. Contributions are welcome!
