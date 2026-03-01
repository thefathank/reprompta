export const modelInfo: Record<string, { description: string; url: string | null }> = {
  "Midjourney v6": { description: "Scene composition and stylistic control with powerful aesthetic tuning.", url: "https://www.midjourney.com" },
  "DALL·E 3": { description: "Photorealism with strong text understanding and prompt adherence.", url: "https://openai.com/dall-e-3" },
  "Stable Diffusion XL": { description: "Open-source model with fine-grained parameter control.", url: "https://stability.ai" },
  "Runway Gen-3": { description: "Cinematic video generation with camera and motion control.", url: "https://runwayml.com" },
  "Veo 3": { description: "Video generation with audio, slow-motion, and cinematic depth.", url: "https://deepmind.google/technologies/veo/" },
  "Nano Banana": { description: "Stylized and whimsical image generation. Community model.", url: null },
  "Sora": { description: "Long-take cinematic video with smooth camera movement.", url: "https://openai.com/sora" },
  "Flux 1.1 Pro": { description: "High-fidelity photography and extreme macro detail.", url: "https://blackforestlabs.ai" },
  "Ideogram 2.0": { description: "Typography-heavy design, posters, and text rendering.", url: "https://ideogram.ai" },
  "Firefly 3": { description: "Photorealistic composites with commercial-safe output.", url: "https://www.adobe.com/products/firefly.html" },
  "GPT-Image": { description: "OpenAI's native image generation with exceptional instruction following and text rendering.", url: "https://openai.com" },
  "Recraft V3": { description: "Design-focused generation excelling at vector art, icons, and brand assets.", url: "https://www.recraft.ai" },
  "Leonardo Phoenix": { description: "Versatile creative engine with strong character consistency and stylization.", url: "https://leonardo.ai" },
  "Kling 1.6": { description: "High-quality video generation with precise motion control from Kuaishou.", url: "https://klingai.com" },
  "Minimax Video-01": { description: "Fast video generation with expressive character animation.", url: "https://minimaxi.com" },
};

