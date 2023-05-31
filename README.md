pinmenote-extension - alpha
---

### Description
Browser extension

- offline first with p2p in mind

### Run
```bash
npm run dev
```

### Website
[https://pinmenote.com](https://pinmenote.com)

### Features Summary
- select website area, add comment and draw on selected part
- save website / part of website as single page for offline use
- capture image / map / canvas
- capture video time
- download table as csv
- add / manage note to any website or without website
- encrypt / decrypt messages
- html preview and board view
- add and manage tags of any content you saved
- automatic reverse index of saved content
- smart search using levenshtein distance, dates, website addresses

### In progress
- add / manage calendar event (repeat in progress)
- add / manage task

### Known issues

#### Canvas
When `preserveDrawingBuffer` is set to false, we save 1x1 empty image because problems with access to drawing buffer.
see [https://stackoverflow.com/a/27747016](https://stackoverflow.com/a/27747016)
```
can.getContext("webgl2", { preserveDrawingBuffer: true })
```

#### Shadow root  
Open shadow root is not always displayed or parsed correctly - but at least it matches mht quality, and sometimes it's better.  
Saving fragment / adding pin to shadow root is not working right now.

#### Youtube
youtube somehow breaks layout (fixed with skip problematic elements that don't affect visual) 

### Limitations
- Sometimes what you see / saw is what you saved 
  - some websites offload content not displayed on page - ex. using shadow dom
  - the same condition applies to websites that don't load images until you scroll to them
- Not downloading svg icons from css files - to limit number of requests
