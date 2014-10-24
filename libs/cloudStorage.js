'use strict';
var request = require('request');
var GAPI = require('gapitoken');
var mime = require('mime');
var fs   = require('fs');

var oauthToken = '';
var projectName = 'king-of-webhook';


var refreshToken = function(callback) {
  var gapi = new GAPI({
      iss: '188556106710-md8pj4tchbc9hvppdvvj9fn3786apnc5@developer.gserviceaccount.com',
      scope: 'https://www.googleapis.com/auth/devstorage.full_control https://www.googleapis.com/auth/siteverification',
      keyFile: '.cloudstorage.key'
  }, function(err) {
     if (err) { console.log(err); process.exit(1); }

     gapi.getToken(function(err, token) {
        if (err) { return console.log(err); process.exit(1); }
        oauthToken = token;

        callback();
     });     
  });
}


function jsonRequest(options, callback)  {

  if(!options.qs)
  {
    options.qs = {};
  }

  options.qs.access_token = oauthToken;

  var multiData = [];

  if(options.multipart)
  {
    var index = 0;
    options.multipart.forEach(function(multi) {
      multiData.push({ index: index, body: multi.body});
      index = index + 1;
    });
  }
  
  request({
    url: options.url,
    qs: options.qs || null,
    method: options.method,
    json: options.multipart ? null : (options.data || true),
    headers: options.headers || null,
    multipart: options.multipart || null
  }, 
  function(err, res, body){
    if(err) {
      callback(err, null);
    } else if(res.statusCode/100 === 2) {
      callback(null, body);
    } else if(res.statusCode === 401) {
      refreshToken(function() {
        if(options.multipart)
        {
          multiData.forEach(function(item) {
            options.multipart[item.index].body = item.body;
          });
        }

        jsonRequest(options, callback)
      });
    } else {
      callback(res.statusCode, null);
    }
  });

};

module.exports.buckets = {
  get: function(bucketName, callback) {

    jsonRequest({
      url: 'https://www.googleapis.com/storage/v1/b/' + bucketName,
      method: 'GET'
    }, callback);
  },

  create: function(bucketName, callback) {

    var data = {
      name: bucketName,
      website: {
        mainPageSuffix: 'index.html',
        notFoundPage: '404.html'
      }
    }

    jsonRequest({
      url: 'https://www.googleapis.com/storage/v1/b/',
      qs: { project: projectName },
      data: data,
      method: 'POST'
    }, callback);
  },

  updateAcls: function(bucketName, callback) {
    var data = {
      entity: 'allUsers',
      role: 'READER'
    };

    jsonRequest({
      url: 'https://www.googleapis.com/storage/v1/b/' + bucketName + '/defaultObjectAcl',
      data: data,
      method: 'POST',
    }, callback);
  },

  updateIndex: function(bucketName, indexFile, notFoundFile, callback) {

    var data = {
      website: {
        mainPageSuffix: indexFile,
        notFoundPage: notFoundFile
      }
    };

    jsonRequest({
      url: 'https://www.googleapis.com/storage/v1/b/' + bucketName,
      data: data,
      method: 'PATCH'
    }, callback);
  },

  del: function(bucketName, callback) {
    jsonRequest({
      url: 'https://www.googleapis.com/storage/v1/b/' + bucketName,
      method: 'DELETE'
    }, callback);
  }

};

module.exports.objects = { 

  list: function(bucket, callback) {
    jsonRequest({
      url: 'https://www.googleapis.com/storage/v1/b/' + bucket + '/o',
      qs: { fields: 'kind,items(name)' }
    }, callback);
  },

  upload: function(bucket, local, remote, callback) {
    jsonRequest({
      url: 'https://www.googleapis.com/upload/storage/v1/b/' + bucket + '/o',
      qs: { uploadType: 'multipart' },
      headers: {
        'content-type' : 'multipart/form-data'
      },
      method: 'POST',
      multipart: [{
          'Content-Type' : 'application/json; charset=UTF-8',
          body: JSON.stringify({
            name: remote,
            cacheControl: "no-cache"
          })                  
      },{ 
          'Content-Type' : mime.lookup(local),
          body: fs.readFileSync(local)
      }]
    }, callback);
  },

  del: function(bucket, filename, callback) {
    jsonRequest({
      url: 'https://www.googleapis.com/storage/v1/b/' + bucket + '/o/' + encodeURIComponent(filename),
      method: 'DELETE'
    }, callback);
  }

};
