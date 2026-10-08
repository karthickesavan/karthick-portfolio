# Karthickesavan Portfolio — Supplied GLB Avatar Edition

This portfolio uses the supplied `assets/model.glb` as the interactive hero avatar.

## Avatar
- Three.js + GLTFLoader
- Supplied GLB model
- Embedded idle animation is played automatically
- Pointer-responsive head/body attention shift
- Existing portfolio lighting, HUD and responsive layout preserved

## Run locally
Use a local HTTP server because the browser loads the GLB as a module asset.

```bash
python3 -m http.server 5500
```

Then open `http://localhost:5500`.

## Files
- `index.html`
- `style.css`
- `script.js`
- `avatar.js`
- `assets/model.glb`
