pinmenote-extension
---

### Description
Browser extension nobody wants and nobody needs

- offline first with p2p in mind

### Run
```bash
npm run dev
```

### Known issues
linkedin - feed height - big space between elements 
- mht saves correctly (all data is present)
- comment line below fixes it
```css
.full-height {
    height: 100%!important;
}
```