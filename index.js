/**
 * @module app
 */
import cssVars from '../scss/export.scss';
import {capitalize} from 'Utils/capitalize';
import {debounce} from 'Utils/debounce';
/**
 * App classes that create a component system management around multiple mudule files ({@link Components.
 * @class
 * @param {array} opts.components - options object that must contain list of components
 * @example
 * import {App} from "./js/app";
 * import * as components from './js/components';
 * const app = new App({components});
 */
const App = class {
    constructor (opts) {
        this.app;
        this.components = opts.components || [];
        this.activeComponents = new Map();
        this.newComponents = new Map();
        this.componentsId = 0;


        // media queries
        this.CSS = {};
        if(typeof(cssVars) != "undefined") this.CSS = cssVars;
        this.CSS.breakpointMin ??= 0; // add 0
        this.CSS.breakpointSm = typeof this.CSS.breakpointSm !== 'undefined' ? parseInt(this.CSS.breakpointSm, 10) : 768;
        this.CSS.breakpointMd = typeof this.CSS.breakpointMd !== 'undefined' ? parseInt(this.CSS.breakpointMd, 10) : 1080;
        this.CSS.breakpointLg = typeof this.CSS.breakpointLg !== 'undefined' ? parseInt(this.CSS.breakpointLg, 10) : 1620;

        // global event vars & init 
        this._globalEventsFuncs = {};
        this._resize();
    }

    /**
     * Init app component system
     * @method
     * @param {object} app - app instance itself
     * @param {object} scope - scope that will be parsed for checking 
     * @returns {void} 
     */
    init (app, scope) {
        // add global app in components
        if (app && !this.app) {
            this.app = app;
        }
        this.activeComponents.set('App', new Map([['global', this.app]]));

        // check compoonents in DOM
        const dom = scope || document;
        const elements = [...dom.querySelectorAll('[data-component]')]; //must be capitalized

        // activate components
        elements.forEach(comp => {
            
            let name = comp.dataset.component;
            name = this.components[capitalize(name)] ? capitalize(name) : this.components[name] ? capitalize(name) : '';

            // check validation (empty means no component have been found - caps or not)
            if (name !== '') {
                const activeComponent = new this.components[name](comp);

                // if no id has been definied for a new instance, create a new one
                let id = comp.dataset.componentId;
                if (!id) {
                    this.componentsId++;
                    id = comp.dataset.componentId = `comp-${this.componentsId}`;
                }

                // list new components (newComponents keys : 'name-id')
                this.newComponents.set(`${name}-${id}`, activeComponent);

                // add component, then, component instance
                if(this.activeComponents.has(name)) {
                    this.activeComponents.get(name).set(id, activeComponent);
                } else {
                    this.activeComponents.set(name, new Map([[id, activeComponent]]));
                }
            } 
        });

        // init all components after having listed all components inside
        // -> tenter de loop autour des nouveaux pour ne pas reinit les anciens composants
        this._listAllComponents((instance, name, id) => {
            instance._compUpdate(this.activeComponents);

            // init new components only (newComponents keys : 'name-id')
            if(this.newComponents.has(`${capitalize(name)}-${id}`)) {
                const opts = {
                    mq: this.windowSizeInfos.mq // call at init
                }
                instance.init(opts);
            }
        }); 

        this.newComponents.clear();
    }

    /**
     * Loop over components
     * @private
     * @param {function} func - function to apply inside components
     * @returns {void} - Nothing
     */
    _listAllComponents (func) {
        this.activeComponents.forEach((comp, name) => comp.forEach((instance, id) => {
            if(capitalize(name) !== 'App') func(instance, name, id);
        })); 
    }

    /**
     * Update app component system
     * @method
     * @param {object} scope - Scope that will be parsed in update 
     * @returns {void} - Nothing
     */
    update (scope) {
        // 1- refaire un init avec les components du new scope
        // 2- init les components de la nouvelle page
        // 3- refraichir la liste des components à l'interieur des components actifs (acien (hors scope) et nouveau)

        // init new scoped components
        this.init(this.app, scope);

        // refresh component list inside components components
        this._listAllComponents(instance => instance._compUpdate(this.activeComponents));
    }

    /**
     * Get the current mediaquery span
     * @readonly
     * @return {object} - an object composed of the windows sizes and the current mediaquery at screen
     * @see windowSizeInfos 
     */
    get windowSizeInfos () {
        const windowSizes = {
            width: window.innerWidth,
            height: window.innerHeight
        };

        // get right mediaquery size span from scss 
        const size = Object.values(this.CSS).filter((mq) => windowSizes.width > mq).reduce((prevMq, mq) => mq > prevMq ? mq : prevMq); 
        let mq = null;
        for(const [key, value] of Object.entries(this.CSS)){
            if(parseInt(value,10) == size) mq = key;
        }

        return {windowSizes, mq};
    }

    /**
     * Resize app component system
     * @private
     * @returns {void} - Nothing
     */
    _resize () {
        // function called on resize event
        const resizeComponents = () => {
            this._listAllComponents((instance) => {
                const {windowSizes, mq } = this.windowSizeInfos;
                instance._compResize(windowSizes, mq);
            })
        }

        // to remove, general scoped debouncedFn to destroy event from destroy method
        this._globalEventsFuncs.resize ??= debounce(resizeComponents, 350);

        // listener
        window.addEventListener('resize', this._globalEventsFuncs.resize);
    }

    /**
     * Destroy component app system
     * @method
     * @param {object} scope - destroy scoped component or global
     * @returns {void} 
     */
    destroy (scope) {
        // destroy scoped instance
        if(scope) {
            const elements = [...scope.querySelectorAll('[data-component]')];

            elements.forEach(comp => {
                const name = capitalize(comp.dataset.component);
                const id = comp.dataset.componentId;

                // Check if component has been initialized
                if(this.activeComponents.has(name)) {
                    const component = this.activeComponents.get(name);
                    const instance = component.get(id);

                    instance._compDestroy();
                    component.delete(id);

                    // remove component map from the app if all instace has been deleted
                    if(component.size <= 0) {
                        this.activeComponents.delete(name)
                    }
                }
            })

        // destroy all instance and finally, the app itself
        } else {
            this.activeComponents.forEach((comp, name) => {
                if(capitalize(name) !== 'App') {
                    comp.forEach(instance => instance._compDestroy());
                }
            });
            this.activeComponents.clear();

            // Remove global events : resize
            window.removeEventListener('resize', this._globalEventsFuncs.resize);
        } 
    }
}

