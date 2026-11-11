# Contributing to VoltLens ⚡

Thank you for your interest in contributing to **VoltLens**! We welcome contributions from developers, designers, and battery enthusiasts worldwide.

Our mission is to provide an accessible, 100% truth-grounded, zero-dependency battery intelligence tool for everyday laptop users.

---

## 📜 Core Guiding Principles

Before contributing code, please keep these core tenets in mind:

1. **Zero Hallucination / 100% Truth Grounding:**  
   Every metric, calculation, or recommendation shown to the user must be strictly traceable to physical hardware data in Microsoft's `powercfg /batteryreport`. We never invent, fake, or simulate metrics when sensors omit data.
2. **Zero External Dependencies / 100% Offline:**  
   VoltLens must remain usable completely offline on a computer without an internet connection. Do not introduce CDN links or heavy runtime dependencies that require network access.
3. **Non-Technical Usability First:**  
   VoltLens is built for ordinary human beings—students, office workers, non-programmers. Language must remain conversational, clean, and free of unnecessary engineering jargon.

---

## 🛠️ Development Workflow

VoltLens is built using standard, modular web technologies (JavaScript, HTML5, CSS3, native SVG).

### Project Layout
* `src/parser.js`: Parses Microsoft's HTML tables into clean JavaScript objects.
* `src/analytics.js`: Mathematical intelligence and metric derivations.
* `src/charts.js`: Offline SVG vector charting code.
* `src/ui.js`: DOM dashboard rendering.
* `src/styles.css`: Design system and CSS custom properties.

### Making Changes
1. Fork and clone the repository:
   ```bash
   git clone https://github.com/your-username/voltlens.git
   cd voltlens
   ```
2. Make your edits inside `src/`.
3. Test your changes by opening `index.html` in your browser and dropping `sample/battery-report.html`.
4. Rebuild the standalone distribution:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\tools\build-standalone.ps1
   ```
5. Verify `voltlens-standalone.html` renders identically.

---

## 💡 Ideas for Contributions

* **Manufacturer-Specific Power Profiles:** Add detected guidance for Asus Battery Health Charging, Lenovo Vantage, Dell Power Manager, Acer Care Center, and HP Battery Health Manager.
* **Expanded Translation / Localization:** Provide multi-language support for global non-English speakers.
* **Refined SVG Charts:** Add zoom/pan or expanded tooltip details on the degradation timeline.
* **Export Enhancements:** Additional formatting for exportable Used Laptop Health Certificates.

---

## 🤝 Submitting a Pull Request

1. Create a descriptive branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Commit your changes with clear, structured commit messages:
   ```bash
   git commit -m "feat(analytics): add support for multiple battery pack aggregation"
   ```
3. Push to your fork and submit a Pull Request to `main`.
4. Provide screenshots or sample reports demonstrating the change.

Thank you for helping empower laptop users worldwide!
