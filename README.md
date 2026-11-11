# ⚡ BATDOC

> **100% Truth-Grounded Windows Battery Intelligence Diagnostic.**  
> Turn confusing, wall-of-text Windows battery reports into clear, actionable, executive health insights and interactive visualizations—completely offline with zero installation.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform: Windows](https://img.shields.io/badge/Platform-Windows%2010%20%7C%2011-0078D6.svg)](https://microsoft.com/windows)
[![Privacy: 100% Offline](https://img.shields.io/badge/Privacy-100%25%20Offline%20%26%20Local-success.svg)](#-privacy--security-guarantee)
[![PWA: Installable](https://img.shields.io/badge/PWA-Installable%20Desktop%20App-0284c7.svg)](#option-4-installable-desktop-app-pwa)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero%20Install-brightgreen.svg)](#-how-any-user-in-the-world-uses-batdoc-instantly)

---

## ⚡ How Any User in the World Uses BATDOC Instantly

BATDOC requires **zero developer tools, zero Python, zero Node.js, and zero setup**. Choose whichever method fits your workflow:

### Option 1: Native Desktop Executable (1-Click, Silent Execution)
1. Download **[`batdoc.exe`](https://github.com/RootDeveloperDS/Bat-Doc/releases)** from the latest release.
2. **Double-click `batdoc.exe`**.
3. **Done!** Runs completely silently (zero black terminal windows), generates `BatDoc-Report.html` on your Desktop, and opens your browser immediately.

---

### Option 2: Instant 1-Line Command (Fastest — 3 Seconds, No Manual Download)
Open Windows PowerShell (press <kbd>Win</kbd> + <kbd>R</kbd>, type `powershell`, and press <kbd>Enter</kbd>), then paste:
```powershell
irm https://raw.githubusercontent.com/RootDeveloperDS/Bat-Doc/master/batdoc.ps1 | iex
```
*✨ What happens:* Windows extracts your battery registers, compiles your executive report directly onto your **Desktop (`BatDoc-Report.html`)**, and automatically opens it in your default browser.

---

### Option 3: 1-Click Double-Click Script (`batdoc.bat`)
1. Download **[`batdoc.bat`](batdoc.bat)** directly to your computer.
2. **Double-click `batdoc.bat`**.
3. Your diagnostic report pops up on your screen immediately and is saved to your Desktop.

---

### Option 4: Installable Desktop App (PWA) / Web Mirror
1. Open the hosted web mirror: **[rootdeveloperds.github.io/Bat-Doc](https://rootdeveloperds.github.io/Bat-Doc/)** in Chrome or Edge.
2. Click **"Install App"** in the top navigation bar or address bar.
3. BATDOC installs directly to your **Windows Start Menu & Desktop** with its own standalone window and icon.
4. Drag & drop your `battery-report.html` anytime. **100% client-side: works fully offline even in Airplane Mode.**

---

## 🔍 The Problem with Standard Windows Battery Reports

When you run `powercfg /batteryreport` in Windows, it generates a dense 1,500-line table of raw milliwatt-hours ($\text{mWh}$), ISO timestamps, and obscure tables.

For everyday users, students, office workers, and non-developers:
* ❌ **No clear Health Score:** You see numbers like `25,774 mWh` vs `40,196 mWh` but no simple health grade or percentage.
* ❌ **Missing Cycle Counts:** Most OEMs (Dell, HP, Lenovo) leave cycle counts as `-`, confusing users into thinking their hardware sensor is broken.
* ❌ **Hidden Vampire Drain:** Windows "Modern Standby" often drains 20–50% of your battery inside your backpack while sleeping, but Windows buries this in disjointed transition rows.
* ❌ **No Lost Time Context:** It doesn't tell you how many hours of portable battery life you've lost since buying the laptop.

---

## 💡 The Solution: BATDOC Executive Dashboard

**BATDOC** parses every single data point from Windows battery reports and translates it into an intuitive, light-theme diagnostic dashboard with **100% mathematical truth grounding**.

| Feature | Windows `powercfg` Raw HTML | BATDOC Pro Diagnostic |
| :--- | :--- | :--- |
| **Health Score** | Raw $\text{mWh}$ subtraction needed | **Exact % + Condition Grade (A+ to F)** |
| **Lost Runtime** | Cryptic duration columns | **Visual Deficit Bar (`5h 14m` → `1h 35m`, `-69.6%`)** |
| **Sleep Drain** | Buried across hundreds of rows | **Sleep Drain Auditor with leak rate (`%/hr`)** |
| **Degradation** | 1,000-row chronological table | **Vector Area Chart with Factory Baseline** |
| **Usage Persona**| None | **AC vs Battery Split (`Hybrid Worker`, etc.)** |
| **Actionable Care**| None | **OEM-specific part suggestions (`DELL 55NWG37`)** |
| **Marketplace Sale**| Raw technical tables | **Official Printable Battery Certificate** |

---

## 🩺 Core Diagnostic Pillars

1. **Battery Health Score & Grade (A+ to F)**  
   Calculates exact chemical capacity retention ($\frac{\text{Full Charge Capacity}}{\text{Design Capacity}} \times 100$) and renders a centered, non-overlapping circular gauge with permanent loss metrics.
2. **Lost Portable Runtime Analysis**  
   Compares your laptop's original factory active runtime against its current observed runtime, highlighting exactly how much portable freedom you have lost.
3. **Modern Standby ("Vampire Drain") Auditor**  
   Audits sleep and suspend intervals to detect abnormal drain rates ($>1.5\%\text{/hr}$), pinpointing severe sleep leaks caused by background network wakeups inside bags.
4. **Capacity Degradation Curve (Interactive SVG Chart)**  
   Renders a vector degradation curve tracking capacity decay from your laptop's earliest recorded date to today against the factory design baseline.
5. **Power Source & Habit Profile**  
   Analyzes cumulative AC plugged-in time vs battery discharge time to categorize your usage persona and recommend longevity optimizations.
6. **Zero Hallucination / 100% Truth Grounding**  
   Every metric includes a **Proof** audit badge that displays the exact source table and calculation from Microsoft's report. No simulated or made-up numbers.
7. **Printable Used Laptop Health Certificate**  
   One-click print/PDF export formatted for buyers and sellers verifying battery health on used laptop marketplaces.

---

## 🔒 Privacy & Security Guarantee

* **100% Client-Side Processing:** All parsing and charting code runs directly inside your local browser tab.
* **Zero Network Calls:** BATDOC does not send your data to any external server or API.
* **No Telemetry / No Tracking:** Zero analytics, cookies, or trackers.
* **Works in Airplane Mode:** You can disconnect your Wi-Fi and BATDOC will function 100% offline.

---

## 🛠️ Project Structure

BATDOC follows clean, modular software engineering principles:

```text
Bat-Doc/
├── batdoc.exe                  # Compiled native Windows launcher (Zero console flash)
├── batdoc.bat                  # 1-Click Windows Batch launcher
├── batdoc.ps1                  # 1-Line PowerShell instant launcher
├── index.html                  # Standalone Web App / Drag-and-Drop Dropzone
├── batdoc-standalone.html      # Inlined zero-dependency offline distribution
├── manifest.json               # PWA Desktop App manifest
├── sw.js                       # PWA Offline Service Worker (Cache-first)
├── assets/                     # Application branding & icons
│   ├── icon.svg                # Vector SVG brand logo
│   └── icon.ico                # Win32 compiled application icon
├── src/                        # Modular source code
│   ├── launcher.cs             # Native C# launcher source
│   ├── parser.js               # Strict 1:1 parser for Windows powercfg tables
│   ├── analytics.js            # Grounded math engine (Health %, Standby, Habits)
│   ├── charts.js               # Native offline SVG vector charting engine
│   ├── formatters.js           # Humanized date and duration converters
│   ├── icons.js                # Executive vector SVG icon library (Zero emojis)
│   ├── ui.js                   # Executive dashboard rendering engine
│   └── styles.css              # Executive light design system
├── tools/
│   ├── build-exe.ps1           # Native C# compiler script (using csc.exe)
│   ├── build-standalone.js     # Robust Node bundler compiling standalone HTML
│   ├── build-standalone.ps1    # PowerShell wrapper for bundler
│   └── test-bundle.js          # Automated syntax and compilation validator
├── sample/
│   └── battery-report.html     # Real-world anonymized sample report for testing
├── CONTRIBUTING.md             # Contribution guidelines
├── LICENSE                     # MIT Open Source License
└── README.md                   # Project documentation
```

---

## 💻 Building From Source

If you want to contribute or modify the source modules:

1. Clone the repository:
   ```bash
   git clone https://github.com/RootDeveloperDS/Bat-Doc.git
   cd Bat-Doc
   ```
2. Modify files inside `src/`.
3. Validate and recompile the standalone distribution and native executable:
   ```powershell
   node .\tools\test-bundle.js
   node .\tools\build-standalone.js
   powershell -ExecutionPolicy Bypass -File .\tools\build-exe.ps1
   ```

---

## 🗺️ Future Roadmap

- [x] **Native Portable Executable (`batdoc.exe`):** Single compiled zero-dependency Windows executable with custom icon and silent execution.
- [ ] **Official Microsoft Package Manager (`winget`):** Support for `winget install BatDoc`.
- [ ] **Windows Explorer Context Menu:** Optional 1-click shortcut in Windows Explorer (*"Right Click Desktop → ⚡ Diagnose Battery with BATDOC"*).

---

## 📄 License

BATDOC is distributed under the [MIT License](LICENSE). Free for personal, commercial, and open-source use.
