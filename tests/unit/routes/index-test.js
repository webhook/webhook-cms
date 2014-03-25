import { test, moduleFor } from 'ember-qunit';

import Index from 'appkit/routes/index';

moduleFor('route:index', "Unit - IndexRoute");

test("it exists", function(){
  ok(this.subject() instanceof Index);
});
