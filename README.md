pinmenote-extension
---

### Description
Browser extension nobody wants and nobody needs

- offline first with p2p in mind

### Run
```bash
npm run dev
```

### Website
[https://pinmenote.com](https://pinmenote.com) - subscribe to premium to move project further

### Known issues

#### Shadow root  
Open shadow root is not always displayed or parsed correctly - but at least it matches mht quality.

#### Youtube
Youtube use polymer dom with ```<!--css-build:shady-->```. 
It is some polymer polyfil for shadow root that messes with css. 

#### Twitter
Use style ```transform: translateY(4620.5px); position: absolute;``` for single tweets 
(todo remove those style attributes from tweet when saving element)