
-- Create blog_posts table for publicly accessible blog content
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  author TEXT NOT NULL DEFAULT 'Reprompta',
  published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  meta_title TEXT,
  meta_description TEXT,
  tags TEXT[] DEFAULT '{}'::text[]
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can read published posts (no auth required for SEO)
CREATE POLICY "Anyone can view published posts"
  ON public.blog_posts
  FOR SELECT
  USING (published = true);

-- Trigger for updated_at
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed with 3 starter articles
INSERT INTO public.blog_posts (slug, title, excerpt, content, author, published, published_at, meta_title, meta_description, tags) VALUES
(
  'how-to-reverse-engineer-ai-image-prompts',
  'How to Reverse Engineer AI Image Prompts',
  'Learn the techniques behind recovering the exact prompt used to generate any AI image — from Midjourney to DALL·E and Stable Diffusion.',
  E'# How to Reverse Engineer AI Image Prompts\n\nEver seen a stunning AI-generated image and wondered exactly how it was made? Reverse engineering AI prompts is the art of analyzing an output to reconstruct the input that created it.\n\n## Why Reverse Engineer Prompts?\n\nUnderstanding the prompt behind an image helps you:\n- **Learn faster** — Instead of guessing, you see what actually works\n- **Build a prompt library** — Collect proven prompts for consistent results\n- **Understand model behavior** — Learn how different keywords affect output\n\n## The Manual Approach\n\nExperienced prompters can often guess the general structure by looking at:\n1. **Art style** — Photorealistic, anime, oil painting, watercolor\n2. **Composition** — Close-up, wide shot, bird''s eye view\n3. **Lighting** — Golden hour, studio lighting, dramatic shadows\n4. **Color palette** — Muted tones, vibrant, monochrome\n\nBut this is slow, imprecise, and requires deep expertise.\n\n## The Automated Approach\n\nTools like [Reprompta](/analyze) use AI vision models to analyze images and recover the full prompt, including:\n- The likely model used (Midjourney, DALL·E, Stable Diffusion)\n- Camera and rendering settings\n- Style tags and modifiers\n- A copy-ready prompt you can use immediately\n\n## Tips for Better Results\n\n- **Use high-resolution images** — More detail means more accurate analysis\n- **Crop to the subject** — Remove UI elements or watermarks\n- **Compare across models** — Different AI models interpret the same prompt differently\n\nReady to try it? [Upload an image to Reprompta](/analyze) and get the full prompt breakdown in seconds.',
  'Reprompta',
  true,
  now(),
  'How to Reverse Engineer AI Image Prompts | Reprompta',
  'Learn how to reverse engineer any AI-generated image prompt. Recover prompts from Midjourney, DALL·E, and Stable Diffusion images.',
  ARRAY['reverse engineering', 'AI prompts', 'midjourney', 'dall-e']
),
(
  'best-midjourney-prompt-formulas-2025',
  'The Best Midjourney Prompt Formulas for 2025',
  'Master the art of Midjourney prompting with these proven formulas that consistently produce stunning results.',
  E'# The Best Midjourney Prompt Formulas for 2025\n\nMidjourney has evolved dramatically, and so have the prompting techniques that get the best results. Here are the formulas that top creators use in 2025.\n\n## The Core Formula\n\n```\n[Subject] + [Style] + [Lighting] + [Composition] + [Parameters]\n```\n\nExample: *A weathered fisherman mending nets, oil painting style, golden hour lighting, medium shot --ar 16:9 --v 6*\n\n## Formula 1: Photorealistic Portraits\n\n```\nPortrait of [subject], [camera] lens, [lighting], [film stock], [mood]\n```\n\nExample: *Portrait of an elderly Japanese craftsman, 85mm lens, Rembrandt lighting, Kodak Portra 400, contemplative mood*\n\n## Formula 2: Concept Art Environments\n\n```\n[Environment type], [time of day], [atmosphere], concept art, [artist reference]\n```\n\nExample: *Floating sky islands above a crystal ocean, twilight, ethereal mist, concept art, in the style of Studio Ghibli*\n\n## Formula 3: Product Photography\n\n```\n[Product] on [surface], [background], studio lighting, commercial photography, 8K\n```\n\nExample: *Artisan coffee cup on marble surface, dark moody background, studio lighting, commercial photography, 8K*\n\n## Pro Tips\n\n- **Negative prompts matter** — Tell Midjourney what to avoid\n- **Aspect ratios change everything** — 16:9 for landscapes, 2:3 for portraits\n- **Version matters** — Always specify --v 6 for latest capabilities\n- **Study what works** — Use [Reprompta](/analyze) to reverse engineer prompts from images you admire\n\n## Building Your Prompt Library\n\nThe fastest way to improve is to analyze existing great outputs. Upload any AI image to [Reprompta](/analyze) to see the exact prompt structure, then adapt it for your own work.',
  'Reprompta',
  true,
  now() - interval '2 days',
  'Best Midjourney Prompt Formulas 2025 | Reprompta',
  'Master Midjourney prompting with proven formulas for photorealistic portraits, concept art, and product photography.',
  ARRAY['midjourney', 'prompt formulas', 'AI art', '2025']
),
(
  'ai-video-prompting-guide',
  'The Complete Guide to AI Video Prompting',
  'From Sora to Runway — learn how to write prompts that produce cinematic AI videos with consistent quality.',
  E'# The Complete Guide to AI Video Prompting\n\nAI video generation has arrived, and the prompting techniques differ significantly from image generation. Here''s everything you need to know.\n\n## How Video Prompts Differ from Image Prompts\n\nVideo prompts need to describe:\n- **Motion** — What moves and how\n- **Temporal flow** — Beginning, middle, and end states\n- **Camera movement** — Pan, zoom, orbit, tracking shot\n- **Consistency** — Maintaining subject identity across frames\n\n## The Video Prompt Formula\n\n```\n[Camera movement] of [subject] [action], [environment], [lighting], [style]\n```\n\nExample: *Slow dolly forward toward a lone astronaut walking across Mars, red dust swirling, golden hour, cinematic 4K*\n\n## Key Differences by Model\n\n### Sora\n- Excels at photorealism and complex camera work\n- Responds well to cinematic terminology\n- Best with detailed scene descriptions\n\n### Runway Gen-3\n- Strong at stylistic transformations\n- Good with reference images + text prompts\n- Better for shorter, focused clips\n\n### Kling\n- Great at human motion and facial expressions\n- Works well with simple, direct prompts\n- Good for character-focused content\n\n## Common Mistakes\n\n1. **Too many actions** — Keep it to one main action per clip\n2. **Ignoring physics** — Models struggle with complex physical interactions\n3. **No camera direction** — Always specify camera behavior\n4. **Vague descriptions** — Be specific about speed, direction, and scale\n\n## Analyzing Existing AI Videos\n\nJust like with images, you can reverse engineer video prompts. [Upload a video to Reprompta](/analyze) to recover the likely prompt, model, and settings used to create it.\n\n## Getting Started\n\nStart with simple prompts and add complexity gradually. The best video prompters iterate quickly — generate, analyze, refine, repeat.',
  'Reprompta',
  true,
  now() - interval '5 days',
  'AI Video Prompting Guide — Sora, Runway, Kling | Reprompta',
  'Complete guide to AI video prompting for Sora, Runway, and Kling. Learn motion, camera, and temporal prompting techniques.',
  ARRAY['AI video', 'sora', 'runway', 'video prompting']
);
