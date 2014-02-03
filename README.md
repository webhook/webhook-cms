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
