# FolioWeaver

**Every developer portfolio template makes you edit a config file. This one gives you a form.**

Run it locally, fill in your experience, pick a theme, hit export — you get a
clean Next.js + Tailwind project in your own repo. The editor doesn't come with
it.

---

## Why this exists

There are tens of thousands of portfolio templates on GitHub. Nearly all of them
work the same way: clone, open `src/portfolio.js` or `src/config.js`, and
hand-edit a deeply nested object until the site looks right. Get a comma wrong
and the build dies. Want to see what a change looks like? Save, wait, alt-tab.

FolioWeaver replaces that object with a UI. You get a live three-panel editor —
navigation on the left, forms in the middle, a real-time preview on the right —
and when you're happy, you eject. The export is a standalone Next.js project
with none of the editor in it. No account, no hosting, no lock-in. It's your
code from that point on.

## What's in the editor

- **Live preview.** The right panel is the actual portfolio, re-rendering as you
  type. Not an approximation of it.
- **20 themes**, defined as CSS-variable blocks in `src/app/globals.css` —
  Dracula, Cinder, Mictlán, Perestroika, Slasher, Miami Nights, Solarized Dark
  and more. Your visitors get a theme switcher too.
- **Layout drag-and-drop.** Move whole sections between the left and right
  columns and the preview reflows live.
- **An image cropper** for your avatar, so you don't have to pre-square it.
- **A date-range picker** built on Floating UI, with a "present" state for your
  current role.
- **A tag input with autosuggest** for skills and technologies, grouped by
  category.
- **Markdown for the About section**, rendered through remark.

## Quick start

Requires Node 20+.

```bash
git clone https://github.com/Terra-01/FolioWeaver.git
cd FolioWeaver
npm install
npm run dev
```

Then open **http://localhost:3000/edit**.

Fill in each tab, hit **Save Changes** as you go, and when you're done open
**Settings → Export** and click **Download Project ZIP**.

Unzip it, `npm install`, `npm run dev`, and you have your portfolio. Push it
anywhere — Vercel, Netlify, a static host, your own box.

## How it stores your content

There is no database. Everything you enter is written to markdown files with
YAML front matter under `src/content/` — `about.md`, `experience.md`,
`projects.md`, `skills.md`, `education.md`, `header.md`, `settings.md`. They are
plain text and you can edit them by hand if you'd rather.

The export copies those files, the presentational components, `public/`, and a
trimmed `package.json` into a ZIP. The editor UI, the write endpoints and the
export route itself stay behind.

## Run it locally, not on a server

**The editor is a local tool. Do not deploy `/edit` to a public host.**

`POST /api/update-content` and `POST /api/upload-file` write to the filesystem
and have no authentication, because they were built for a dev server on your own
machine where that is the correct design — the same model Keystatic, Tina and
Storybook use. They are deliberately excluded from the export, so a published
portfolio has no write endpoints at all. But if you deploy the *editor* to a
writable host, you are handing the internet a content-rewrite and file-upload
endpoint. On a read-only serverless host it fails differently: saving and
uploading will error, because the filesystem isn't writable.

Build locally, export, deploy the export.

## Known limitations

Worth knowing before you invest an evening in it:

- **Experience and education always sort by date**, newest first, in both the
  editor and the output. You can drag them, but the order is recomputed on the
  next render. Projects and skills *do* honour manual order. If you need
  chronology-defying ordering on your roles, this isn't the tool yet.
- **The published portfolio is client-rendered.** `src/app/page.tsx` is a client
  component, so the server HTML is a loading state. Fine for a link you share
  directly; not ideal if you care about how it looks to a crawler. There's no
  OpenGraph or Twitter card metadata beyond the title and description either.
- **Exported projects include Vercel Analytics.** `@vercel/analytics` is wired
  into the exported `layout.tsx`. It does nothing until you enable Analytics in
  a Vercel project, but it is in your bundle — remove the `<Analytics />` import
  if you don't want it.
- **No tests, no CI.** This is a one-person side project and it shows.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind v4 with the
typography plugin · Framer Motion · dnd-kit for drag-and-drop · Floating UI ·
react-image-crop · gray-matter and remark for the content pipeline · JSZip for
the export.

## Contributing

Issues and PRs welcome. Be aware there is no test suite and no CI, so please say
what you actually ran when you open a PR.

The one thing to know before touching the export: `src/app/api/download-zip/route.ts`
holds a hand-maintained allowlist of the files that go into a user's project,
plus a second hardcoded `package.json`. If you add a component that the public
portfolio renders, it has to go in that list, and any dependency it pulls in has
to go in that manifest — otherwise the export silently ships a project that
doesn't install.

## License

MIT. See [LICENSE](LICENSE).

The default avatar in `public/` is a generated placeholder and is covered by the
same licence. Anything you put in there afterwards is yours and your
responsibility.
