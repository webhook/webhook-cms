export default Ember.Handlebars.makeBoundHelper(function(str,len) {
    if (!str || !len) { return str; }

    // strip the html
    str = Ember.$('<span>').html(str).text();

    if (str.length > len && str.length > 0) {
        var new_str = str + " ";
        new_str = str.substr(0, len);
        new_str = str.substr(0, new_str.lastIndexOf(" "));
        new_str = (new_str.length > 0) ? new_str : str.substr(0, len);

        return new Ember.Handlebars.SafeString(new_str + '...');
    }
    return str;
});
