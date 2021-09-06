/**
 * @module components
 */
import { capitalize } from "./utils/capitalize";

/**
 * COMPONENTS OBJECT THAT IS EXTENDED BY ALL COMPONENTS
 * @class Component
 * @see {Component}
 * @param {map} components - list of all other components
 */
const Component = class {
  constructor(scope) {
    this.DOM = { el: scope };
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

  _compResize(event) {
    this.resize(event);
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
      index -= 1;
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
    if (args && !comp) {
      comp = args;
      args = false;
    }

    comp = capitalize(comp);
    // check if component, then function exist before a call
    if (this.components.has(comp)) {
      id = id || this.components.get(comp).entries().next().value[0];
      const component = this.components.get(comp).get(id);
      if (component?.[func]) {
        args = Array.isArray(args) ? args : [args];
        component[func](...args);
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
    const { e, target, cb, opts = false } = event;
    target.addEventListener(e, cb, opts);

    // save and return
    this._compEvents.push(Object.assign(event, { id: this.componentsId }));
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
    if (!event) {
      // get saved event
      for (let i = 0; i < this._compEvents.length; i++) {
        if (this._compEvents[i].id === id) {
          event = this._compEvents[i];
          index = i;
          break;
        }
      }
    }

    // get the good id
    index = byIndex ? id : index;

    // remove the event
    const { e, target, cb, opts = false } = event;
    target.removeEventListener(e, cb, opts);
    this._compEvents.splice(index, 1);
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
};

//TODO: -> static function (need babel plugin) - proto shared between all instances
Component.prototype.emitter = {};
Component.prototype.trigger = function (name, ...args) {
  if (!!Component.prototype.emitter[name] === false) return;
  Component.prototype.emitter[name].forEach((func) => {
    func(...args);
  });
};

Component.prototype.subscribe = function (name, func) {
  if (!!Component.prototype.emitter[name] === false) {
    Component.prototype.emitter[name] = [];
  }
  Component.prototype.emitter[name].push(func);
};

Component.prototype.unsubscribe = function (name, func) {
  let funcs = Component.prototype.emitter[name];
  if (!!funcs === false) return;

  const funcIndex = funcs.indexOf(func);
  funcs.splice(funcIndex);
};

export default Component