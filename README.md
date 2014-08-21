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

##### Creating a widget

The `config/environment.js` file names every widget in the CMS. Each widget is organized into a `controlType` and a `controlTypeGroup`. Below is an example of the `number` widget:

```
{
  name     : 'Number',       // display name for widget
  widget   : 'number',       // id for widget
  iconClass: 'icon-list-ol', // icon for CMS button
  valueType: null            // 'object' is the only supported non-null value type
}
```

The `widget` field determines the proper template and code to execute in the CMS. If the value you are going to store is not a string or number, you must use the 'object' valueType. There are three templates for each widget all located in the `app/templates/widgets` directory.

`app/templates/widgets/_number.hbs` is the template used for data entry on in the form.

`app/templates/widgets/info/_number.hbs` is the template used to store extra metadata about the widget.

`app/templates/widgets/value/_number.hbs` is the template used to display the current widget value in CMS lists.

Validation is done in `app/utils/validators.js`.

Have a look at some of the current widgets to get an idea of how they work.

#### How to deploy changes to all webhook sites

You'll need a `.cloudstorage.key` in the root of webhook-cms.

Run the following commands.

* `grunt dist` - build the newest dist.
* `grunt deploy` - deploy to google.

Handlebar Helpers:

* resize-image: Accepts a width, height, a grow parameter. If grow is not specified, images will be resized to width/height but small images will not be filled in. If grow is set to true, small images will be filled into resize dimensions.
