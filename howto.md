# How to Add a New Article

Every time you want to publish a new read-up, you only do **two things**.
No HTML. No copying files. No touching the nav or footer.

---

## Step 1 — Add a folder and a content file

Inside the `read/` folder, create a new folder named after your article.
Use lowercase letters and hyphens only. Examples:

```
read/the-bread-of-life/
read/what-is-the-gospel/
read/grace-and-truth/
```

Inside that folder, create one file called `content.json`.
Copy the template below and fill it in.

---

## The content.json template

```json
{
  "title": "Your Title Here",
  "subtitle": "Optional short line under the title.",
  "type": "sermon",
  "date": "2026-07-20",
  "scripture": "John 6:35",
  "sections": [
    {
      "label": "I · Your First Section",
      "blocks": [
        {
          "type": "paragraph",
          "text": "Write your paragraph here. You can use <em>italic</em> or <strong>bold</strong>."
        },
        {
          "type": "verse",
          "style": "normal",
          "text": "\"The Scripture quote goes here.\"",
          "reference": "Book Chapter:Verse"
        }
      ]
    },
    {
      "label": "II · Your Second Section",
      "blocks": [
        {
          "type": "paragraph",
          "text": "More writing here."
        },
        {
          "type": "closing-line",
          "text": "A short memorable final line."
        }
      ]
    }
  ]
}
```

---

## Block types — what you can put inside any section

| Block type         | What it does                                              |
|--------------------|-----------------------------------------------------------|
| `paragraph`        | A regular paragraph of text                               |
| `verse`            | A Scripture quote with a reference                        |
| `declaration-intro`| The lead-in before a list of identity declarations        |
| `declarations`     | A list of "I am…" statements with verses                  |
| `closing-line`     | A short final line, centered and italicized               |

### Verse styles

A `verse` block has three style options:

| Style     | Appearance                        | Use it for                          |
|-----------|-----------------------------------|-------------------------------------|
| `normal`  | Gold left border                  | Regular Scripture reference         |
| `warning` | Red left border                   | A warning, judgment, or contrast    |
| `closing` | Navy top border, parchment bg     | The climactic or concluding verse   |

---

## Step 2 — Add one entry to registry.json

Open `registry.json` at the root of the site.
Add a new object to the array. Match the `slug` to the folder name you created.

```json
{
  "slug": "your-folder-name",
  "title": "Your Title Here",
  "type": "sermon",
  "date": "2026-07-20",
  "scripture": "John 6:35",
  "description": "One or two sentences summarising the article. This appears on the Read listing page and the homepage."
}
```

**Type options:** `sermon` · `study` · `devotional`

---

## That's it.

The article is now live at:
```
read/article.html?slug=your-folder-name
```

The Read listing page and the homepage Latest section will both pick it up automatically — no other files need to be touched.

---

## Quick checklist

- [ ] Created `read/your-folder-name/` folder
- [ ] Created `content.json` inside it
- [ ] Filled in title, subtitle, type, date, scripture, and sections
- [ ] Added one entry to `registry.json`
- [ ] Slug in `registry.json` matches the folder name exactly

---

## File structure at a glance

```
gospel-story/
├── index.html               ← Homepage (don't touch)
├── registry.json            ← Master list — add one entry per article
├── read/
│   ├── index.html           ← Listing page (don't touch)
│   ├── article.html         ← Universal shell (don't touch)
│   ├── yes-he-did-say/
│   │   └── content.json     ← The article content
│   └── your-new-article/
│       └── content.json     ← Your new article content
```
