# 🌳 seve-js
Simple and light JS components manager. Made for creative JamStack websites, it helps you to manage the components lifecycle across the app and facilitate communucation between them. perfect to work in a component style in addition to a router as BarbaJS.

<!-- ABOUT THE PROJECT -->
## About The Project

### Built With

* [JS ES6/7/8](https://www.ecma-international.org/technical-committees/tc39/)
* [Babel](https://babeljs.io/)
* [Webpack](https://webpack.js.org/)

<!-- GETTING STARTED -->
## Getting Started

Made as an `App` class, initialize the component to use it. It will start components init phase.
All components are extended from a `Component` class and initialized when they are encontred in the DOM.
In addition to components, seve-js let you use `modules` that can be linked to components even if they are not instanciate from the DOM.

### Prerequisites

This is an example of how to list things you need to use the software and how to install them.
* npm
  ```sh
  npm i sevejs@latest
  ```

* yarn
  ```sh
  yarn add sevejs
  ```

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
export { Header } from './components/header';
export { Navigation } from './components/navigation';
export { Slider } from './components/slider';
...
```
Create your app related to your components
``` javascript
// app.js -> export here all your components
import { App } from 'sevejs';
import * as components from './js/components';

const app = new App({ components });
app.init(app)
...
```

Finaly, fill and export your components
``` javascript
// navigation.js -> here is a nav component
import { Component } from 'sevejs';

const Navigation = class extends Component {
    constructor(opts) {
        super(opts); // "opts" arg from constructor to super is a mandatory to share components across the app
        
        // GENERAL
        const {el} = this.DOM; // DOM component element
        this.events = {}; // map of binded events
        ...
    }

    init() {
        // automatically called at start
        ...
    }
    
    resize (size) {
        // automatically called at start
        ...
    }
    
    destroy () {
        // destroy here all vars, related modules/packages or events
        ...
    }
}

export { Navigation };
```

## App Methods
Here are the list of methods made for App instance: those methods rules over all the components that are grouped in its inner map. They should be used for app lifecycle purpose in the routing control system of the app (eg related to BarbaJS or other dispatcher).

| Methods           | Description                                                                                | Arguments                                                                                                                                              |
|-------------------|--------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|
| `init`            | Init app component system                                                                  | - `app` : *(string)* - the app instance itself (recursive).  - `scope` : *(HTMLElement - optional)* - scope that will be parsed for composent checking |
| `update`          | Update app component system                                                                | - `scope` : *(HTMLElement)* - scope that will be parsed in update                                                                                      |
| `windowSizeInfos` | Getter function that returns window inner width and height                                 | `return` : *(object)* - return an object composed by window height and width                                                                           |
| `destroy`         | Destroy app system and all related components (not modules that should be removed manualy) | - `scope` : *(HTMLElement - optional)* - destroy all components from a specific DOM part or global if not specified.                                   |

<br>

## Components Methods
The following methods describe the functions you can use inside the components. They are made for simplify data sharing or link creation between components. they let you call for a method from another component, subscribe to a modification triggered in another (from a pubsub inner broker). They also simplify DOM event creation by managing their callbacks.
| Methods       | Description                                                                                                                                           | Arguments / return                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
|---------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `call`        | To call a method from another component.                                                                                                              | - `func` : *(string)* - method name that should be called. eg "openNav"<br> - `args` : *(array)* - array composed by the list of arguments needed by the func. eg ["homepage", true]<br> - `comp` : *(string)* - component name that will be called (becarefull of the uppercase if needed). eg "Navigation"<br> - `id` : *(string - optional)* - id of the component if there are multiple instances and it's not the first one. eg "Main"                         |
| `on`          | To create and save a DOM event (click, focus, scroll...) in order to facilitate its lifecycle across the component. All of them are remove at destroy | `event` : *(object)* - composed -> <br> - `event.e` - *(string)* event that is listened. eg "click"<br> - `event.target` - *(HTMLElement)* DOM element that must be targeted by the event. eg document<br> - `event.cb` - *(requestCallback)* callback function triggered at event (work well with binded function)<br> - `event.opts` - *(object)* options allowed in addEventListener method <br><br> `return` : return the event id in order to easily remove it |
| `off`         | To remove an event saved thanks to the `on` method.                                                                                                   | - `id` : *(number)* - id of the event to remove (returned by `on` method)<br> - `event` : *(object - optional)* - event that should be removed<br> - `byIndex` : *(boolean - optional / default false)* - Is the id param a _compEvents index ? (seve-js internal event)                                                                                                                                                                                              |
| `trigger`     | To publish an internal JS event (event emiter - pubsub pattern)                                                                                       | - `name`: *(string)* - function name you want to trigger. Then, every events having subscribed to that function will be fired. eg "scroll"<br> - `args`: *(args)* - list of arguments you want to share with subscribed functions. eg `5, "up"`                                                                                                                                                                                                                     |
| `subscribe`   | To subscribe / listen an internal event from the events bus (event emiter - pubsub pattern)                                                           | - `name`: *(string)* - function name you want to listen. eg "scroll"<br> - `func`: *(requestCallback)* - callback function that will be fired each time the listened event will be triggered. eg (scrollLevel, dir) => {...}                                                                                                                                                                                                                                        |
| `unsubscribe` | To unsubscribe the listener previously subscribed (event emiter - pubsub pattern)                                                                     | - `name`: *(string)* - function name you want to unsubscribe. eg "scroll"<br> - `func`: *(requestCallback)* - the call back function to remove. eg (scrollLevel, dir) => {...}                                                                                                                                                                                                                                                                                          |
| `init`        | Default init method (init at construction). Should be use to constructor replacement when init component                                              |                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `resize`      | Default resize method (init at construction). Should be use to constructor replacement when resize component                                          |                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `destroy`     | Default destroy method that is automatically called as component destroy                                                                              |                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

<br>

## Modules Methods

Modules are directly instanciated in the component and are very coupled to them. They aim to split a very long component in many sub-modules. Their lifecycle should be managed manually. Also, they are not accessible from the App instance, so they can use components methods by calling them from the `getComponent` method bellow.

| Methods        | Description                                              | Arguments / return                                                                                                                                                                                                                                  |
|----------------|----------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `getComponent` | Method that retrieve a component from the component list | - `comp` : *(string)* - Name of the component you want retrieve. eg "Scroller"<br> - `id` : *(string - optional)* - The id of the component you want. If not set, the first entry will be returned. eg "Main". <br><br> `return` - The component. |

<br>


### Exemples :
#### folders architecture
Here is an exemple of what you can do to host your JamStack website folders with seve.js:

```bash
- index.js // import sevejs and components.js file here
- components.js // exports all components bellow
- components // folder that contains all components
  |- navigation.js
  |- header.js
  |- slider.js
  |- loader.js // Barba router (exemple)
  |- scroller.js
  |- 3D
    |- index.js // here is your component that imports listed following modules
    |- background-module.js
    |- animation-module.js
    |- [other-module].js
  |- [other-component].js
...
```

#### Create a DOM event and remove it.
```javascript
// `this.events` is an object made for listing all your DOM events in order to removing them easier later
const opts = {
    e: 'click', // listen for click event
    target: document.querySelector('.js-burger'), // on burger element
    cb: this._openMenu.bind(this), // and add this openMenu callback function (binded)
}
this.events.clickOnBurger = this.on(opts); // addEventListener

// Note that all events are automatically removed when the component is destroyed, but you can destoy them manually.
this.off(this.events.clickOnBurger, 'click');
```

#### Call a method from another component
```javascript
// Ask to Header component (the second one) to open/close the nav using its public method `toggleNav`. Data in brackets are the toggleNav arguments.
this.call('toggleNav', [2, true], 'Header', 'second'); 

// It works well without id if there are only one component (one Cursor here), or no arguments
this.call('disapear', 'Cursor'); 
```

#### SubPub between components
```javascript
// - SCROLLER COMPONENT

// add an event for scroll and then, inform the broker that a scroll happened. would be clever to throttle it.
const cb = e => {
    this.trigger('scroll', e); // publish event 
};

this.events.scroll = this.on({e: 'scroll',  target: window, cb: callback.bind(this)}); // see `on` exemple above
```

```javascript
// - FOO COMPONENT

// animation function will be fired each time `scroll` event is published
this.subscribe('scroll', this.animation); // action at scroll -> `animation` method

// later
this.unsubscribe('scroll', this.animation); // revoke listener from the broker.
```

#### Module creation

```javascript
// - SLIDER COMPONENT FILE

import { Component } from 'sevejs';
import SliderProgressBar from './slider-progressbar';

const Slider = class extends Component {
    constructor (opts) {
        super(opts);
        ...
    }

    init () {
        // give all components to the module
        this.ProgressBar = new SliderProgressBar(this.components); // this.components is automatically created by seve.js
        ...
    }

    ...

}
```

```javascript
// - SLIDER-PROGRESBAR MODULE FILE

import { Module } from 'sevejs';

export default class extends Module {
    constructor(opts) {
        super(opts);
         // get component and all thoses methods. Usefull to get parent the component.
        this.canvas = this.getComponent("Slider");
    }

    method1 () {}
    method2 () {}
    ...
}
```

<!-- ROADMAP -->
## Roadmap

- [ ] Add examples folder
- [ ] Generate jsdoc 
- [ ] Add subpub methods as static class functions


<!-- Websites using smooth-scrollr-->
## Who is Using
- [jaunebleu.co](https://jaunebleu.co/)

<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request



<!-- LICENSE -->
## License

Distributed under the MIT License. See [LICENCE FILE](https://github.com/alexiscolin/seve-js/blob/master/LICENSE) for more information.



<!-- CONTACT -->
## Contact

Alexis Colin - [linkedin](https://www.linkedin.com/in/alexiscolin/) - alexis@jaunebleu.co

Project Link: [https://github.com/alexiscolin/seve-js](https://github.com/alexiscolin/seve-js)


