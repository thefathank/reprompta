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
];
