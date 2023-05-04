pinmenote-extension - pre-alpha
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

#### Shadow root  
Open shadow root is not always displayed or parsed correctly - but at least it matches mht quality or sometimes it's better.

#### Youtube
Youtube use polymer dom with ```<!--css-build:shady-->```. 
It is some polymer polyfil for shadow root that messes with css. 

### Limitations
- Sometimes what you see / saw is what you saved 
  - some websites offload content not displayed on page - ex. using shadow dom
  - the same condition applies to websites that don't load images until you scroll to them
- Not downloading svg icons from css files - to limit number of requests