/**
 * COMPONENTS OBJECT THAT IS EXTENDED BY ALL COMPONENTS
 * @class Component
 * @see {Component}
 * @param {map} components - list of all other components
 */
const Component = class {
    constructor (scope){
        this.DOM = {el: scope};
        this._compEvents = [];
        this.componentsId = 0;
        this.components;
        this.app;
        this.binded = {}; //for saving binded function -> sub/pub (think about a snippet)
    }

    /**
     * Update component list from the app
     * @private
     * @param {object} components - component list 
     * @returns {void} - Nothing
     */
    _compUpdate(components) {
        this.components = components;
        this.app = this.components.get("App").get("global");
    }

    _compResize(event, mq){
        this.resize(event, mq); 
    }

    /**
     * Destroy extended content before to call simple destroy
     * @private
     * @returns {void} - Nothing
     */
    _compDestroy() {
        // destroy all events - since iteration is erasing itself -> start at the end (as usual)
        let index = this._compEvents.length;
        while (index > 0) {
            index -=1;
            this.off(index, this._compEvents[index], true);
        }

        // remove all binded functions
        this.binded = {};

        // then, call for inner component destroy method
        this.destroy();
    }

    
    /**
     * Call another component function
     * @see {call}
     * @param {string} func - function name that is called 
     * @param {*} args - list of arguments for the function
     * @param {string} comp - component name that will be called (becarefull of the uppercase if needed)
     * @param {string} [id] - id of the component if not first one
     * @returns {void} - Nothing
     * @example
     * this.call('openNav', ['homepage', true], 'Navigation', 'main');
     */
    call(func, args, comp, id) {

        // if function without arguments (but without id)
        if(args && !comp){
            comp = args;
            args = false;
        }
        
        comp = capitalize(comp);
        // check if component, then function exist before a call
        if(this.components.has(comp)) {
            id = id || this.components.get(comp).entries().next().value[0];
            const component = this.components.get(comp).get(id);
            if(component?.[func]) {
                args = Array.isArray(args) ? args : [args]
                component[func](...args)
            }
        }
    }

    /**
     * global symbol for event Callback.
     * @callback requestCallback
     */

    /**
     * method that create and save an event in order to facilitate its cyclelife accross the component 
     * @see {on}
     * @param {string} event.e - event that is listened
     * @param {HTMLElement} event.target - DOM element that must be targeted by the event
     * @param {requestCallback} event.cb - callback function triggered at event (work well with binded function)
     * @param {object} event.opts - options allowed in addEventListener method
     * @returns {number} - return the event id in order to easily remove it
     * @example
     * const cb = () => {
     *  console.log("Hello World!");
     * };
     * const eventId = this.on({e: 'click', target: document, cb, {once: true}})
     */
    on(event) {

        // get event attributes and create it
        const {e, target, cb, opts = false} = event;
        target.addEventListener(e, cb, opts);
        
        // save and return
        this._compEvents.push(Object.assign(event, {id: this.componentsId}));
        return this.componentsId++; // return ID (before ++ to start at 0)
    }

    /** 
     * method that remove an event in order to facilitate its cyclelife accross the component 
     * @see {off}
     * @param {number} id - Id of the event to remove (returned by addEvent method {@link Component})
     * @param {object} [event] - event that should be removed
     * @param {boolean} [byIndex = false] - Is the id param a _compEvents index
     * @returns {void} - Nothing
     * @example
     * this.off(eventId);
     */
    off(id, event, byIndex = false) {
        let index;
    
        // if no event fournished, find it
        if(!event) {
            // get saved event
            for(let i = 0; i < this._compEvents.length; i++) {
                if(this._compEvents[i].id === id) {
                    event = this._compEvents[i];
                    index = i;
                    break;
                }
            }
        } 

        // get the good id
        index = byIndex ? id : index;
    
        // remove the event
        const {e, target, cb, opts = false} = event;
        target.removeEventListener(e, cb, opts);
        this._compEvents.splice(index,1);

    }


    /**
     * Default init method (init at construction). Should be use to constructor replacement when init component
     * @returns {void} - Nothing
     */
    init() {}

    /**
     * Default resize method (init at construction). Should be use to constructor replacement when resize component
     * @returns {void} - Nothing
     */
    resize() {}

    /**
     * Default destroy method that is automatically called as component destroy
     * @returns {void} - Nothing
     */
    destroy() {}
} 

