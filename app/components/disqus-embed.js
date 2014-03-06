export default Ember.Component.extend({
  elementId: 'disqus_thread',

  didInsertElement: function () {

    var disqus_shortname = this.get('forum');

    var src = 'http://' + disqus_shortname + '.disqus.com/embed.js';

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
