# How to create a website

A beginner's guide you can follow on Windows, even if you have never written code.

You will make a small page, add a working button, preview it, and put it online. Then you will learn where to make changes in the Brownie website.

If you only want to edit Brownie, start at Part 2. Keep your practice website in its own folder so you can experiment freely.

## Before you start

You need:

- A browser, such as the one you are using now.
- [Visual Studio Code](https://code.visualstudio.com/), an editor for writing and saving files.
- [Python](https://www.python.org/downloads/), for showing your website through a local web address. On Windows, enable the installer's option to add Python to PATH if it is offered. Reopen your terminal after installing.
- A GitHub account and a Vercel account when you reach the publishing steps.
- [Git for Windows](https://git-scm.com/downloads/win) if you want to use the Git commands in Part 4.

You can make the first page without creating an account. You do not need to buy a domain name to finish this guide.

## Part 1: Build your first page

### 1. Learn the three pieces

| Piece | What it does | Example |
| --- | --- | --- |
| HTML | Gives the page its content and structure | A heading, paragraph, or button |
| CSS | Changes how the page looks | Colors, spacing, and sizes |
| JavaScript | Makes the page respond | A button that counts clicks |

An editor changes the files. A browser reads those files and displays the page.

### 2. Make a practice folder

1. In your Documents folder, create a folder called `my-first-website`.
2. Open VS Code.
3. Choose File → Open Folder and select `my-first-website`.
4. In the Explorer panel on the left, choose New File and create these three files:

```text
my-first-website/
  index.html
  styles.css
  script.js
```

Use those exact names. A file called `index.html.txt` will not work as your HTML page.

### 3. Add the HTML

Open `index.html`, paste this code, and press Ctrl+S:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>My first website</title>
    <link rel="stylesheet" href="styles.css" />
    <script src="script.js" defer></script>
  </head>
  <body>
    <main>
      <h1>A little water, a little progress.</h1>
      <p>This is my first website. Try the button below.</p>
      <button id="sip-button" type="button">Add a sip</button>
      <p id="sip-count" role="status">Sips logged: 0</p>
    </main>
  </body>
</html>
```

`<h1>` is the main heading. `<p>` is a paragraph. The `link` line connects the CSS file, and the `script` line connects the JavaScript file. The viewport line helps the page fit a phone screen.

### 4. Add the CSS

Open `styles.css`, paste this code, and save:

```css
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 24px;
  background: #fefcf9;
  color: #131313;
  font-family: Arial, sans-serif;
  line-height: 1.5;
}

main {
  max-width: 600px;
  margin: 40px auto;
  padding: 24px;
  border: 1px solid #131313;
  border-radius: 16px;
  background: white;
}

button {
  padding: 12px 20px;
  min-height: 44px;
  border: 0;
  border-radius: 24px;
  background: #131313;
  color: white;
  font: inherit;
  cursor: pointer;
}

button:focus-visible {
  outline: 3px solid #25754a;
  outline-offset: 4px;
}
```

Try changing `background: #fefcf9` to `background: lightblue` later. That changes the page background.

### 5. Add the JavaScript

Open `script.js`, paste this code, and save:

```javascript
let sips = 0;
const button = document.getElementById('sip-button');
const count = document.getElementById('sip-count');

button.addEventListener('click', function () {
  sips = sips + 1;
  count.textContent = 'Sips logged: ' + sips;
});
```

The code finds the button and counter by their IDs. Every click adds one to `sips` and updates the paragraph. This practice counter starts at zero again when you refresh.

### 6. Open your website

In VS Code, choose Terminal → New Terminal. A terminal lets you type instructions for your computer. Make sure it opens inside `my-first-website`.

Check that Python is available:

```powershell
python --version
```

You should see a version number. Start the preview:

```powershell
python -m http.server 3000 --bind 127.0.0.1
```

Open http://127.0.0.1:3000 in your browser. You should see your heading, a card, and the Add a sip button. Click it three times: the counter should say `Sips logged: 3`.

This address works on your computer. Publishing in Part 3 gives you an address you can share with someone else.

Keep the terminal running while you use the preview. After each edit, save the file and refresh the browser. When finished, click the terminal and press Ctrl+C to stop the server.

### 7. Try three small changes

1. Change the heading in `index.html` to your own message.
2. Change the background color in `styles.css`.
3. Change the button text to `One more sip`.

Save and refresh after each change. If something breaks, press Ctrl+Z in the editor to undo your last edit, save, and refresh again.

## Part 2: Preview and edit the Brownie website

### 1. Open the existing project

Open this folder in VS Code:

```text
D:\Projects\Mobile Apps\Water Tracker
```

The Android app and website share this repository, which is a project folder tracked by Git. The browser website is inside `website/`.

### 2. Start the website preview

On Windows, double-click `scripts/windows/preview-website.bat` in the project folder, or run `npm run website:preview` from the repository root. It starts the preview and opens http://localhost:3000 in your browser. Keep its window open while you work. Press Ctrl+C in that window when you want to stop. Python must be installed first.

If you prefer using the terminal, follow the steps below instead.

Open a terminal in the project root and run:

```powershell
python -m http.server 3000 --bind 127.0.0.1 --directory website
```

If the practice server is still running, stop it with Ctrl+C first.

Open http://127.0.0.1:3000. To open About directly, use http://127.0.0.1:3000/about.html.

You can preview these pages without installing the mobile app dependencies. Python shows the pages and browser animations; it does not run the server-only download endpoint in `website/api/`.

### 3. Pick the right file

| What you want to change | File to open |
| --- | --- |
| Homepage words or sections | `website/index.html` |
| About page | `website/about.html` |
| Features, Support, or Download | The matching HTML file in `website/` |
| Colors, spacing, or phone layout | `website/styles.css` |
| Default Light appearance or theme button | `website/theme.js` |
| Swimming speed, play/pause, or drink demo | `website/script.js` |
| Swimming path and direction changes | `website/styles.css` |
| Images, icons, or prepared animations | `website/assets/` |

Start by changing one sentence on About. Save, refresh About in the browser, and check your result.

### 4. Understand the shared parts

Brownie starts in Light appearance. The appearance button cycles Light → Dark → System → Light. Your browser remembers your choice, so an earlier Dark choice can still open in Dark.

Brownie swims right, turns to face left, and swims back. The same water section appears above the black footer on all nine pages. The pause button also works on pages without mascot videos.

CSS and JavaScript files are shared. Each HTML page has its own copy of the navigation, closing section, and footer. If you change words or links in one of those shared areas, make the same change on all nine pages.

For more detail, read `website/README.md`.

## Part 3: Put a website online

GitHub stores your project files. Vercel hosts them so other people can visit your website. A deployment is a published version of those files.

### 1. Upload your practice website to GitHub

1. Sign in at https://github.com.
2. Create a new repository named `my-first-website`.
3. Choose Public if you want anyone to see its code, then create the repository.
4. Use the upload existing files link on the empty repository page. If files already exist, use Add file → Upload files.
5. Upload your `index.html`, `styles.css`, and `script.js` files together. They should appear at the top level of the repository.
6. Write a message such as `Create my first website` and choose Commit changes. A commit is a saved checkpoint with a message describing the change.

For Brownie, use the existing project repository or a fork you own. The `website` folder must keep its name and contents.

### 2. Connect Vercel

1. Sign in at https://vercel.com and connect your GitHub account.
2. Choose Add New → Project and import your repository.
3. Use the settings below, then choose Deploy.

| Setting | Practice website | Brownie repository |
| --- | --- | --- |
| Root Directory | `./` | `website` |
| Framework Preset | `Other` | `Other` |
| Build Command | Enable Override; leave empty | Enable Override; leave empty |
| Output Directory | `.` | `.` |

These pages can be served directly, so there is no build command. A dot means the selected project's root folder. See [Vercel's build settings guide](https://vercel.com/docs/builds/configure-a-build).

When the deployment is ready, open its `.vercel.app` address and check your page. A new project gets its own address; it does not take over Brownie's existing address.

### 3. Publish later changes

For your practice project, upload changed files into the same locations on GitHub and commit them again. With the Vercel Git connection enabled, a push to the production branch triggers a new deployment. For this project, use `main` as the production branch.

If you need to check that setting, open Vercel's Settings → Environments → Production → Branch Tracking. Other branches normally get preview addresses where you can check changes before merging them into `main`. See [Vercel's production branch guide](https://vercel.com/docs/git#production-branch).

## Part 4: Save Brownie changes with Git

Use this section after you have installed Git and made a small edit in the existing project. Run these commands from `D:\Projects\Mobile Apps\Water Tracker`.

Check your branch and changed files:

```powershell
git branch --show-current
git status
git diff -- website/about.html
```

The first command should show `main` for the example below. If it shows another branch, check which branch the project owner wants you to use before continuing. `git diff` shows the exact lines you changed.

For an edit to About, save only that file into your commit:

```powershell
git add website/about.html
git commit -m "Clarify Brownie's About page" -m "Explain the project story in shorter sentences and keep the existing download links."
```

Use a message that describes your actual edit. The first `-m` gives the commit a short title; the second adds a longer description. For a different file, use its path instead of `website/about.html`.

A commit saves the change on your computer. When you are ready to send committed changes to your GitHub repository, run:

```powershell
git push origin main
```

Your account needs permission to write to that repository. If `main` requires a pull request, follow that repository's contribution process. A push can update the public website when Vercel is connected to that branch.

## Before sharing a change

- Open the pages you changed and check every link and button you touched.
- Make the browser narrow, around 390 pixels wide, and check for sideways scrolling or cut-off text.
- Use the Tab key to reach buttons and Enter or Space to activate them.
- For Brownie, check Light and Dark, both swimming directions, and the pause button.
- For Brownie, run `npm run lint` and `npm run typecheck` from the project root after its dependencies are installed with `npm install`.
- Review `git diff` before committing. Upload the files the site needs; keep passwords, tokens, and `.env` files private.

## If something does not work

| Problem | What to try |
| --- | --- |
| `python` is not recognized or opens the Microsoft Store | Install Python from python.org and reopen the terminal. If `py --version` works, use `py` instead of `python` in the preview commands. |
| The terminal says the address is already in use | Stop your earlier preview with Ctrl+C, or replace `3000` with `3001` and open the matching address. |
| The page lists folders instead of showing the website | Check your terminal's folder. Brownie's command needs `--directory website` from the project root. |
| An edit does not appear | Save with Ctrl+S, refresh, and check that you opened the right file and preview address. Try Ctrl+Shift+R for a full refresh. |
| The page has no styling | Check that the file is named `styles.css` and that the HTML link points to that name. |
| The practice button does nothing | Check the `script.js` filename and make sure the HTML IDs exactly match the IDs in JavaScript. |
| `/about` gives an error in the Python preview | Open `/about.html`. Vercel applies the shorter URLs on the hosted site. |
| Vercel tries to build the mobile app | Set the Brownie project's Root Directory to `website`, Framework to `Other`, and Build Command to an empty override. |
| Git asks who you are | Configure your Git name and email for this repository using GitHub's setup guide linked below, then retry the commit. |
| Git refuses a push or reports a conflict | Read the message and ask the project owner for help. Keep your local commit so your work remains saved. |

## Official help

- [MDN: create your first HTML page](https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Your_first_website/Creating_the_content)
- [Python: local HTTP server](https://docs.python.org/3/library/http.server.html#command-line-interface)
- [GitHub: upload files](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository)
- [GitHub: set up Git](https://docs.github.com/en/get-started/git-basics/set-up-git)
- [Vercel: configure a build](https://vercel.com/docs/builds/configure-a-build)
- [Vercel: Git deployments and production branches](https://vercel.com/docs/git)

The publishing instructions were checked against these sources on November 11, 2026. Dashboard labels can change; the official guides show the current settings.
