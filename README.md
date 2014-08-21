#### How to install for local dev

*You need a Webhook site to run Webhook CMS.*

The Webhook CMS is an ember project that can be run locally with grunt.

* Clone and navigate to the webhook-cms directory
* Run `npm install` for node dependencies
* Run `bower install` for front-end dependencies
* Look for `<meta name="siteName" content="test" />` in `app/index.html` and change `test` to your site name
* Run `grunt server` to load, then visit localhost:8000

#### How to deploy changes to all webhook sites

You'll need a `.cloudstorage.key` in the root of webhook-cms.

Run the following commands.

* `grunt dist` - build the newest dist.
* `grunt deploy` - deploy to google.

Handlebar Helpers:

* resize-image: Accepts a width, height, a grow parameter. If grow is not specified, images will be resized to width/height but small images will not be filled in. If grow is set to true, small images will be filled into resize dimensions.
