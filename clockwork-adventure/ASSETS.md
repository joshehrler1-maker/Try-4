# Asset registry
- dist/assets/approved-concept.png: original generated black-and-white Whisker/Luna concept approved in chat. Used on title screen. This is the approved direction, not a screenshot of implemented gameplay.
- dist/assets/three.module.js and three.core.js: Three.js 0.180.0, MIT, vendored locally for zero external runtime requests.
- dist/game.js: original procedural cel-shaded geometry and animation for Whisker, Luna, cat shopkeeper, clockwork beetles, village houses, trees, bells, gears, bridges, dungeon and guardian. Geometry is provisional and distinct from the finished concept art.
- Generated Web Audio tones: original simple feedback sounds; no copied soundtrack or voice assets.
- dist/assets/ink-cobblestone.png: original generated grayscale ink cobblestone texture, integrated onto village/forest/temple paths in both renderers. Generation brief: square tileable top-down pale rounded cobblestones, charcoal outlines, subtle stipple, vintage cartoon background, no characters/text/perspective. Built-in image generation used.
- dist/software-renderer.js: compatibility renderer for devices without WebGL; renders the same world and gameplay with reduced visual fidelity. WebGL remains the primary renderer.
