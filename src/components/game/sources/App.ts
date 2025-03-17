import { App as Base } from '@base/game/sources/App';

export class App extends Base {
  protected static instance: App;

  constructor() {
    super();
  }

  public static get $instance(): App {
    if (!App.instance) {
      App.instance = new App();
    }

    return App.instance;
  }
}
