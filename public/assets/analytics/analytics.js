Handlebars.registerHelper('format-number', function(number, options) {
  if (!number) {
    return "";
  }
  if (options.hash.format) {
    return numeral(number).format(options.hash.format);
  } else {
    return numeral(number).format();
  }
});

gapi.analytics.ready(function() {

  gapi.analytics.createComponent('ActiveUsers', {

    initialize: function(options) {

      // Allow container to be a string ID or an HTMLElement.
      this.container = typeof options.container == 'string' ?
        document.getElementById(options.container) : options.container;

      this.polling = false;
      this.activeUsers = 0;
    },

    execute: function() {
      // Stop any polling currently going on.
      if (this.polling) this.stop();

      // Wait until the user is authorized.
      if (gapi.analytics.auth.isAuthorized()) {
        this.getActiveUsers();
      }
      else {
        gapi.analytics.auth.once('success', this.getActiveUsers.bind(this));
      }
    },

    stop: function() {
      clearTimeout(this.timeout);
      this.polling = false;
      this.emit('stop', {activeUsers: this.activeUsers});
    },

    getActiveUsers: function() {
      var options = this.get();
      var pollingInterval = (options.pollingInterval || 5) * 1000

      if (!(pollingInterval >= 1000)) {
        throw new Error('Frequency cannot be less than 1 second.');
      }

      this.polling = true;
      gapi.client.analytics.data.realtime
        .get({ids:options.ids, metrics:'rt:activeUsers'})
        .execute(function(response) {
          var value = response.totalResults ? +response.rows[0][0] : 0;

          if (value > this.activeUsers) this.onIncrease();
          if (value < this.activeUsers) this.onDecrease();

          this.activeUsers = value;
          this.container.innerHTML = value;

          if (this.polling = true) {
            this.timeout = setTimeout(this.getActiveUsers.bind(this),
                pollingInterval);
          }
        }.bind(this));
    },

    onIncrease: function() {
      this.emit('increase', {activeUsers: this.activeUsers});
      this.emit('change', {
        activeUsers: this.activeUsers,
        direction: 'increase'
      });
    },

    onDecrease: function() {
      this.emit('decrease', {activeUsers: this.activeUsers});
      this.emit('change', {
        activeUsers: this.activeUsers,
        direction: 'decrease'
      });
    }

  });

});



function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

var token = '';
var id = getParameterByName('googleId');
var realId = -1;


var days = "30daysAgo";