export const prompts = [
  // — Original prompts —
  {
    text: "A cyberpunk cityscape at dusk, neon reflections shimmering on wet pavement, volumetric fog rolling through narrow alleyways between towering megastructures. Holographic advertisements flicker in Japanese and Korean script. A lone figure in a translucent raincoat walks toward camera, backlit by magenta and cyan light spill from storefronts.",
    model: "Midjourney v6",
    tags: ["--ar 16:9", "--style raw"],
  },
  {
    text: "Elderly woman's hands shaping clay on a potter's wheel, dramatic chiaroscuro lighting from a single overhead bulb. 35mm film grain with shallow depth of field. The clay is wet and glistening, capturing every wrinkle and callous on her fingers. Background dissolves into warm, dark tones reminiscent of Rembrandt's studio paintings.",
    model: "DALL·E 3",
    tags: ["1024×1024", "vivid"],
  },
  {
    text: "Isometric tiny world inside a glass terrarium sitting on a mahogany desk. Miniature waterfalls cascade between mossy rocks, bioluminescent plants glow in soft teal and violet hues. A tiny wooden cabin with warm light pouring from its windows sits beside a crystal-clear pond. Fireflies drift lazily through the humid air inside the sealed globe.",
    model: "Stable Diffusion XL",
    tags: ["--steps 30", "--cfg 7.5"],
  },
  {
    text: "Abandoned brutalist library overgrown with cascading vines and wild ferns. Golden hour light streams through broken skylights, casting long geometric shadows across rows of crumbling concrete bookshelves. Dust motes float in the light beams. A grand spiral staircase in the center is wrapped in flowering wisteria, its purple blossoms carpeting the cracked marble floor below.",
    model: "Runway Gen-3",
    tags: ["16:9", "cinematic"],
  },
  {
    text: "A slow-motion tracking shot following a paper lantern as it drifts upward from a crowded night market in Chiang Mai. The camera tilts to reveal hundreds more lanterns rising into a star-filled sky, their warm amber glow reflected in the Ping River below. Street vendors pause to watch, steam curling from their stalls. The ambient soundscape blends distant Thai folk music with the crackle of flame and murmur of the crowd.",
    model: "Veo 3",
    tags: ["1080p", "slow-mo", "audio"],
  },
  {
    text: "A whimsical banana-shaped submarine exploring a coral reef made entirely of candy. Gummy fish swim past peppermint coral formations while a jellyfish made of translucent fruit leather pulses with soft pastel light. The submarine's porthole reveals a tiny monkey captain adjusting oversized brass goggles. Everything is rendered in a hyper-detailed claymation style with visible fingerprint textures on each element.",
    model: "Nano Banana",
    tags: ["1:1", "stylized"],
  },
  {
    text: "A single continuous take following a red balloon as it escapes a child's hand at a bustling Parisian flea market, drifts over rooftops of the Marais, and rises past the Eiffel Tower into a cotton-candy sunset. The camera spirals around the balloon as pigeons scatter and the city shrinks below. Golden hour light paints every zinc rooftop in amber and rose.",
    model: "Sora",
    tags: ["1080p", "long-take", "60fps"],
  },
  {
    text: "Hyperrealistic macro photograph of morning dew on a spider web stretched between two rusted iron fence posts. Each droplet acts as a tiny lens refracting the blurred garden behind it. A single ladybug clings to a silk thread, its shell glistening with moisture. Shot on medium format digital with extreme shallow depth of field, the bokeh dissolves into circles of soft emerald and gold.",
    model: "Flux 1.1 Pro",
    tags: ["--ar 4:5", "--raw"],
  },
  {
    text: "Retro travel poster for a fictional moon colony called 'Selene City.' Art deco typography announces 'Visit Selene — Where Earth Rises Every Morning.' A suited astronaut lounges in a mid-century modern chair on a lunar balcony, sipping coffee while gazing at a massive blue Earth hanging in a star-filled black sky. Muted pastels with bold geometric framing, grain texture, and vintage print registration marks.",
    model: "Ideogram 2.0",
    tags: ["poster", "typography", "1:1"],
  },
  {
    text: "Photorealistic aerial view of a bioluminescent bay at midnight, shot from a low-altitude drone. The water glows electric blue wherever waves break against the rocky shoreline. A lone kayaker leaves a trail of shimmering turquoise light behind their paddle strokes. The Milky Way stretches overhead, its reflection merging with the glowing plankton below, creating the illusion that the kayaker floats through stars.",
    model: "Firefly 3",
    tags: ["16:9", "photorealistic"],
  },
  {
    text: "A cozy Japanese kissaten (old-school coffee shop) interior rendered in warm analog tones. A porcelain cup of hand-dripped coffee sits on a lacquered wooden counter beside a folded newspaper. Sunlight filters through frosted glass, casting soft caustics across the counter. The barista, an elderly man in a crisp white shirt and bow tie, is mid-pour from a copper kettle. Every surface has visible texture — wood grain, ceramic glaze, fabric weave. Text on the menu board reads 'ブレンド ¥450' in chalk.",
    model: "GPT-Image",
    tags: ["1:1", "text-render", "photorealistic"],
  },
  {
    text: "A flat vector logo for a sustainable surf brand called 'Tidal.' The design features a minimalist wave that morphs into a leaf, using only two colors: deep ocean teal and sand beige. The wordmark sits below in a clean geometric sans-serif. Suitable for embroidery on apparel. Delivered on a transparent background with precise anchor points.",
    model: "Recraft V3",
    tags: ["1:1", "vector", "logo"],
  },
  {
    text: "A weathered explorer standing at the edge of a floating island, looking down at a sea of clouds below. Massive chain links anchor the island to unseen ground far beneath. The explorer wears layered leather and brass gear, their scarf whipping in the wind. Lush vegetation grows along the island's crumbling cliff edge, roots dangling into the void. Painterly fantasy style with rich golden-hour lighting and visible brushstroke texture.",
    model: "Leonardo Phoenix",
    tags: ["16:9", "fantasy", "painterly"],
  },
  {
    text: "A smooth dolly-in shot of a calico cat sitting on a windowsill during a thunderstorm. Lightning briefly illuminates the room, casting sharp shadows. The cat's ears twitch at the thunder. Rain streaks down the glass in the foreground, slightly blurring the city lights beyond. The interior is lit by the warm flicker of a single candle on a nearby bookshelf.",
    model: "Kling 1.6",
    tags: ["16:9", "cinematic", "5s"],
  },
  {
    text: "A cheerful cartoon fox barista performing latte art in a bustling forest café. The fox pours steamed milk with exaggerated flair, creating a perfect leaf pattern. Woodland creatures queue behind with tiny cups. The café is built inside a giant hollow oak tree with fairy lights strung across the branches. Smooth 2D animation style with expressive character movement and subtle ambient particles floating through shafts of light.",
    model: "Minimax Video-01",
    tags: ["16:9", "animation", "5s"],
  },

  // — Negative prompt best practice —
  {
    text: "Portrait of a Renaissance noblewoman in an ornate gilded frame, oil on canvas texture, soft diffused natural light from a tall arched window. She wears a deep burgundy velvet gown with pearl embroidery. Expression is serene but knowing. --no modern clothing, plastic, cartoon, anime, text, watermark, signature, blurry, deformed hands, extra fingers",
    model: "Midjourney v6",
    tags: ["--ar 3:4", "negative prompt", "portrait"],
  },

  // — Camera & lens specification —
  {
    text: "Street photography of Tokyo's Shibuya crossing during rush hour. Shot on a Leica M11 with a 35mm Summilux f/1.4 lens at ISO 800. Slight motion blur on the crowd, the lone still figure is a woman in a red coat holding a transparent umbrella. Overcast sky diffuses the light evenly. Kodak Portra 400 color science with lifted shadows and creamy skin tones.",
    model: "Flux 1.1 Pro",
    tags: ["--ar 3:2", "street", "lens spec"],
  },

  // — Weighted & structured prompt —
  {
    text: "(masterpiece, best quality:1.4), (intricate detail:1.2), a solitary lighthouse on a basalt cliff during a violent storm, (crashing waves:1.3), spray and foam caught mid-air, dark thunderclouds split by a single bolt of lightning illuminating the scene. The lighthouse beam cuts through horizontal rain. Muted palette of slate grey, deep navy, and flashes of electric white. (cinematic composition:1.1), rule of thirds, dramatic diagonal lines.",
    model: "Stable Diffusion XL",
    tags: ["--steps 40", "--cfg 8", "weighted"],
  },

  // — Multi-subject consistency —
  {
    text: "Two siblings — a teenage girl with short black hair and a younger boy with curly auburn hair — sit on opposite ends of a worn leather couch reading different books. The girl reads a thick fantasy novel; the boy holds a comic book. A grey tabby cat sleeps curled between them. Late afternoon sun slants through venetian blinds, casting striped shadows across the room. Warm domestic mood, shot at eye level with a 50mm equivalent lens.",
    model: "DALL·E 3",
    tags: ["1024×1024", "multi-subject", "consistency"],
  },

  // — Architecture & interior —
  {
    text: "Cross-section architectural illustration of a five-story mid-century modern apartment building, each floor revealing a different tenant's life: a musician's studio with instruments on the walls, a plant-filled greenhouse apartment, a minimalist Japanese-inspired flat, a chaotic artist's loft splattered with paint, and a rooftop garden with string lights. Isometric perspective, muted earth tones with pops of terracotta and sage green. Clean vector linework.",
    model: "Recraft V3",
    tags: ["1:1", "vector", "architecture"],
  },

  // — Food photography —
  {
    text: "Overhead flat-lay of a rustic Italian Sunday lunch spread on a weathered farmhouse table. Handmade tagliatelle with wild boar ragù in a terracotta bowl, a board of aged pecorino and honeycomb, torn ciabatta, a carafe of Chianti casting a ruby shadow, and scattered basil leaves. Natural light from camera-left with a subtle fill bounce. Shallow depth of field keeps the edges soft. Warm, earthy color grade with rich ochre and olive tones.",
    model: "Firefly 3",
    tags: ["1:1", "food", "photorealistic"],
  },

  // — Emotion-driven portrait —
  {
    text: "Close-up portrait of a boxer immediately after a match, sweat and adrenaline still visible. One eye is slightly swollen, a thin cut above the brow. Expression is not pain but quiet pride — a half-smile breaking through exhaustion. Shallow depth of field isolates the face against the blurred ropes and crowd. Single rim light from above picks out every bead of sweat. Desaturated tones except for the red of the gloves resting on the ropes below frame.",
    model: "GPT-Image",
    tags: ["--ar 4:5", "portrait", "emotion"],
  },

  // — Environment & mood board —
  {
    text: "Four-panel mood board for a Nordic noir thriller film. Panel 1: fog-draped fjord at dawn, near-monochrome blues. Panel 2: close-up of a detective's desk — coffee ring stains, scattered polaroids, a red pushpin on a map. Panel 3: rain-lashed window of a coastal cabin, warm interior light bleeding out. Panel 4: aerial shot of a lone car headlights on a winding mountain road at dusk. Unified cold teal-and-amber color grade across all panels. Each panel separated by thin white borders.",
    model: "Ideogram 2.0",
    tags: ["16:9", "mood board", "layout"],
  },

  // — Character turnaround sheet —
  {
    text: "Character design turnaround sheet for a post-apocalyptic courier: front view, 3/4 view, side view, and back view arranged left to right on a neutral grey background. The character wears a patched denim jacket over lightweight body armor, cargo pants with visible repair stitching, and custom-built boots with metal shin guards. A messenger bag covered in hand-sewn patches hangs at the hip. Hair is tied back with a bandana. Consistent proportions and lighting across all four views. Clean linework with flat cel-shading.",
    model: "Leonardo Phoenix",
    tags: ["16:9", "character sheet", "concept art"],
  },

  // — Cinematic camera movement —
  {
    text: "A 10-second steadicam shot pushing through a dense bamboo forest. Camera begins at ground level looking up through the canopy, then slowly lowers and pushes forward along a narrow dirt path. Shafts of late-afternoon light pierce the canopy in volumetric god rays. A light breeze causes the bamboo stalks to sway and creak. The path opens into a clearing where a small stone shrine covered in moss sits beneath a single cherry blossom tree in full bloom, petals drifting slowly.",
    model: "Veo 3",
    tags: ["1080p", "steadicam", "10s"],
  },

  // — Product photography —
  {
    text: "Commercial product shot of a matte black ceramic pour-over coffee dripper suspended mid-air with a stream of golden coffee pouring into a clear double-walled glass below. A few coffee beans float frozen in the air around the dripper. Background is a soft warm gradient from cream to light caramel. Studio lighting: large softbox camera-left for key light, small kicker behind-right for rim. No text, no branding — focus entirely on form and material.",
    model: "Flux 1.1 Pro",
    tags: ["--ar 4:5", "product", "commercial"],
  },

  // — Historical scene reconstruction —
  {
    text: "A bustling 1920s Harlem jazz club interior at midnight. Musicians on a small raised stage — a trumpet player with eyes closed mid-solo, an upright bassist, a pianist leaning into the keys. Smoke curls from ashtrays on small round tables where couples in period-accurate evening wear lean close to talk over the music. Art deco wall sconces cast warm amber light. A beaded curtain separates the main room from a back hallway. The energy is alive but intimate, captured in a warm tungsten color palette with deep shadows.",
    model: "DALL·E 3",
    tags: ["16:9", "historical", "vivid"],
  },

  // — Abstract & conceptual —
  {
    text: "Visual metaphor for the passage of time: a grand piano dissolving from left to right into a flock of starlings that swirl upward into a twilight sky. The leftmost keys are solid and glossy black, the middle section fractures into geometric shards, and the right side has fully transformed into hundreds of birds in murmuration. The background transitions from a warm interior amber on the left to cool dusk violet on the right. Painterly realism with visible impasto texture.",
    model: "Midjourney v6",
    tags: ["--ar 21:9", "conceptual", "--stylize 750"],
  },

  // — UI/UX mockup —
  {
    text: "Clean UI mockup of a meditation app displayed on an iPhone 15 Pro. The screen shows a 'Daily Calm' session with a circular breathing animation at center — concentric rings pulsing in soft lavender and sage. Below is a minimal timeline scrubber and a 'Begin Session' button in muted forest green. The phone sits on a linen surface beside a small succulent. Top status bar reads 7:22 AM. Dark mode interface with OLED-true blacks and whisper-thin typography.",
    model: "GPT-Image",
    tags: ["9:16", "UI mockup", "text-render"],
  },

  // — Texture & material study —
  {
    text: "Extreme close-up texture study: the bark of a 500-year-old cork oak tree after recent harvesting. The exposed inner bark is a vivid salmon-orange, still damp with sap, contrasting against the rough grey outer bark left intact above. A single ant traverses a deep fissure. Shot in raking late-afternoon sidelight that exaggerates every ridge and crevice. Medium format clarity with no digital sharpening artifacts. The image should feel tactile enough to reach into.",
    model: "Flux 1.1 Pro",
    tags: ["--ar 1:1", "--raw", "texture"],
  },

  // — Narrative sequence / storyboard —
  {
    text: "Three-panel storyboard sequence in a muted watercolor style. Panel 1: A child finds a rusted key half-buried in beach sand, waves lapping nearby. Panel 2: The child stands before an ancient wooden door set into a sea cliff, key in hand, wind tugging at their hair. Panel 3: The door is open, revealing a vast underground library lit by floating lantern-fish. Each panel has a thin charcoal border and a handwritten panel number in the top corner. Consistent character design across all three frames.",
    model: "Ideogram 2.0",
    tags: ["16:9", "storyboard", "sequential"],
  },

  // — Dynamic action with motion blur —
  {
    text: "A skateboarder mid-kickflip over a fire hydrant on a sun-bleached Los Angeles sidewalk. The board is frozen sharp while the skater's limbs show controlled motion blur conveying speed and rotation. Palm trees line the background in soft focus. Shot from a low worm's-eye angle with a wide 24mm lens, slight barrel distortion at the edges. Harsh midday California sun creates strong shadows and bleached highlights. Kodachrome color palette with punchy reds and teals.",
    model: "Firefly 3",
    tags: ["16:9", "action", "motion blur"],
  },

  // — Video with dialogue-style audio —
  {
    text: "A 5-second clip of an old clockmaker in his workshop carefully placing the final gear into a pocket watch. He holds it up to his ear, and we hear the first tick. A slow smile crosses his face. The camera is static, framed as a medium close-up. Workshop sounds: the ambient ticking of dozens of clocks on the walls, the soft clink of metal on metal, his quiet satisfied exhale. Warm tungsten lighting, shallow depth of field on his hands and the watch.",
    model: "Kling 1.6",
    tags: ["1:1", "cinematic", "5s"],
  },

  // — Style transfer / art reference —
  {
    text: "Reimagine the New York City skyline as if painted by Katsushika Hokusai in the ukiyo-e woodblock print tradition. The Brooklyn Bridge replaces the bridge in 'The Great Wave,' with stylized whitecap waves crashing against its stone pillars. Manhattan's skyscrapers are rendered as layered flat planes receding in atmospheric perspective. Mount Fuji is replaced by One World Trade Center in the background. Traditional indigo, grey, and off-white palette. Visible woodgrain texture throughout. Border with decorative cartouche containing the title in Japanese calligraphy.",
    model: "Midjourney v6",
    tags: ["--ar 3:2", "style transfer", "--stylize 500"],
  },

  // — Seamless pattern / tiling texture —
  {
    text: "Seamless repeating pattern tile for textile printing: scattered wildflowers — poppies, cornflowers, and Queen Anne's lace — on a warm cream background. Botanical illustration style with visible pencil underdrawing and transparent watercolor washes. No harsh edges where the tile repeats. The density is medium: enough white space to breathe but lush enough to feel abundant. Scale is designed for dress fabric, roughly 12 inches per repeat.",
    model: "Recraft V3",
    tags: ["1:1", "pattern", "textile"],
  },
];
