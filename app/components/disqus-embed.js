export default Ember.Component.extend({
  elementId: 'disqus_thread',

  didInsertElement: function () {

    window.disqus_shortname = this.get('shortname');
    window.disqus_identifier = this.get('identifier');

    var src = 'http://' + window.disqus_shortname + '.disqus.com/embed.js';

    if (!Ember.$('script[src="' + src + '"]').length) {
      var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
      dsq.src = src;
      (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
    } else {
      window.DISQUS.reset({
        reload: true
      });
    }
  }
});
