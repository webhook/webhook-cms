#### How to install for local dev

The Webhook CMS is an ember project that can be run locally with grunt.

* clone and navigate to the webhook-cms folder.
* Run an `npm install` and a `bower install`
* Run `grunt server` to load, then visit localhost:8000

#### How to deploy changes to all webhook sites

You'll need a `.cloudstorage.key` in the root of webhook-cms.

Run the following commands.

* `grunt dist` - build the newest dist.
* `grunt push-prod` - deploy to google.

Handlebar Helpers:

* resize-image: Accepts a width, height, a grow parameter. If grow is not specified, images will be resized to width/height but small images will not be filled in. If grow is set to true, small images will be filled into resize dimensions.