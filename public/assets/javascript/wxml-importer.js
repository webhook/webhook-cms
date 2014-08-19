var WXMLImporter = (function() {
  var structuredTypes = {
    "articles" : {
      "controls" : [ {
        "controlType" : "textfield",
        "hidden" : false,
        "label" : "Name",
        "locked" : true,
        "name" : "name",
        "required" : true,
        "showInCms" : true
      }, {
        "controlType" : "datetime",
        "hidden" : true,
        "label" : "Create Date",
        "locked" : true,
        "name" : "create_date",
        "required" : true,
        "showInCms" : false
      }, {
        "controlType" : "datetime",
        "hidden" : true,
        "label" : "Last Updated",
        "locked" : true,
        "name" : "last_updated",
        "required" : true,
        "showInCms" : false
      }, {
        "controlType" : "datetime",
        "hidden" : true,
        "label" : "Publish Date",
        "locked" : true,
        "name" : "publish_date",
        "required" : false,
        "showInCms" : false
      }, {
        "controlType" : "relation",
        "help" : "Search for the name of the author of this post.",
        "hidden" : false,
        "label" : "Author(s)",
        "locked" : false,
        "meta" : {
          "contentTypeId" : "authors",
          "reverseName" : "articles"
        },
        "name" : "authors",
        "required" : false,
        "showInCms" : false
      }, {
        "controlType" : "wysiwyg",
        "hidden" : false,
        "label" : "Body",
        "locked" : false,
        "meta" : {
          "image" : true,
          "link" : true,
          "quote" : true,
          "table" : true,
          "video" : true
        },
        "name" : "body",
        "required" : false,
        "showInCms" : true
      }, {
        "controlType" : "relation",
        "help" : "Search for existing tags to attach this article to.",
        "hidden" : false,
        "label" : "Tags",
        "locked" : false,
        "meta" : {
          "contentTypeId" : "tags",
          "reverseName" : "articles"
        },
        "name" : "tags",
        "required" : false,
        "showInCms" : false
      }, {
        "controlType" : "textfield",
        "hidden" : true,
        "label" : "Preview URL",
        "locked" : true,
        "name" : "preview_url",
        "required" : true,
        "showInCms" : false
      } ],
      "individualMD5" : "0ca7c5a53a0bc6aeb41a56822176616e",
      "listMD5" : "3956dbc8ae2f6a6c822e45d55013e0e4",
      "name" : "articles",
      "oneOff" : false
    },
    "authors" : {
      "controls" : [ {
        "controlType" : "textfield",
        "help" : "The display name for the person.",
        "hidden" : false,
        "label" : "Name",
        "locked" : true,
        "name" : "name",
        "placeholder" : "",
        "required" : true,
        "showInCms" : true
      }, {
        "controlType" : "datetime",
        "hidden" : true,
        "label" : "Create Date",
        "locked" : true,
        "name" : "create_date",
        "required" : true,
        "showInCms" : false
      }, {
        "controlType" : "datetime",
        "hidden" : true,
        "label" : "Last Updated",
        "locked" : true,
        "name" : "last_updated",
        "required" : true,
        "showInCms" : false
      }, {
        "controlType" : "datetime",
        "hidden" : true,
        "label" : "Publish Date",
        "locked" : true,
        "name" : "publish_date",
        "required" : false,
        "showInCms" : false
      }, {
        "controlType" : "name",
        "hidden" : false,
        "label" : "Full name",
        "locked" : false,
        "name" : "full_name",
        "required" : false,
        "showInCms" : true
      }, {
        "controlType" : "email",
        "hidden" : false,
        "label" : "Email",
        "locked" : false,
        "name" : "email",
        "required" : false,
        "showInCms" : true
      }, {
        "controlType" : "relation",
        "help" : "",
        "hidden" : false,
        "label" : "Articles",
        "locked" : false,
        "meta" : {
          "contentTypeId" : "articles",
          "reverseName" : "authors"
        },
        "name" : "articles",
        "required" : false,
        "showInCms" : false
      }, {
        "controlType" : "textfield",
        "hidden" : true,
        "label" : "Preview URL",
        "locked" : true,
        "name" : "preview_url",
        "required" : true,
        "showInCms" : false
      } ],
      "individualMD5" : "19f5d115cc83d07aa19afcc168142417",
      "listMD5" : "4868cf966257d7ee7cae91fd11ed533a",
      "name" : "authors",
      "oneOff" : false
    },
    "tags" : {
      "controls" : [ {
        "controlType" : "textfield",
        "hidden" : false,
        "label" : "Name",
        "locked" : true,
        "name" : "name",
        "required" : true,
        "showInCms" : true
      }, {
        "controlType" : "datetime",
        "hidden" : true,
        "label" : "Create Date",
        "locked" : true,
        "name" : "create_date",
        "required" : true,
        "showInCms" : false
      }, {
        "controlType" : "datetime",
        "hidden" : true,
        "label" : "Last Updated",
        "locked" : true,
        "name" : "last_updated",
        "required" : true,
        "showInCms" : false
      }, {
        "controlType" : "datetime",
        "hidden" : true,
        "label" : "Publish Date",
        "locked" : true,
        "name" : "publish_date",
        "required" : false,
        "showInCms" : false
      }, {
        "controlType" : "relation",
        "help" : "Articles attached to this tag.",
        "hidden" : false,
        "label" : "Articles",
        "locked" : false,
        "meta" : {
          "contentTypeId" : "articles",
          "reverseName" : "tags"
        },
        "name" : "articles",
        "required" : false,
        "showInCms" : true
      }, {
        "controlType" : "textfield",
        "hidden" : true,
        "label" : "Preview URL",
        "locked" : true,
        "name" : "preview_url",
        "required" : true,
        "showInCms" : false
      } ],
      "individualMD5" : "ebbf756b8d924c2f681838c6c84dae38",
      "listMD5" : "46355744803b28c70f106993eb443590",
      "name" : "tags",
      "oneOff" : false
    },
    "sitedata" : {
      "controls" : [ {
        "controlType" : "textfield",
        "hidden" : false,
        "label" : "Name",
        "locked" : true,
        "name" : "name",
        "required" : true,
        "showInCms" : true
      }, {
        "controlType" : "datetime",
        "hidden" : true,
        "label" : "Create Date",
        "locked" : true,
        "name" : "create_date",
        "required" : true,
        "showInCms" : false
      }, {
        "controlType" : "datetime",
        "hidden" : true,
        "label" : "Last Updated",
        "locked" : true,
        "name" : "last_updated",
        "required" : true,
        "showInCms" : false
      }, {
        "controlType" : "datetime",
        "hidden" : true,
        "label" : "Publish Date",
        "locked" : true,
        "name" : "publish_date",
        "required" : false,
        "showInCms" : false
      }, {
        "controlType" : "image",
        "hidden" : false,
        "label" : "Image",
        "locked" : false,
        "name" : "image",
        "required" : false,
        "showInCms" : true
      }, {
        "controlType" : "wysiwyg",
        "hidden" : false,
        "label" : "Description",
        "locked" : false,
        "meta" : {
          "image" : true,
          "link" : true,
          "quote" : true,
          "table" : true,
          "video" : true
        },
        "name" : "description",
        "required" : false,
        "showInCms" : true
      }, {
        "controlType" : "textfield",
        "hidden" : true,
        "label" : "Preview URL",
        "locked" : true,
        "name" : "preview_url",
        "required" : true,
        "showInCms" : false
      } ],
      "name" : "Site Data",
      "oneOff" : true,
      "oneOffMD5" : "3f315a9f57e5863d39063ed221343946"
    }
  };

  var firebase = null;
  var siteKey = '';
  var site = '';
  var downcode = function(str) { return str; };
  var onImporterUpdated = function() {

  };


  var self = null;
  var wxmlToFirebase = function(data, downcodeFunc, firebaseRef, siteName, key, callback) {
    firebase = firebaseRef;
    siteKey = key;
    site = siteName;

    downcode = downcodeFunc;

    self = this;
    jsonToFirebase(data, callback);
  }

  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
  }

  function guid() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
           s4() + '-' + s4() + s4() + s4();
  }

  var getKey = function() {
    var keyref = firebase.push();

    var key = keyref.toString().replace(firebase.toString() + '/', '');

    return key;
  }

  function formattedDate(date) {
    return moment(date).format();
  }

  var structuredData = {};
  var parsingData = {};

  var finalCallback = null;

  function jsonToFirebase(data, finishedCallback) {
    // Handle the one off
    parsingData = data;

    self.onImporterUpdated({ event: 'siteInfo', class: 'active', running: true });
    finalCallback = finishedCallback;

    var time = new Date(data.pubDate);
    var sitedata = {
      "create_date" : formattedDate(data.pubDate),
      "last_updated" : formattedDate(data.pubDate),
      "_sort_create_date": time.getTime(),
      "_sort_last_updated": time.getTime(),
      "description": data.description,
      "name" : data.title,
      "image" : null, // If image, upload
      "preview_url": guid(), //guid(),
    };


    self.onImporterUpdated({ event: 'siteInfo', class: 'complete', running: false });
    if(data.image) {
      uploadImage(data.image, function(data) {
        sitedata.image = data;

        // TODO: Actually format the image data here
        structuredData.sitedata = sitedata;
        parseTags();
      });
    } else {
      structuredData.sitedata = sitedata;
      parseTags();
      // Continue here
    }
  };

  var tagsToId = {};

  var parseTags = function() {
    self.onImporterUpdated({ event: 'tags', class: 'active', running: true });
    var tagsToParse = [];
    for(var key in parsingData.tags) {
      if(!parsingData.tags.hasOwnProperty(key)) {
        continue;
      }

      tagsToParse.push({ key: key, data: parsingData.tags[key] });
    }

    var tags = {};
    tagsToParse.forEach(function(tagData) {
      var pushId = getKey();
      tagsToId[tagData.key] = pushId;

      var now = Date.now();
      var newTag = {
       "_sort_create_date": Math.floor(now / 1000),
       "_sort_last_updated": Math.floor(now / 1000),
       "_sort_publish_date": Math.floor(now / 1000),
       "create_date": formattedDate(now),
       "last_updated": formattedDate(now),
       "name": tagData.data.name,
       "preview_url": guid(),
       "articles" : [],
       "publish_date": formattedDate(now)
      }

      tags[pushId] = newTag;
    });

    structuredData.tags = tags;

    self.onImporterUpdated({ event: 'tags', class: 'complete', running: false});
    parseAuthors();
  }

  var authorsToIds = {};

  var parseAuthors = function() {
    self.onImporterUpdated({ event: 'authors', class: 'active', running: true});

    var authorsToParse = [];
    for(var key in parsingData.authors) {
      if(!parsingData.authors.hasOwnProperty(key)) {
        continue;
      }

      authorsToParse.push({ key: key, data: parsingData.authors[key] });
    }

    var authors = {};
    authorsToParse.forEach(function(authorData) {
      var pushId = getKey();
      authorsToIds[authorData.key] = pushId;

      var now = Date.now();
      var newAuthor = {
       "_sort_create_date": Math.floor(now / 1000),
       "_sort_last_updated": Math.floor(now / 1000),
       "_sort_publish_date": Math.floor(now / 1000),
       "create_date": formattedDate(now),
       "last_updated": formattedDate(now),
       "email":  authorData.data.email,
       "full_name": {
         "first": authorData.data.first_name,
         "last": authorData.data.last_name,
       },
       "articles": [],
       "name": authorData.data.display_name,
       "preview_url": guid(),
       "publish_date": formattedDate(now)
      };

      authors[pushId] = newAuthor;
    });

    structuredData.authors = authors;

    self.onImporterUpdated({ event: 'authors', class: 'complete', running: false });
    parseAttachments();
  }

  var postsToIds = {};

  var lastOffset = 0;
  var emptyTitle = 1;

  var parsePosts = function() {
    self.onImporterUpdated({ event: 'posts', class: 'active', running: true });

    var postsToParse = [];
    for(var key in parsingData.posts) {
      if(!parsingData.posts.hasOwnProperty(key)) {
        continue;
      }

      postsToParse.push({ key: key, data: parsingData.posts[key] });
    }

    var articles = {};
    postsToParse.forEach(function(postData) {
      var pushId = getKey();
      postsToIds[postData.key] = pushId;

      var now = Date.now();

      var authorId = authorsToIds[postData.data.creator];
      var authorObj = structuredData.authors[authorId];

      var body = postData.data.content || "";

      urlsToNewUrls.forEach(function(map) {
        if(map.newUrl === "")
          return;

        body = body.replace(map.oldUrl, map.newUrl);
      });

      var postDate = moment.utc(postData.data.post_date);
      var postDateGmt = moment.utc(postData.data.post_date_gmt);

      var publishDate = null;
      var isDraft = null;

      if(!(postData.data.post_date_gmt === "0000-00-00 00:00:00")) {
        lastOffset =  postDate.diff(postDateGmt, 'minutes') * -1;
        newDate = postDateGmt.zone(lastOffset);
        publishDate = newDate;
      } else {
        newDate = postDate.add(lastOffset, 'm').zone(lastOffset)
        publishDate = newDate;
      }

      if((postData.data.post_date_gmt === "0000-00-00 00:00:00") && (postData.data.post_date === "0000-00-00 00:00:00")) {
        isDraft = true;
        publishDate = null;
        newDate = moment(new Date(0));
      }

      var title = postData.data.title;

      if(!title) {
        title = 'Empty Title ' + emptyTitle;
        emptyTitle++;
      }
      var newArticle = {
       "_sort_create_date": newDate.unix(),
       "_sort_last_updated": newDate.unix(),
       "_sort_publish_date": publishDate ? publishDate.unix() : null,
       "create_date": newDate.format(), 
       "last_updated": newDate.format(),
       "body":  fixBody(body),
       "authors": [ "authors " + authorId  ],
       "tags": [],
       "name": title,
       "preview_url": guid(),
       "publish_date": publishDate ? publishDate.format() : null,
       "isDraft" : isDraft
      };

    //  if(structuredData.authors[authorId]) {
        structuredData.authors[authorId].articles.push("articles " + pushId);
     // } else {
       // newArticle.authors = [];
      //}

      for(var tag in postData.data.tags) {
        if(!postData.data.tags.hasOwnProperty(tag)) {
          continue;
        }

        var tagId = tagsToId[tag];
        var tagObj = structuredData.tags[tagId];

        //if(structuredData.tags[tagId]) {
          newArticle.tags.push("tags " + tagId);
          structuredData.tags[tagId].articles.push("articles " + pushId);
        //}
      }

      articles[pushId] = newArticle;
    });

    structuredData.articles = articles;

    self.onImporterUpdated({ event: 'posts', class: 'complete', running: false });
    parsePages();
  }

  var pagesToIds = {};

  var parsePages = function() {
    emptyTitle = 0;
    self.onImporterUpdated({ event: 'pages', class: 'active', running: true });

    var pagesToParse = [];
    for(var key in parsingData.pages) {
      if(!parsingData.pages.hasOwnProperty(key)) {
        continue;
      }
      pagesToParse.push({ key: key, data: parsingData.pages[key] });
    }

    pagesToParse.forEach(function(pageData) {

      var now = Date.now();

      var body = pageData.data.content || "";

      urlsToNewUrls.forEach(function(map) {
        if(map.newUrl === "")
          return;

        body = body.replace(map.oldUrl, map.newUrl);
      });

      var postDate = moment.utc(pageData.data.post_date);
      var postDateGmt = moment.utc(pageData.data.post_date_gmt);

      var publishDate = null;
      var isDraft = null;

      if(!(pageData.data.post_date_gmt === "0000-00-00 00:00:00")) {
        lastOffset =  postDate.diff(postDateGmt, 'minutes') * -1;
        newDate = postDateGmt.zone(lastOffset);
        publishDate = newDate;
      } else {
        newDate = postDate.add(lastOffset, 'm').zone(lastOffset)
        publishDate = newDate;
      }

      if((pageData.data.post_date_gmt === "0000-00-00 00:00:00") && (pageData.data.post_date === "0000-00-00 00:00:00")) {
        isDraft = true;
        publishDate = null;
        newDate = moment(new Date(0));
      }

      var title = pageData.data.title;

      if(!title) {
        title = 'Empty Title ' + emptyTitle;
        emptyTitle++;
      }

      var newPage = {
       "_sort_create_date": newDate.unix(),
       "_sort_last_updated": newDate.unix(),
       "_sort_publish_date": publishDate ? publishDate.unix() : null,
       "create_date": newDate.format(),
       "last_updated": newDate.format(),
       // Todo format the body
       "body":  fixBody(body),
       "name": pageData.data.title,
       "preview_url": guid(),
       "publish_date": publishDate ? publishDate.format() : null,
       "isDraft" : isDraft
      };

      var newType = {
        "controls" : [ {
          "controlType" : "textfield",
          "hidden" : false,
          "label" : "Name",
          "locked" : true,
          "name" : "name",
          "required" : true,
          "showInCms" : true
        }, {
          "controlType" : "datetime",
          "hidden" : true,
          "label" : "Create Date",
          "locked" : true,
          "name" : "create_date",
          "required" : true,
          "showInCms" : false
        }, {
          "controlType" : "datetime",
          "hidden" : true,
          "label" : "Last Updated",
          "locked" : true,
          "name" : "last_updated",
          "required" : true,
          "showInCms" : false
        }, {
          "controlType" : "datetime",
          "hidden" : true,
          "label" : "Publish Date",
          "locked" : true,
          "name" : "publish_date",
          "required" : false,
          "showInCms" : false
        }, {
          "controlType" : "wysiwyg",
          "hidden" : false,
          "label" : "Body",
          "locked" : false,
          "meta" : {
            "image" : true,
            "link" : true,
            "quote" : true,
            "table" : true,
            "video" : true
          },
          "name" : "body",
          "required" : false,
          "showInCms" : true
        }, {
          "controlType" : "textfield",
          "hidden" : true,
          "label" : "Preview URL",
          "locked" : true,
          "name" : "preview_url",
          "required" : true,
          "showInCms" : false
        } ],
        "name" : "pages",
        "oneOff" : true,
        "oneOffMD5" : "12ccdd0e5767cb47e0101448a75ac997"
      };

      var newTypeName = downcode(pageData.data.title).replace(/\s+|\W/g, '').toLowerCase();
      newType.name = newTypeName;

      pagesToIds[pageData.key] = newTypeName;
      structuredTypes[newTypeName] = newType;
      structuredData[newTypeName] = newPage;
    });

    self.onImporterUpdated({ event: 'pages', class: 'complete', running: false });
    uploadData();
  }

  var urlsToNewUrls = [];

  function parseAttachments() {
    var attachementsToParse = [];
    for(var key in parsingData.attachements) {
      if(!parsingData.attachements.hasOwnProperty(key)) {
        continue;
      }
      attachementsToParse.push({ key: key, data: parsingData.attachements[key] });
    }

    self.onImporterUpdated({ event: 'images', class: 'active', running: true, imgCount: 0, total: attachementsToParse.length });
    var uploadFunctions = [];

    var imageNo = 0;
    attachementsToParse.forEach(function(attData) {
      var att = attData.data;
      var url = att.attachment_url;

      uploadFunctions.push(function(step) {
        imageNo = imageNo + 1;
        self.onImporterUpdated({ event: 'images', class: 'active', running: true, imgCount: imageNo, total: attachementsToParse.length });
        uploadImage(url, function(data) {
          urlsToNewUrls.push({ oldUrl: url, newUrl: data.resize_url || data.url });
          step();
        })
      });

    });

    async.series(uploadFunctions, function() {
      self.onImporterUpdated({ event: 'images', class: 'complete', running: false, imgCount: attachementsToParse.length, total: attachementsToParse.length });
      parsePosts();
    });
  }

  function fixBody(body) {
    body = body.replace(/\r\n/g, '\n');
    body = body.replace(/\r/g, '');
    var lines = body.split('\n\n');
    var htmlString = "<p>";
    lines.forEach(function(line) { htmlString += line + "</p><p>"; })
    htmlString = htmlString.slice(0, htmlString.length - 3);

    var bodyObj = $('<div>' + htmlString + '</div>');

    var captionParsed = false;
    bodyObj.shortcode({
      caption: function() {
        captionParsed = true;
        var contents = $(this.contents);

        contents.attr('data-caption', this.options.caption);
        return $('<div></div>').append(contents).html();
      }
    });

    bodyObj.find('img').each(function(index, val) {
      var imgObj = $(val);

      if(imgObj.attr('src').indexOf('ggpht.com/') === -1) {
        return;
      }

      var figureTag = $('<figure data-type="image" class="wy-figure-large">' +
                          '<a href="">' +
                              '<img data-resize-src="" src="">' +
                          '</a>' +
                          '<figcaption></figcaption>' +
                        '</figure>')

      if($(val).parent().is('a')) {
        figureTag.find('a').attr('href', $(val).parent().attr('href'));
        figureTag.find('img').attr('data-resize-src', $(val).attr('src'));
        figureTag.find('img').attr('src', $(val).attr('src') + '=s1200');

        if(figureTag.find('img').attr('data-caption') !== '') {
          figureTag.find('figcaption').text(figureTag.find('img').attr('data-caption'));
          figureTag.find('img').removeAttr('data-caption');
        }

        $(val).parent().replaceWith(figureTag);
      } else {
        figureTag.find('a').attr('href', $(val).attr('src'));
        figureTag.find('img').attr('data-resize-src', $(val).attr('src'));
        figureTag.find('img').attr('src', $(val).attr('src') + '=s1200');

        if(figureTag.find('img').attr('data-caption') !== '') {
          figureTag.find('figcaption').text(figureTag.find('img').attr('data-caption'));
          figureTag.find('img').removeAttr('data-caption');
        }

        $(val).replaceWith(figureTag);
      }
    });

    bodyObj.find('iframe').each(function(index, val) {
      var frame = $(val);

      var src = frame.attr('src');

      if(src.indexOf('youtube.com') !== -1 || src.indexOf('vimeo.com') !== -1) {
        frame.wrap('<figure data-type="video"></figure>');
      } else {
        frame.wrap('<figure data-type="embed"></figure>');
      }
    });


    bodyObj.find('object').each(function(index, val) {
      var frame = $(val);

      frame.wrap('<figure data-type="embed"></figure>');
    });

    return bodyObj.html();
  };

  function uploadData() {
    self.onImporterUpdated({ event: 'firebase', class: 'active', running: true });
    firebase.child("contentType").set(structuredTypes, function() {
      firebase.child("data").set(structuredData, function() {
        self.onImporterUpdated({ event: 'firebase', class: 'complete', running: false});
        if(finalCallback) {
          finalCallback();
        }
      })
    });
  }

  function uploadImage(url, callback) {

    $.ajax({
      url: 'http://server.webhook.com/upload-url/',
      type: 'POST',
      data: {
        url: url,
        resize_url: true,
        token: siteKey,
        site: site,
      },
      success: function(data) {
        var img = new Image();

        if(!data.resize_url) {
          callback({
            size: data.size,
            url: data.url,
            type: data.mimeType,
          });
        } else {
          img.onload = function() {
            var formattedData = {
             height: this.height,
             resize_url: data.resize_url,
             size: data.size,
             type: data.mimeType,
             url: data.url,
             width: this.width,
            }
            callback(data);
          }
          img.src = 'http://' + site + '.webhook.org' + data.url;
        }
      },
      error: function() {
        callback({size: 0, url: "", type: "" });
      }
    });
  }

  return {
    import: wxmlToFirebase,
    onImporterUpdated: onImporterUpdated
  }
})();
