import Gallery from "./views/gallery/Gallery.js";
import Player from "./views/player/Player.js";
import App from "./views/App.js";

const RouterFactory = (() => {
  class Router {
    constructor() {
      this.root = document.getElementById("root");
      this.views = {
        app: new App(this),
        player: new Player(),
        gallery: new Gallery(),
      };
      this.element = null;
    }

    set_view(view) {
      this._update_view(view, this.root);
    }

    add_view(view) {
      this._update_view(view, this.root);
    }

    insert_view(id, view) {
      const element = document.getElementById(id);
      this._update_view(view, element);
    }

    clear_view(element) {
      element.innerHTML = "";
    }

    _update_view(view, element) {
      if (element) {
        this.clear_view(element);
        this.element = element;
        if (this.views.hasOwnProperty(view)) {
          this.request_new_view(this.views[view], element);
        }
      } else {
        console.error("Element is undefined");
      }
    }
    

    async request_new_view(view, targetElement) {
      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
          targetElement.innerHTML = xhr.responseText;
          view.set_page();
        }
      };
      xhr.open("GET", view.get_html_path(), true);
      xhr.send();
    }
  }

  let instance;

  return {
    getInstance: () => {
      if (!instance) {
        instance = new Router();
        instance.constructor = null;
      }
      return instance;
    },
  };
})();

export default RouterFactory;
