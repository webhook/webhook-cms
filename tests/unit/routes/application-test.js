import { test, moduleFor } from 'ember-qunit';

import Application from 'appkit/routes/application';

moduleFor('route:application', "Unit - ApplicationRoute");

test("it exists", function(){
  ok(this.subject() instanceof Application);
});
