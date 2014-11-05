if (Meteor.isClient) {

  /**
   * Get url parameter, e.g., http://localhost:3000/?id=3 -> id = 3
   *
   * @name The parameter name.
   */
  var getParameterByName = function(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  };

  /**
   * Connects to Huddle Engine using
   *
   * 1) host and port url parameter if set
   * 2) host and port from session if set
   * 3) shows a connection dialog
   */
  var connect = function() {
    var host = getParameterByName("host");
    var port = parseInt(getParameterByName("port"));

    if (!host || !port) {
      host = Session.get("host");
      port = Session.get("port");
    }

    if (host && port) {
      createCanvas(host, port);
    }
    else {
      $('#connection-dialog').modal({
        backdrop: false,
        keyboard: false,
        show: true
      });
    }
  };

  // make canvas accessible outside of the createCanvas function
  var canvas;
  var createCanvas = function(host, port) {
    canvas = HuddleCanvas.create(host, port, {
      containerId: "huddle-canvas-container",
      backgroundImage: "/images/where-is-waldo1.jpg",
      panningEnabled: false,
      showDebugBox: false
    });
  };

  /**
   * Do connect after main application rendered.
   */
  Template.main.rendered = function() {
    // do connect to Huddle Engine, otherwise show connection dialog
    connect();
  }

  /**
   * Render the connection dialog.
   */
  Template.connectionDialog.rendered = function() {
    $('#connection-dialog').on('hidden.bs.modal', function (e) {
      var host = $('#client-host').val();
      var port = parseInt($('#client-port').val());

      createCanvas(host, port);
    });
  };

  Template.connectionDialog.helpers({

    absoluteUrl: function() {
      var host = Session.get("host") ? Session.get("host") : "localhost";
      var port = Session.get("port") ? Session.get("port") : 1948;

      var parameters = "?host=" + host;
      parameters += "&port=" + port;
      return Meteor.absoluteUrl(parameters);
    },

    host: function() {
      return Session.get("host");
    },

    port: function() {
      return Session.get("port");
    }
  });

  Template.connectionDialog.events({

    'keyup #client-host': function(e, tmpl) {
      var host = $('#client-host').val();
      Session.set("host", host);
    },

    'keyup #client-port': function(e, tmpl) {
      try {
        var port = parseInt($('#client-port').val());
        Session.set("port", port);
      }
      catch (err) {
        // ignore err
      }
    }
  });
}
