# Webhook Overview

This repository is for the Webhook CMS layer. There are several other repositories in Webhook's core.

* [webhook](https://github.com/webhook/webhook) - The Webhook command line tools.
* [webhook-generate](https://github.com/webhook/webhook-generate) - The local runserver for Webhook.
* [webhook-cms](https://github.com/webhook/webhook-cms) - The CMS layer and frotend GUI. A single page Ember app.
* [webhook-server-open](https://github.com/webhook/webhook-server-open) - The production server for serving and regenerating live Webhook sites.
* [webhook-images](https://github.com/webhook/webhook-images) - Image resizing for the Webhook frontend. For Google App Engine.

If you are interested in self-hosting Webhook, [check the instructions here](http://www.webhook.com/docs/self-host-webhook/).

## Webhook CMS

The Webhook CMS is the CMS layer of Webhook.com. Essentially it is a one-page Ember app based upon [Ember App Kit][1]. It uses an ES6 Module Transpiler which allows for [ES6 module syntax][2]. The code for the Ember app is in the `app` directory.

**The CMS provides two primary functions.**

* Inserting data into a [Firebase][3] location following this [format][4].
* Sending calls through websockets to the [local generator][5] and production server to rebuild your site.

## How to install for local development

**Important:** *You need a working Webhook site account to develop on the CMS.*

Steps to install:

* Clone this repo and navigate to the webhook-cms directory
* Run `npm install` for node dependencies
* Run `bower install` for front-end dependencies
* Look for `<meta name="siteName" content="test" />` in `app/index.html` and change `test` to your site name
* Run `grunt server`, which loads on localhost:8000. It will activate livereload on changes to your JS, Handlebar and Sass files.

## Widgets in the form builder

Webhook uses a form builder to construct the various data entry forms users will use in the CMS. We call the different fields the Formbuilder allows "widgets".

The `config/environment.js` file names every widget the Form Builder allows. Each widget is organized into a `controlType` and a `controlTypeGroup`. Below is an example of the `number` widget:

```
{
  name     : 'Number',       // display name for widget
  widget   : 'number',       // id for widget
  iconClass: 'icon-list-ol', // icon for the button used in the Form Builder.
  valueType: null            // 'object' is the only supported non-null value type
}
```

The `widget` id field determines the proper template and code to execute in the CMS. If the value you are going to store is not a string or number, you must use the 'object' valueType. There are three differnt templates for each widget all located in the `app/templates/widgets` directory.

* `app/templates/widgets/_number.hbs` is the template used for data entry by users.
  * These load into `app/templates/widgets/common/formbuilder-widget.hbs`, which is the common template for all widgets.
* `app/templates/widgets/info/_number.hbs` is the template used when you edit the widget in the formbuilder.
  * These load into `app/templates/form/_nav.hbs`, which is a common template for all widgets.
* `app/templates/widgets/value/_number.hbs` is the template used on the list view in the CMS. Like a list of existing blogs.

Validation for all widgets is done in `app/utils/validators.js`.

## Handlebar helpers

Helpers are located in `app/helpers`.

* `resize-image`: Accepts a width, height, a grow parameter. If grow is not specified, images will be resized to width/height but small images will not be filled in. If grow is set to true, small images will be filled into resize dimensions.

[1]: https://github.com/stefanpenner/ember-app-kit
[2]: http://wiki.ecmascript.org/doku.php?id=harmony:modules#quick_examples
[3]: http://www.firebase.com
[4]: http://www.webhook.com/docs/importing-custom-data/
[5]: https://github.com/webhook/webhook-generate
