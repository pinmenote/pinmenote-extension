pinmenote-extension
---

### Description
Browser extension nobody wants and nobody needs.    
Thank You life for opportunity to make it.  
Thank you people for not using it.  
Hope you will not start using this software, if you started using this software - please stop.  
If you want to make PR because you believe you found bug, don't do it, fork this repository and make your own product, let people use it and be happy.    
I didn't make this software, God did it so don't ask me questions how and why it works, ask God.     
God knows all the answers I know only answer to ultimate question.  
Answer to ultimate question is 42.  

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
