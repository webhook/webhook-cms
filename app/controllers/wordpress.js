/*global WXMLConverter,WXMLImporter*/
import downcode from 'appkit/utils/downcode';
import SearchIndex from 'appkit/utils/search-index';

export default Ember.Controller.extend({

  needs: ['application'],

  wxmlDoneClass: 'pending',
  wxmlStatus: null,

  isComplete: false,

  convertXml: function () {

    var file = this.get('controllers.application.wordpressXML');

    var controller = this;
    var reader = new window.FileReader();

    reader.onload = function(e) {
      var data = reader.result;

      WXMLConverter.onConverterUpdated = function(updateEvent) {
        controller.set('wxmlStatus.messages', true);
        controller.set('wxmlStatus.' + updateEvent.event, updateEvent);
      };

      WXMLImporter.onImporterUpdated = function(updateEvent) {
        controller.set('wxmlStatus.messages', true);
        controller.set('wxmlStatus.' + updateEvent.event, updateEvent);
      };

      WXMLConverter.convert(data, function(parsedData) {
        WXMLImporter.import(parsedData, downcode, window.ENV.firebase, controller.get('session.site.name'), controller.get('session.site.token'), function() {
          controller.set('wxmlStatus.search', { running: true, class: 'active'});
          SearchIndex.reindex().then(function () {
            controller.set('wxmlStatus.search', { running: false, class: 'complete'});
            controller.set('wxmlDoneClass', 'complete');
            controller.set('isComplete', true);
          }, function (error) {
            controller.set('wxmlStatus.search', { running: false, class: 'danger'});
            controller.set('wxmlDoneClass', 'complete');
            controller.set('isComplete', false);
          });
        });
      });
    };

    if (Ember.isEmpty(file)) {
      this.transitionToRoute('wh');
    } else {
      reader.readAsText(file);
    }

  }
});
