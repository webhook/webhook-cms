import ApplicationSerializer from 'appkit/serializers/application';

export default ApplicationSerializer.extend({
  serialize: function (record) {

    var serializedSubControls = [];

    record.get('controls').forEach(function (control) {
      serializedSubControls.push(control.serialize());
    });

    var json = this._super.apply(this, arguments);

    json.controls = serializedSubControls;

    return json;
  }
});
