# Interactive Animation

  > 
    **Tools I used:**
    **[Claude · Opus 5.5](https://claude.ai/)** — Build the app
**[Higgsfield](https://go.heyjasonlee.com/higgsfield)**** **— Generate images and animations
**[Mobbin](https://mobbin.com/?referrer_workspace_id=9034324a-5d0f-4c61-a9b1-31b8a8fc56af)** — App design references
**[Expo Go](https://expo.dev/go)** — Test on your phone

  ## Build 1 — The Brownie app

  ![](attachment:c0fae2d4-d046-4aa7-a9fd-47329feec088:interactive-animation-build-1.png)
  *Water tracking and interactive drinks, built with code.*
  **Setup:** Connect Mobbin. Attach your character image and an app screen recording.

  ### Prompt

  `Plain Text
I want to build an app like Waterllama, but instead of a llama I want to use a capybara instead (image attached). Call it Brownie.

https://mobbin.com/apps/waterllama-ios-ba545461-e4a8-4ded-a166-cdd7c7a95be7/e3e26783-3d88-4153-8a02-6e4fa985bdd6/screens

Build the full onboarding pages and the home screen.

Watch my screen recording to understand the flow of pages and how each UI element animates. Create all motion graphics using code.

Mobbin MCP is connected so you can browse through all the pages of the app, but check my screen recording for all animation references.
  `
  The character movement was stiff in this version. Build 2 fixes it.
  ---

  ## Build 2 — Smoother character animations

  ![](attachment:808ecce9-6a7b-4997-bb73-90fbae78d3d5:interactive-animation-build-2.png)
  **Setup:** Connect [Higgsfield](https://go.heyjasonlee.com/higgsfield). Attach your character and recording; update the path and timestamps.

  ### Prompt

  `Plain Text
Create 3 different animations using Higgsfield MCP.

1. Capybara sitting and sipping from a glass of water (use Seedance 2.5).
2. Capybara leaping (reference video timestamp 00:41, use Genjutsu, follow the exact motion of the llama in the reference video).
3. Capybara swimming left to right, then right to left (reference video timestamp 00:46, use Genjutsu, follow the exact motion of the llama in the reference video).

Reference video: [PATH TO YOUR SCREEN RECORDING]
  `
  After you have the output from Higgsfield, put the animations into the app. Send in the same Claude project:
  `Plain Text
Okay, can you use the capybara videos we created in Higgsfield and replace and update the mockup.
  `
  Add any other changes you want to make and insert them in the same prompt. 
  ---

  ## Build 3 — The interactive pool

  ![](attachment:33d01159-23ef-47e7-971a-5b980d9ee387:interactive-animation-build-3.png)

  ### First, create the character image

  Generate three options, then trace your favourite into SVG. This prompt is reconstructed from the video:
  `Plain Text
Use Higgsfield MCP to create 3 flat-vector-style variations of my attached capybara relaxing on a pool float, seen from above.

Keep the same friendly character and bold outlines. Create one on a pink donut float, one on a watermelon float, and one on a blue donut float.

Show me the three options, then trace my chosen image into an SVG with a transparent background so I can use it in the app.
  `

  ### Prompt

  **Attach:** Character image + pool reference. Replace the app name.
  `Plain Text
Build the first screen of a mobile app with Expo (React Native) that I can test on my phone in Expo Go.
I've attached two images:
1. My character: a capybara lying on a donut float, seen from above (transparent background).
2. A swimming pool, as a reference for the look of the water.
THE TECH
- Expo with TypeScript. Use the SDK version that the current Expo Go app supports.
- react-native-reanimated for all animation. Read the tilt with useAnimatedSensor(SensorType.GRAVITY) and run the physics every frame on the UI thread with useFrameCallback.
- react-native-svg to draw the pool and the water in code.
- Use my character image exactly as attached. Don't redraw it.
- Lock the app to portrait.
THE SCENE
- The whole screen is a swimming pool seen from directly above, top to bottom. No deck, no ladder.
- Bright blue water that gets slightly deeper toward the bottom.
- Pool tiles: a grid of white grout lines that are slightly wobbly, as if seen through water.
- Soft lines of light on the water that drift slowly, like sunlight.
- The app name "[YOUR APP NAME]" painted on the pool floor in the middle of the screen: big, bold, faint dark blue, under the tiles and the light so the water sits on top of it.
- A soft shadow of the character on the pool floor, a little down and to the right.
- One "Get Started" button at the bottom: white, rounded, full width. No other text on screen.
THE ACTION (tilt)
- The character floats like a ball on water. Tilt the phone and it rolls downhill: tilt left and it goes left, tip the top of the phone away and it goes up the screen, tip it toward you and it goes down.
- Work out the tilt from the phone's angles (pitch and roll), not the raw sensor numbers. The raw numbers barely change when a phone is held upright, so up and down won't work.
- "Level" means however I'm holding the phone when the app opens, not flat on a table. Let level slowly follow my hand over about 10 seconds, so it re-levels by itself if I sit up or lie down.
- Ignore small hand wobble (about 3 degrees), then let the tilt ease in.
- With no tilt it stays exactly where it is. No automatic drifting or wandering. It only bobs gently in place.
- Water drag: it speeds up smoothly and coasts to a stop. Never instant.
- It bounces softly off all four edges and always stays fully on screen, clear of the status bar and the button.
- When it hits a wall hard, squash it very slightly against that wall (about 5%) and let it wobble back.
- As it moves it leans left or right a little, like a boat turning, up to about 30 degrees. It never spins or turns upside down. It rotates around the centre of the float, not the centre of the image.
- For testing on a computer: if I press and hold the water, it drifts toward my finger.
THE WATER EFFECTS
- Ripples only appear while the character is moving. None when it's still.
- Faster movement means more and stronger ripples, dropped just behind it.
- Make them look like water, not radar: slightly wobbly rings with a thin bright edge and a darker band just inside, spreading fast then slowing, fading as they grow.
- A thin white foam line around the float where it touches the water.
WHEN YOU'RE DONE
- Start the Expo dev server for Expo Go and tell me how to open it on my phone.
  `