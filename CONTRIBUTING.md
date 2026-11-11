# Contributing to BATDOC ⚡

Thank you for your interest in contributing to **BATDOC**! We welcome contributions from developers, designers, and battery enthusiasts worldwide.

Our mission is to provide an accessible, 100% truth-grounded, zero-dependency battery intelligence tool for everyday laptop users.

---

## 📜 Core Guiding Principles

Before contributing code, please keep these core tenets in mind:

1. **Zero Hallucination / 100% Truth Grounding:**  
   Every metric, calculation, or recommendation shown to the user must be strictly traceable to physical hardware data in Microsoft's `powercfg /batteryreport`. We never invent, fake, or simulate metrics when sensors omit data.
2. **Zero External Dependencies / 100% Offline:**  
   BATDOC must remain usable completely offline on a computer without an internet connection. Do not introduce CDN links or heavy runtime dependencies that require network access.
3. **Non-Technical Usability First:**  
   BATDOC is built for ordinary human beings—students, office workers, non-programmers. Language must remain conversational, clean, and free of unnecessary engineering jargon.

---

## 🛠️ Development Workflow

BATDOC is built using standard, modular web technologies (JavaScript, HTML5, CSS3, native SVG).

### Project Layout
* `src/parser.js`: Parses Microsoft's HTML tables into clean JavaScript objects.
* `src/analytics.js`: Mathematical intelligence and metric derivations.
* `src/charts.js`: Offline SVG vector charting code.
* `src/formatters.js`: Human-friendly date and duration translation engine.
* `src/icons.js`: Crisp vector SVG icons (zero emoji encoding bugs).
* `src/ui.js`: DOM dashboard rendering.
* `src/styles.css`: Design system and CSS custom properties.

### Making Changes
1. Fork and clone the repository:
   ```bash
   git clone https://github.com/your-username/batdoc.git
   cd batdoc
   ```
2. Make your edits inside `src/`.
3. Test your changes:
   ```bash
   node ./tools/test-bundle.js
   ```
4. Rebuild the standalone distribution:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\tools\build-standalone.ps1
   ```
5. Verify `batdoc-standalone.html` renders cleanly.

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
