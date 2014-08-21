#### How to install for local dev

*You need a Webhook site to run Webhook CMS.*

The Webhook CMS is an ember project that can be run locally with grunt.

* Clone and navigate to the webhook-cms directory
* Run `npm install` for node dependencies
* Run `bower install` for front-end dependencies
* Look for `<meta name="siteName" content="test" />` in `app/index.html` and change `test` to your site name
* Run `grunt server` to load, then visit localhost:8000

#### Developing Webhook CMS

Webhook CMS was originally based on [Ember App Kit](https://github.com/stefanpenner/ember-app-kit) which has been deprecated in favor of [Ember CLI](http://www.ember-cli.com/). It uses an ES6 Module Transpiler which allows for [ES6 module syntax](http://wiki.ecmascript.org/doku.php?id=harmony:modules#quick_examples).

The code for the Ember app is in the `app` directory.

##### Widgets

The `config/environment.js` file names every widget in the CMS. Each widget is organized into a `controlType` and a `controlTypeGroup`. Below is an example of the `number` widget:

```
{
  name     : 'Number',      // display name for widget
  widget   : 'number',      // id for widget
  iconClass: 'icon-list-ol' // icon for CMS button
}
```

The `widget` field determines the proper template and code to execute in the CMS.

#### How to deploy changes to all webhook sites

You'll need a `.cloudstorage.key` in the root of webhook-cms.

Run the following commands.

* `grunt dist` - build the newest dist.
* `grunt deploy` - deploy to google.

Handlebar Helpers:

* resize-image: Accepts a width, height, a grow parameter. If grow is not specified, images will be resized to width/height but small images will not be filled in. If grow is set to true, small images will be filled into resize dimensions.