gapi.analytics.ready(function() {

  var realTimesource = $('#realtimeTemplate').html();
  var realTimeTemplate = Handlebars.compile(realTimesource);

  var trafficTimesource = $('#trafficTemplate').html();
  var trafficTemplate = Handlebars.compile(trafficTimesource);


  var referrerSource = $('#referrerTemplate').html();
  var referrerTemplate = Handlebars.compile(referrerSource);

  var pageViewSource = $('#pageviewsTemplate').html();
  var pageViewTemplate = Handlebars.compile(pageViewSource);
  // Step 3: Authorize the user.

  var CLIENT_ID = '188556106710-kt1h5l0k9f0kpei5h4o60ouf009f9nm4.apps.googleusercontent.com';

  gapi.analytics.auth.authorize({
    container: 'auth-button',
    clientid: CLIENT_ID,
  });

  // Step 5: Create the timeline chart.

  var updateTimer = null;
  var oldActiveUser = null;

  var createCharts = function(id) {

    var finished = 8;

    $('#loader').show();
    $('#mainContent').hide();

    var checkFinished = function() {
      finished--;

      if(finished === 0) {
        $('#loader').hide();
        $('#mainContent').show();
      }
    }

    gapi.client.analytics.data.realtime
      .get({ids: 'ga:' + id, metrics:'rt:pageviews', dimensions: 'rt:pagePath', "max-results": 10, sort: "-rt:pageviews"})
      .execute(function(resp) {

        var data = [];

        resp.rows.forEach(function(item) {
          data.push({path: item[0], count: item[1] });
        })


        $('#realtime').html(realTimeTemplate({ datapoints: data }));

        checkFinished();
        // resp.rows is what I want, probably need to poll here
      });

    gapi.client.analytics.data.realtime
      .get({ids: 'ga:' + id, metrics:'rt:pageviews', dimensions: 'rt:source', "max-results": 10, sort: "-rt:pageviews"})
      .execute(function(resp) {

        var data = [];

        resp.rows.forEach(function(item) {
          data.push({path: item[0], count: item[1] });
        })


        $('#traffic').html(trafficTemplate({ datapoints: data }));
        checkFinished();
        // resp.rows is what I want, probably need to poll here
      });

    gapi.client.analytics.data.ga
      .get({ids: 'ga:' + id, dimensions: 'ga:source', metrics: "ga:pageviews", "max-results": 10, 'start-date': days, 'end-date': 'today', sort: "-ga:pageviews" })
      .execute(function(resp) {


        var data = [];

        resp.rows.forEach(function(item) {
          data.push({referrer: item[0], count: item[1] });
        })


        $('#referrer').html(referrerTemplate({ datapoints: data }));
        checkFinished();
      });

    gapi.client.analytics.data.ga
      .get({ids: 'ga:' + id, dimensions: 'ga:pagePath', metrics: "ga:pageviews", "max-results": 10, 'start-date': days, 'end-date': 'today', sort: "-ga:pageviews" })
      .execute(function(resp) {


        var data = [];

        resp.rows.forEach(function(item) {
          data.push({path: item[0], count: item[1] });
        })


        $('#pageviews').html(pageViewTemplate({ datapoints: data }));
        checkFinished();
      });

    gapi.client.analytics.data.ga
      .get({ids: 'ga:' + id, metrics: "ga:pageviews", 'start-date': days, 'end-date': 'today' })
      .execute(function(resp) {

        var total = 0;

        if(resp.rows.length > 0) {
          total = resp.rows[0];
        }

        $('#totalPageviews').text(numeral(total).format());
        checkFinished();
      });

    gapi.client.analytics.data.ga
      .get({ids: 'ga:' + id, metrics: "ga:sessions", 'start-date': days, 'end-date': 'today' })
      .execute(function(resp) {

        var total = 0;

        if(resp.rows.length > 0) {
          total = resp.rows[0];
        }

        $('#totalSessions').text(numeral(total).format());
        checkFinished();
      });

    gapi.client.analytics.data.ga
      .get({ids: 'ga:' + id, metrics: "ga:users", 'start-date': days, 'end-date': 'today' })
      .execute(function(resp) {

        var total = 0;

        if(resp.rows.length > 0) {
          total = resp.rows[0];
        }

        $('#totalUsers').text(numeral(total).format());
        checkFinished();
      });


    gapi.client.analytics.data.ga
      .get({ids: 'ga:' + id, metrics: "ga:pageviewsPerSession", 'start-date': days, 'end-date': 'today' })
      .execute(function(resp) {

        var total = 0;

        if(resp.rows.length > 0) {
          total = resp.rows[0];
        }

        $('#totalPagesPer').text(numeral(total).format());
        checkFinished();
      });

    if(oldActiveUser) {
      oldActiveUser.stop();
    }

    oldActiveUser = new gapi.analytics.ext.ActiveUsers({
      container: 'active-users',
      pollingInterval: 5,
      ids: 'ga:' + id
    });

    oldActiveUser.execute();

    var timeline = new gapi.analytics.googleCharts.DataChart({
      reportType: 'ga',
      query: {
        'ids': 'ga:' + id,
        'metrics': 'ga:sessions',
        'dimensions': 'ga:date',
        'start-date': days,
        'end-date': 'today'
      },
      chart: {
        container: 'timeline',
        type: 'LINE',
        options: {
          width: '100%'
        }
      }
    });

    timeline.execute();


    var operating = new gapi.analytics.googleCharts.DataChart({
      reportType: 'ga',
      query: {
        'ids': 'ga:' + id,
        'metrics': 'ga:sessions',
        'dimensions': 'ga:operatingSystem',
        'start-date': days,
        'end-date': 'today'
      },
      chart: {
        container: 'operating',
        type: 'PIE',
        options: {
          width: '100%'
        }
      }
    });

    operating.execute();

    var channel = new gapi.analytics.googleCharts.DataChart({
      reportType: 'ga',
      query: {
        'ids': 'ga:' + id,
        'metrics': 'ga:sessions',
        'dimensions': 'ga:channelGrouping',
        'start-date': days,
        'end-date': 'today'
      },
      chart: {
        container: 'channels',
        type: 'PIE',
        options: {
          width: '100%'
        }
      }
    });

    channel.execute();


    var region = new gapi.analytics.googleCharts.DataChart({
      reportType: 'ga',
      query: {
        'ids': 'ga:' + id,
        'metrics': 'ga:sessions',
        'dimensions': 'ga:country',
        'start-date': days,
        'end-date': 'today'
      },
      chart: {
        container: 'region',
        type: 'GEO',
        options: {
          width: '100%'
        }
      }
    });

    region.execute();
  }

  $('#30daysago').on('click', function(e) {
    e.preventDefault();

    days = "30daysAgo";

    createCharts(realId);
  });

  $('#7daysago').on('click', function(e) {
    e.preventDefault();

    days = "7daysAgo";

    createCharts(realId);
  });

  $('#1daysago').on('click', function(e) {
    e.preventDefault();

    days = "1daysAgo";

    createCharts(realId);
  });


  // Step 6: Hook up the components to work together.

  gapi.analytics.auth.on('success', function(response) {
    $('body').addClass('google-logged-in');
    $('#logout-button').show();
    $('#loader').show();
    token = response.access_token;

    gapi.client.analytics.management.accountSummaries
      .list({'start-index':  1})
      .execute(function(resp) {

        var foundId = false;

        resp.items.forEach(function(acct) {
          acct.webProperties.forEach(function(prop) {

            if(prop.id == id && !foundId) {
              if(prop.profiles.length > 0) {
                foundId = true;
                realId = prop.profiles[0].id;
                createCharts(realId);
                return false;
              }
            }
          });
        });

        if(!foundId) {
          $('#error').show();
          // Display error about auth here, tell them to log out
        }
      })
  });

  gapi.analytics.auth.on('error', function(response) {
  });

});


$(document).ready(function() {
  $('#logout-button').find('button').on('click', function() {
    if(token) {
      $.ajax({
        type: 'GET',
        url: 'https://accounts.google.com/o/oauth2/revoke?token=' + token,
        async: false,
        contentType: "application/json",
        dataType: 'jsonp',
        success: function() {
          location.reload();
        },
        error: function() {
          location.reload();
        }
      });
    }
  });
});
