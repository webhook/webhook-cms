export default Ember.Route.extend({
  model: function (params) {

    var self = this;

    var type = this.get('store').createRecord('contentType');

    var typeRef = new Firebase(window.ENV.firebase + "content_types/" + params.type);

    typeRef.once('value', function (snapshot) {
      if (snapshot.val()) {
        type.set('name', snapshot.val().name);

        var fields = type.get('fields');

        Ember.$.each(snapshot.val().fields || [], function (index, field) {
          self.get('store').find('field-type', field.type).then(function (type) {
            $.extend(field, { type: type });
            fields.pushObject(self.get('store').createRecord('field', field));
          });
        });
      }
    });

    this.set('ref', typeRef);

    return type;
  },
  setupController: function (controller, model) {
    controller.set('ref', this.get('ref'));
    controller.set('fieldTypeGroups', this.get('store').find('field-type-group'));
    this._super.apply(this, arguments);
  }
});
