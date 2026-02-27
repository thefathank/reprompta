

## Plan

### 1. Mouse-following yellow glow on Auth page
- Track mouse position with `onMouseMove` on the outer container
- Render a large (`~400px`) radial gradient div positioned at the cursor coordinates using `motion.div` with smooth spring-based animation
- Use accent color (`hsl(45 100% 58%)`) at low opacity (~0.07) so it's soft and ambient
- `pointer-events-none` so it doesn't interfere with form interactions

### 2. Feature the recovered_prompt animation on Auth page
- Import the same `prompts` array and card animation from Index into Auth
- Add a cycling prompt card behind/beside the form — positioned absolutely, slightly offset and rotated
- Show a single active card that fades/swaps every ~4 seconds with a typewriter or fade transition
- Smaller scale than the homepage version — acts as a visual accent rather than a full feature block
- Include the `recovered_prompt` label and model/tag badges to reinforce what the product does

### Technical approach
- All changes in `src/pages/Auth.tsx` only
- Add `useState` for mouse position, `useEffect` for prompt cycling
- The glow div uses `style={{ left: mouseX, top: mouseY, transform: 'translate(-50%, -50%)' }}` with `motion.div` for smooth lag
- The prompt card sits in the background layer behind the form with reduced opacity

