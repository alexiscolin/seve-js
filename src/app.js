/**
 * @module app
 */
import Component from "./component";
import Module from "./module";
import { capitalize } from "./utils/capitalize";
import { debounce } from "./utils/debounce";
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
  constructor(opts) {
    this.app;
    this.components = opts.components || [];
    this.activeComponents = new Map();
    this.newComponents = new Map();
    this.componentsId = 0;

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
  init(app, scope) {
    // 1- lister tous les components sur la page
    // 2- si un components existe en js, enregistrer le components dans la liste des actifs
    // 3- give an access to all component to each of them
    // 4- initialiser les components -> A REPLACER EN DEHORS DE LA 1ER LOOP APRES RECUP ALL COMPONENTS DEDANS

    // add global app in components
    if (app && !this.app) {
      this.app = app;
    }
    this.activeComponents.set("App", new Map([["global", this.app]]));

    // check compoonents in DOM
    const dom = scope || document;
    const elements = [...dom.querySelectorAll("[data-component]")]; //must be capitalized

    // activate components
    elements.forEach((comp) => {
      let name = comp.dataset.component;
      name = this.components[capitalize(name)]
        ? capitalize(name)
        : this.components[name]
        ? capitalize(name)
        : "";

      // check validation (empty means no component have been found - caps or not)
      if (name !== "") {
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
        if (this.activeComponents.has(name)) {
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
      if (this.newComponents.has(`${capitalize(name)}-${id}`)) {
        const opts = {};
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
  _listAllComponents(func) {
    this.activeComponents.forEach((comp, name) =>
      comp.forEach((instance, id) => {
        if (capitalize(name) !== "App") func(instance, name, id);
      })
    );
  }

  /**
   * Update app component system
   * @method
   * @param {object} scope - Scope that will be parsed in update
   * @returns {void} - Nothing
   */
  update(scope) {
    // 1- refaire un init avec les components du new scope
    // 2- init les components de la nouvelle page
    // 3- refraichir la liste des components à l'interieur des components actifs (acien (hors scope) et nouveau)

    // init new scoped components
    this.init(this.app, scope);

    // refresh component list inside components components
    this._listAllComponents((instance) =>
      instance._compUpdate(this.activeComponents)
    );
  }

  /**
   * Get the current mediaquery span
   * @readonly
   * @return {object} - an object composed of the windows sizes and the current mediaquery at screen
   * @see windowSizeInfos
   */
  get windowSizeInfos() {
    const windowSizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    return { windowSizes };
  }

  /**
   * Resize app component system
   * @private
   * @returns {void} - Nothing
   */
  _resize() {
    // function called on resize event
    const resizeComponents = () => {
      this._listAllComponents((instance) => {
        const { windowSizes } = this.windowSizeInfos;
        instance._compResize(windowSizes);
      });
    };

    // to remove, general scoped debouncedFn to destroy event from destroy method
    this._globalEventsFuncs.resize ??= debounce(resizeComponents, 350);

    // listener
    window.addEventListener("resize", this._globalEventsFuncs.resize);
  }

  /**
   * Destroy component app system
   * @method
   * @param {object} [scope] - destroy scoped component or global
   * @returns {void}
   */
  destroy(scope) {
    // destroy scoped instance
    if (scope) {
      const elements = [...scope.querySelectorAll("[data-component]")];

      elements.forEach((comp) => {
        const name = capitalize(comp.dataset.component);
        const id = comp.dataset.componentId;

        // Check if component has been initialized
        if (this.activeComponents.has(name)) {
          const component = this.activeComponents.get(name);
          const instance = component.get(id);

          instance._compDestroy();
          component.delete(id);

          // remove component map from the app if all instace has been deleted
          if (component.size <= 0) {
            this.activeComponents.delete(name);
          }
        }
      });

      // destroy all instance and finally, the app itself
    } else {
      this.activeComponents.forEach((comp, name) => {
        if (capitalize(name) !== "App") {
          comp.forEach((instance) => instance._compDestroy());
        }
      });
      this.activeComponents.clear();

      // Remove global events : resize
      window.removeEventListener("resize", this._globalEventsFuncs.resize);
    }
  }
};

export {App, Component, Module}