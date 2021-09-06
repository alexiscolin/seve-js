# 🌳 seve-js
Simple and light JS components manager

<!-- GETTING STARTED -->
## Getting Started

Made as an `App` class, initialize the component to use it. It will start components init phase.
All components are extended from a `Component` class and initialized when they are encontred in the DOM.
In addition to components, seve-js let you use `modules` that can be linked to components even if they are not instanciate from the DOM.

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/alexiscolin/seve-js.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
   
## Usage

Basic usage :

Add a component directly in your html
```html
<nav class="..." data-component="navigation" data-component-id="main">
    ...
</nav>
```
_Note: data-component-id is optional but recommended to target a very specific component (if muliple instances loaded)._

List all your components in a specific file
``` javascript
// components.js -> export here all your components
export {Header} from './components/header';
export {Navigation} from './components/navigation';
export {Slider} from './components/slider';
export {Scrollbar} from './components/scrollbar';
export {Cursor} from './components/cursor';
...
```
Create your app related to your components
``` javascript
// app.js -> export here all your components
import App from 'sevejs';
import * as components from './js/components';

const app = new App({components});
app.init(app)
...
```

Finaly, fill your components
``` javascript
import { Component } from 'sevejs';
const Navigation = class extends Component {
    constructor(opts) {
        super(opts);
        
        // GENERAL
        const {el} = this.DOM;
        this.events = {};
        this.mq;
        ...
    }

    init(opts) {
        this.mq = opts.mq;
        ...
    }
    
    resize (size, mq) {
        this.mq = mq; // update current mediaquery span
        ...
    }
    
    destroy () {
        ...
    }
```

## Components Methods
| Methods       | Description                                                                                                                                           | Arguments / return                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
|---------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `call`        | To call a method from another component.                                                                                                              | - `func` : *(string)* - method name that should be called. eg "openNav"<br> - `args` : *(array)* - array composed by the list of arguments needed by the func. eg ["homepage", true]<br> - `comp` : *(string)* - component name that will be called (becarefull of the uppercase if needed). eg "Navigation"<br> - `id` : *(string - optional)* - id of the component if there are multiple instances and it's not the first one. eg "Main"                         |
| `on`          | To create and save a DOM event (click, focus, scroll...) in order to facilitate its lifecycle across the component. All of them are remove at destroy | `event` : *(object)* - composed -> <br> - `event.e` - *(string)* event that is listened. eg "click"<br> - `event.target` - *(HTMLElement)* DOM element that must be targeted by the event. eg document<br> - `event.cb` - *(requestCallback)* callback function triggered at event (work well with binded function)<br> - `event.opts` - *(object)* options allowed in addEventListener method <br><br> `return` : return the event id in order to easily remove it |
| `off`         | To remove an event saved thanks to the `on` method.                                                                                                   | - `id` : *(number)* - id of the event to remove (returned by `on` method)<br> - `event` : *(object - optional)* - event that should be removed<br> - `byIndex` : *(boolean - optional / default false)* - Is the id param a _compEvents index (seve-js internal event)                                                                                                                                                                                              |
| `trigger`     | To publish an internal JS event (event emiter - pubsub pattern)                                                                                       | - `name`: *(string)* - function name you want to trigger. Then, every events having subscribed to that function will be fired. eg "scroll"<br> - `args`: *(args)* - list of arguments you want to share with subscribed functions. eg `5, "up"`                                                                                                                                                                                                                     |
| `subscribe`   | To subscribe / listen an internal event from the events bus (event emiter - pubsub pattern)                                                           | - `name`: *(string)* - function name you want to listen. eg "scroll"<br> - `func`: *(requestCallback)* - callback function that will be fired each time the listened event will be triggered. eg (scrollLevel, dir) => {...}                                                                                                                                                                                                                                        |
| `unsubscribe` | To unsubscribe the listener previously subscribed (event emiter - pubsub pattern)                                                                     | - `name`: *(string)* - function name you want to unsubscribe. eg "scroll"<br> - `func`: *(requestCallback)* - the call back function to remove. eg (scrollLevel, dir) => {...}                                                                                                                                                                                                                                                                                          |
| `init`        | Default init method (init at construction). Should be use to constructor replacement when init component                                              |                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `resize`      | Default resize method (init at construction). Should be use to constructor replacement when resize component                                          |                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `destroy`     | Default destroy method that is automatically called as component destroy                                                                              |                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

## Modules Methods
| Methods        | Description                                              | Arguments / return                                                                                                                                                                                                                                  |
|----------------|----------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `getComponent` | Method that retrieve a component from the component list | - `comp` : *(string)* - Name of the component you want retrieve. eg "Scroller"<br> - `id` : *(string - optional)* - The id of the component you want. If not set, the first entry will be returned. eg "Main". <br><br> - `return` - The component. |
