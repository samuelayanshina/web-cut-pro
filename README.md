# Web Cut Pro 🎬
### A Web-Native Non-Linear Video Editor Inspired by Apple Final Cut Pro

**Web Cut Pro** is an educational, production-grade web NLE designed to demonstrate and recreate the core mechanics and architecture of modern non-linear video editors, specifically Apple's **Final Cut Pro**.

---

## 🌟 Key Features & FCP Architectural Systems

### 1. The Magnetic Timeline (Signature FCP Feature)
- **Zero Accidental Gaps**: Primary storyline clips are stored on a gapless "Spine". Shortening, lengthening, or deleting any clip automatically closes or ripples downstream content.
- **Secondary Storylines & Connected Clips**: B-Roll clips, titles, and sound effects sit in lanes (+1, -1) and are **anchored** to specific timestamps on a parent spine clip. Moving the parent moves all connected elements in unison.
- **Explicit Gap Clips (`Option+W`)**: Clean placeholders when you intentionally want blank time.
- **Magnetic Snapping (`N`)**: Snaps seamlessly to playhead and clip boundaries.
- **High-Precision Skimmer (`S`)**: Yellow skimmer bar previews frames at cursor position independently of the playhead.
- **Interactive Trimming (`T`)**: Drag clip edge brackets to ripple-trim in real-time.
- **Blade Tool (`B` / `Cmd+B`)**: Slices clips cleanly at playhead or mouse click with source in/out recalculation.

### 2. Multi-Layer Video Compositor & Shaders
- **HTML5 Canvas 2D/WebGL Engine**: Composites active spine clip, connected B-Roll, and Title layers.
- **Color Board / Color Grading**:
  - Exposure (-1.5 to +1.5 stops)
  - Contrast (50% to 200%)
  - Saturation (0% to 250%)
  - Temperature (Cool Blue to Warm Orange Kelvin)
  - Tint (Green to Magenta)
- **Transform & Compositing**:
  - Position X & Y, Scale (up to 300%), Rotation (-180° to 180°).
  - Opacity & Blend Modes (Screen, Multiply, Overlay, Lighten, Darken, Difference).
  - Effect Stacks: Vignette, Film Noir Monochrome, Lens Blur.
- **Titles & Lower Thirds**: Dynamic text overlays with typography styling, drop shadows, and stroke outlines.

### 3. Web Audio Engine & Dual VU Meters
- **Web Audio API**: Real-time gain control, stereo panning (L100% to R100%), and master mute.
- **Dual VU Level Meters**: Real-time animated peak meters beside the viewer with dB scale (0 to -60 dB) and red clipping indicator.

### 4. Apple FCPXML 1.10 Export & Import
- Generates 100% valid, standard Apple **FCPXML (`.fcpxml`)** files containing resources, formats, spine clips, and connected assets that can be imported directly into native Final Cut Pro on macOS!

### 5. Client-Side Video Rendering & Export
- Renders the composite timeline directly in the browser to WebM/MP4 with a real progress bar.

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Navigate to the project directory
cd /Users/user/.gemini/antigravity/scratch/web-cut-pro

# 2. Start the Vite development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 🌐 Deploying to Netlify (Free & Instant)

### Option 1: Drag-and-Drop Deploy (Zero setup)
1. Build the project:
   ```bash
   npm run build
   ```
2. Log in to [Netlify Drop](https://app.netlify.com/drop).
3. Drag and drop the `dist/` folder into Netlify. Your site is live!

### Option 2: Netlify CLI
```bash
npx netlify deploy --prod --dir=dist
```

### Option 3: Connect Git Repository
Push this folder to a GitHub/GitLab repository and connect it to Netlify. The included `netlify.toml` file will automatically configure the build command (`npm run build`) and publish directory (`dist`).

---

## ⌨️ Authentic Keyboard Shortcuts
- `Space`: Play / Pause timeline
- `J / K / L`: Reverse / Pause / Forward shuttle
- `A`: Select Tool
- `B`: Blade Tool
- `T`: Trim / Ripple Tool
- `H`: Hand Tool
- `Cmd + B`: Blade at playhead
- `Option + W`: Insert gap clip
- `N`: Toggle magnetic snapping
- `S`: Toggle skimmer preview
- `Delete / Backspace`: Delete selected clip (with automatic ripple)
- `Left / Right Arrow`: Step 1 frame
