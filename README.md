# ⚡ BATDOC

> **100% Truth-Grounded Windows Battery Intelligence Diagnostic.**  
> Turn confusing, wall-of-text Windows battery reports into clear, actionable, god-level health insights and interactive visualizations—completely offline with zero installation.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform: Windows](https://img.shields.io/badge/Platform-Windows%2010%20%7C%2011-0078D6.svg)](https://microsoft.com/windows)
[![Privacy: 100% Offline](https://img.shields.io/badge/Privacy-100%25%20Offline%20%26%20Local-success.svg)](#privacy--security-guarantee)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero%20Install-brightgreen.svg)](#how-it-works)

---

## 🔍 The Problem with Standard Windows Battery Reports

When you run `powercfg /batteryreport` in Windows, it outputs a dense 1,500-line table of raw milliwatt-hours ($\text{mWh}$), ISO timestamps, and obscure hexadecimal-style tables.

For everyday users, students, office workers, and non-developers:
* ❌ **No clear Health Score:** You see numbers like `25,774 mWh` vs `40,196 mWh` but no simple health grade or percentage.
* ❌ **Missing Cycle Counts:** Most OEMs (Dell, HP, Lenovo) leave cycle counts as `-`, confusing users into thinking their sensor is broken.
* ❌ **Hidden Vampire Drain:** Windows "Modern Standby" often drains 20–50% of your battery inside your backpack while sleeping, but Windows buries this in disjointed transition rows.
* ❌ **No Lost Time Context:** It doesn't tell you how many hours of portable battery life you've lost since buying the laptop.

---

## 💡 The Solution: BATDOC

**BATDOC** extracts every single data point from Windows battery reports and translates it into an intuitive, light-theme diagnostic dashboard with **100% mathematical truth grounding**.

### Key Diagnostic Pillars:

1. 🩺 **Battery Health Score & Condition Grade (A+ to F)**  
   Calculates exact chemical capacity retention ($\frac{\text{Full Charge Capacity}}{\text{Design Capacity}} \times 100$) and assigns a human-readable condition grade with verified status.
2. ⏳ **Lost Portable Runtime Analysis**  
   Compares your laptop's original factory active runtime (e.g., 5h 14m) against its current real-world runtime (e.g., 1h 35m), highlighting exactly how much portable freedom you have lost.
3. 🦇 **Modern Standby "Vampire Drain" Auditor**  
   Audits sleep and suspend intervals to detect abnormal drain rates ($>1.5\%\text{/hr}$), pinpointing severe sleep leaks caused by background network wakeups.
4. 📈 **Chronological Degradation Trajectory (Interactive SVG Chart)**  
   Renders a vector degradation curve tracking capacity decay from your laptop's earliest recorded date to today against the factory design baseline.
5. 🔌 **Power Source & Habit Profile**  
   Analyzes your cumulative AC plugged-in time vs battery discharge time to categorize your usage persona (e.g., *Desk Worker* vs *Nomad*) and recommends longevity optimizations (such as 80% charge thresholds).
6. 🛡️ **Zero Hallucination / 100% Truth Grounding**  
   Every metric includes a **Proof** audit badge that displays the exact source table and row from Microsoft's report. No simulated or made-up numbers.
7. 📜 **Printable Used Laptop Health Certificate**  
   One-click print/PDF export formatted for buyers and sellers verifying battery health on used laptop marketplaces.

---

## 🚀 How to Use (For Any User in the World)

BATDOC requires **NO developer setup, NO Python, NO Node.js, and NO command-line knowledge**.

### Method 1: The 1-Click Desktop Utility (Fastest & 100% Offline)
1. Download **[`batdoc.bat`](batdoc.bat)** from the latest release.
2. **Double-click `batdoc.bat`**.
3. **Done!** BATDOC automatically:
   * Interrogates your laptop's battery hardware via Windows.
   * Assembles the interactive diagnostic dashboard.
   * Saves `BatDoc-Report.html` to your **Desktop**.
   * Automatically opens the report in your default browser (Chrome, Edge, etc.).

### Method 2: Web Drag-and-Drop (Zero Download)
If you already have a `battery-report.html` on your computer:
1. Open [`index.html`](index.html) or visit the hosted GitHub Pages mirror.
2. Drag and drop your `battery-report.html` into the dropzone.
3. Your diagnostic appears instantly.

---

## 🔒 Privacy & Security Guarantee

* **100% Client-Side Processing:** All parsing and charting code runs directly inside your local browser tab.
* **Zero Network Calls:** BATDOC does not make a single HTTP request or API call.
* **No Telemetry / No Tracking:** Zero analytics, cookies, or trackers.
* **Works in Airplane Mode:** You can disconnect your Wi-Fi and BATDOC will function identically.

---

## 🛠️ Project Structure

BATDOC follows clean, modular software engineering principles:

```text
battery-report-analysis/
├── batdoc.bat                  # 1-Click Windows Batch launcher
├── index.html                  # Standalone Web App / Drag-and-Drop Dropzone
├── batdoc-standalone.html      # Inlined zero-dependency offline distribution
├── src/                        # Modular source code for contributors
│   ├── parser.js               # Strict 1:1 parser for Windows powercfg tables
│   ├── analytics.js            # Grounded math engine (Health %, Standby, Habits)
│   ├── charts.js               # Native offline SVG vector charting engine
│   ├── formatters.js           # Humanized date and duration converters
│   ├── icons.js                # Executive vector SVG icon library
│   ├── ui.js                   # Light-theme dashboard rendering engine
│   └── styles.css              # Design system with CSS custom properties
├── tools/
│   ├── build-standalone.ps1    # Bundler that compiles src/ into standalone HTML
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
   git clone https://github.com/your-username/batdoc.git
   cd batdoc
   ```
2. Modify files inside `src/`.
3. Rebuild the standalone zero-dependency distribution:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\tools\build-standalone.ps1
   ```

---

## 📄 License

BATDOC is distributed under the [MIT License](LICENSE). Feel free to use, modify, distribute, and contribute.
