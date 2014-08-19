var WXMLConverter = (function() {
  var xmlDoc = null;
  var wordpressData = {
    authors: {},
    categories: {},
    posts: {},
    tags: {},
    attachements: {},
    pages: {}, 
  };

  var onConverterUpdated = function() {

  };

  var parseWXML = function(data, callback) {
    this.onConverterUpdated({ event: 'parsingXML', class: 'active', running: true});

    // Post meta sometimes contain invalid XML, we wont need it so destroy it, not a great regex but it works
    data = data.replace(/<wp:postmeta\>((?!<\/wp:postmeta>)[\s\S])*<\/wp:postmeta>/g, '');

    // Wordpress XML will sometimes contain utf characters that aren't valid XML character
    // This regex is used to remove most of them. We do an inclusive regex instead of an exclusive regex, because javascript
    // has no standard way to handle UTF code points past 0xFFFF.... so this isn't perfect, but it will work for more cases than the alternative
    data = data.replace(/[\u0001-\u0008\u000B-\u000C\u000E-\u001F\uD800-\uDFFF\uFFFE-\uFFFF]/g, '');

    // DOM Parser doesn't exist on older IE, but our CMS doesn't support that anyways so W/e
    parser=new DOMParser();
    xmlDoc=parser.parseFromString(data,"text/xml");

    // TODO, CHECK FOR PARSE ERROR (Look for Parse Error XML Doc)

    var jsonObj = xmlToJson(xmlDoc);

    // TODO, VERIFY WORDPRESS XML VERSION IS 12, IF HIGHER/LOWER GIVE WARNING, PROBABLY WONT WORK

    var channel = jsonObj.rss.channel;

    // Most of these fields are from test data, and correlating with this reverse enginered description 
    // http://devtidbits.com/2011/03/16/the-wordpress-extended-rss-wxr-exportimport-xml-document-format-decoded-and-explained/
    wordpressData.title = convertEmpty(getNodeValue(channel['title']));
    wordpressData.link = convertEmpty(getNodeValue(channel['link']));
    wordpressData.pubDate = convertEmpty(getNodeValue(channel['pubDate']));
    wordpressData.description = convertEmpty(getNodeValue(channel['description']));
    wordpressData.language = convertEmpty(getNodeValue(channel['language']));
    wordpressData.image = convertEmpty(getNodeValue(channel['image']));

    var parseAuthor = function(author) {
      var newAuthor = {};

      for(var okey in author) {
        if(!author.hasOwnProperty(okey)) {
          continue;
        }

        newAuthor[okey.replace('wp:', '')] = getNodeValue(author[okey]);
      }

      var fixedAuthor = {};

      fixedAuthor.display_name = convertEmpty(newAuthor.author_display_name);
      fixedAuthor.email = convertEmpty(newAuthor.author_email);
      fixedAuthor.first_name = convertEmpty(newAuthor.author_first_name);
      fixedAuthor.last_name = convertEmpty(newAuthor.author_last_name);
      fixedAuthor.login = convertEmpty(newAuthor.author_login);

      // Using the login name will be easier for looking up relations later
      // Need to make sure login is always a valid JS key though
      wordpressData.authors[fixedAuthor.login] = fixedAuthor;
    }

    if(Array.isArray(channel['wp:author'])) {
      for(var key in channel['wp:author']) {
        if(!channel['wp:author'].hasOwnProperty(key)) {
          continue;
        }

        parseAuthor(channel['wp:author'][key]);
      }
    } else if (channel['wp:author']) {
        parseAuthor(channel['wp:author']);
    }

    var parseCategory = function(category) {
      var newCategory = {};

      for(var okey in category) {
        if(!category.hasOwnProperty(okey)) {
          continue;
        }

        newCategory[okey.replace('wp:', '')] = getNodeValue(category[okey]);
      }

      var fixedCategory = {};

      fixedCategory.name = convertEmpty(newCategory.cat_name);
      fixedCategory.parent = convertEmpty(newCategory.category_parent);

      // Nice name will be easier to lookup relations later
      wordpressData.categories[newCategory.category_nicename] = fixedCategory;
    }

    if(Array.isArray(channel['wp:author'])) {
      for(var key in channel['wp:category']) {
          if(!channel['wp:category'].hasOwnProperty(key)) {
            continue;
          }

        parseCategory(channel['wp:category'][key]);
      }
    } else if (channel['wp:author']) {
        parseCategory(channel['wp:category']);
    }

    var parseTag = function(tag) {
      var newTag = {};

      for(var okey in tag) {
        if(!tag.hasOwnProperty(okey)) {
          continue;
        }

        newTag[okey.replace('wp:', '')] = getNodeValue(tag[okey]);
      }

      var fixedTag = {};
      fixedTag.slug = convertEmpty(newTag.tag_slug);
      fixedTag.name = convertEmpty(newTag.tag_name);

      wordpressData.tags[fixedTag.slug] = fixedTag;
    }

    if(Array.isArray(channel['wp:tag'])) {
      for(var key in channel['wp:tag']) {
        if(!channel['wp:tag'].hasOwnProperty(key)) {
          continue;
        }

        parseTag(channel['wp:tag'][key]);
      }
    } else if (channel['wp:tag']) {
        parseTag(channel['wp:tag']);
    }

    for(var key in channel['item']) {
      if(!channel['item'].hasOwnProperty(key)) {
        continue;
      }

      var items = channel['item'][key];
      var newItem = {};

      var categoryAndTags = {};

      for(var okey in items) {
        if(!items.hasOwnProperty(okey)) {
          continue;
        }

        if(okey === 'category') {
          categoryAndTags = getCategoryValue(items[okey]);
        } else {
          newItem[okey.replace('wp:', '').replace('dc:', '')] = getNodeValue(items[okey]);
        }
      }

      delete newItem['#text'];

      var newPost = {};

      newPost.title = convertEmpty(newItem.title);
      newPost.pubDate = convertEmpty(newItem.pubDate);
      newPost.creator = convertEmpty(newItem.creator); // == Author login
      newPost.description = convertEmpty(newItem.description); // Should be blank

      newPost.content = convertEmpty(newItem['content:encoded']); // Content of post
      newPost.caption = convertEmpty(newItem['excerpt:encoded']); // Apparently a caption of a file

      newPost.post_date = convertEmpty(newItem.post_date);
      newPost.post_date_gmt = convertEmpty(newItem.post_date_gmt);

      newPost.status = convertEmpty(newItem.status); // Can be 'publish', 'draft', 'pending', 'private', 'trash', ... 'inherit?'

      newPost.parent = convertEmpty(newItem.post_parent); // You can have nested posts, assume inherit = parent post
      newPost.menu_order = convertEmpty(newItem.menu_order); // Apparently the order in which to show up as a child

      newPost.attachment_url = convertEmpty(newItem.attachment_url);

      newPost.categories= categoryAndTags.categories; // Object or single item? Hard to tell
      newPost.tags = categoryAndTags.tags;

      newPost.sticky = convertEmpty(newItem.is_sticky);

      // Maybe parse out comments, but since we dont have commenting without a JS library on webhook, not sure if needed

      // For convienence later swap them into different keys
      // Post ID is used as the key to trace the parent relations between attachements and parent posts
      if(newItem.post_type === "attachment") {
        wordpressData.attachements[newItem.post_id] = newPost;
      } else if (newItem.post_type === "page") {
        wordpressData.pages[newItem.post_id] = newPost;
      } else {
        wordpressData.posts[newItem.post_id] = newPost;
      }
    }

    this.onConverterUpdated({ event: 'parsingXML', class: 'complete', running: false});

    callback(wordpressData);
  }

  // The getNodeValue function will sometimes return an empty object for various reasons (parsing, special cases),
  // this is the equivilant to an empty field really, so we just convert it to null
  var convertEmpty = function(val) {
    return $.isEmptyObject(val) ? null : val;
  };

  var getCategoryValue = function(node) {
    if(!node) {
      return null;
    }

    var extractInfo = function(n) {
      if(!n['@attributes']) {
        return { domain: 'category', nicename: convertEmpty(getNodeValue(n)), val: convertEmpty(getNodeValue(n))};
      }
      var domain = n['@attributes']['domain'];
      var nicename = n['@attributes']['nicename'];

      return { domain: domain, nicename: nicename, val: convertEmpty(getNodeValue(n)) };
    };

    var categories = {};
    var tags = {};
    var extracted = null;
    if(node instanceof Array) {

      node.forEach(function(item) {
        extracted = extractInfo(item);


        if(extracted.domain === 'category') {
          categories[extracted.nicename] = extracted.val;
        } else if (extracted.domain === 'post_tag') {
          tags[extracted.nicename] = extracted.val;
        }

      });

    } else {
      extracted = extractInfo(node);

      if(extracted.domain === 'category') {
        categories[extracted.nicename] = extracted.val;
      } else if (extracted.domain === 'post_tag') {
        tags[extracted.nicename] = extracted.val;
      }
    }

    return { categories: categories, tags: tags };
  };

  // Grab the node value from the JSON objects parsed from XML
  var getNodeValue = function(node) {
    if(!node) {
      return null;
    }

    // Sometimes the node is an array of nodes, parse each array value
    if(node instanceof Array) {
      var fixedArray = [];
      node.forEach(function(item) {
        fixedArray.push(getNodeValue(item));
      });

      return fixedArray;
    }

    // The xmlToJson function seperates the cdata and text values into different areas, seperate them
    if (typeof node === 'object' && '#cdata-section' in node) return node['#cdata-section'];
    if (typeof node === 'object' && '#text' in node) return node['#text'];

    // If it didnt work just throw it back, its most likely a simple data type
    return node;
  };

  // A function to convert XML to JSON, any conversion wont be 100% standard or accurate (due to limitations), but this is good
  // enough for Wordpress XML (need more test data to reach a good verification)
  xmlToJson = function(xml) {
    var obj = {};
    if (xml.nodeType == 1) {                
        if (xml.attributes.length > 0) {
            obj["@attributes"] = {};
            for (var j = 0; j < xml.attributes.length; j++) {
                var attribute = xml.attributes.item(j);
                obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
            }
        }
    } else if (xml.nodeType == 3) { 
        obj = xml.nodeValue;
    } else if (xml.nodeType == 4) {
        obj = xml.nodeValue;
    }
    if (xml.hasChildNodes()) {
        for (var i = 0; i < xml.childNodes.length; i++) {
            var item = xml.childNodes.item(i);
            var nodeName = item.nodeName;

            if (typeof (obj[nodeName]) == "undefined") {
                obj[nodeName] = xmlToJson(item);
            } else {
                if (typeof (obj[nodeName].push) == "undefined") {
                    var old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                obj[nodeName].push(xmlToJson(item));
            }
        }
    }
    return obj;
  }

  return {
    convert: parseWXML,
    onConverterUpdated: onConverterUpdated
  }
})();