//TODO: -> static function (need babel plugin)
Component.prototype.emitter = {};
Component.prototype.trigger = function(name, args) {
    if(!!Component.prototype.emitter[name] === false) return;
    Component.prototype.emitter[name].forEach(func => {
        func(args)
    });
};

Component.prototype.subscribe = function(name, func) {
    if(!!Component.prototype.emitter[name] === false) {
        Component.prototype.emitter[name] = [];
    }
    Component.prototype.emitter[name].push(func);
};

Component.prototype.unsubscribe = function(name, func) {
    let funcs = Component.prototype.emitter[name];
    if(!!funcs === false) return;

    const funcIndex = funcs.indexOf(func);
    funcs.splice(funcIndex);
};


const Module = class {
    constructor (components) {
        this.components = components; 
    }

    /** 
     * Method that retrieve a component from the component list
     * @see {getComponent}
     * @param {string} comp - Name of the component you want retrieve {@link Component})
     * @param {string} [id] - The id of the component you want. If not set, the first entry will be returned
     * @returns {object} - The component
     * @example
     * this.getComponent("canvas", "main");
     */
    getComponent (comp, id) {
        // error function
        const _getComponent = (comp) => {
            const _component = this.components.get(comp);
            if (!_component) {
                throw `Component "${comp}" doesn't exist.`;
            } else {
                return _component;
            }
        }

        // get the component and throw error if needed
        try {
            const component = _getComponent(comp);
            return id ? component?.get(id) : component?.values().next().value;

        } catch (e) {
            console.error(e);
        }
    }
}

export {App, Component, Module}
