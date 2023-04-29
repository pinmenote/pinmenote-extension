pinmenote-extension
---

### Description
Browser extension nobody wants and nobody needs.  

- offline first with p2p in mind

### Run
```bash
npm run dev
```

### Website
[https://pinmenote.com](https://pinmenote.com)

### Features
- select website area, add comment and draw on selected part
- save website / part of website as single page for offline use ( state of the art )
- capture image / map / canvas
- capture video time
- download table as csv
- add task, note to any website as well as standalone
- encrypt / decrypt messages
- html preview and board view
- add and manage tags of any content you saved
- add calendar event (repeat in progress)
- smart search using index of words (reverse index), dates, website addresses

### Known issues

#### Shadow root  
Open shadow root is not always displayed or parsed correctly - but at least it matches mht quality or sometimes it's better.

#### Youtube
Youtube use polymer dom with ```<!--css-build:shady-->```. 
It is some polymer polyfil for shadow root that messes with css. 

### Limitations

Not downloading svg icons from css files - to limit number of requests
