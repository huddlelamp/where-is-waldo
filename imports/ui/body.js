import { Template } from 'meteor/templating';

import './body.html';

Template.content.onRendered(function() {

const canvas = document.querySelector('#peephole-canvas');
const canvasWidth = parseInt(window.getComputedStyle(canvas).width) // image width
const canvasHeight = parseInt(window.getComputedStyle(canvas).height) // image height
Transformer.bind(canvas).then((transformer) => {

    // Create custom render transform for element.
    // !!! Changing any of this code or re-order will effect rendering of element after manipulation.
    const renderTransform = new Transformer.TransformGroup();
    const scaleTransform = canvas.scaleTransform = new Transformer.ScaleTransform();
    const rotateTransform = canvas.rotateTransform = new Transformer.RotateTransform();
    const translateTransform = canvas.translateTransform = new Transformer.TranslateTransform();
    renderTransform.add(scaleTransform);
    renderTransform.add(rotateTransform);
    renderTransform.add(translateTransform);
    canvas.renderTransform = renderTransform;

    // The center point, which is returned by hammer.js, is in screen coordinates. The following function
    // will transform these screen coordinates to canvas coordinates and with respect to an element's transform
    // and if necessary according to an element's transform hierarchy.
    const adjustCenterPoint = (point) => {
        const p = new Transformer.Point(point.x, point.y);
        return transformer.fromGlobalToLocal(p);
    };

    let huddle;
    const Peephole = {
        /**
           * Move the canvas according to the current proximity.
           *
           * @param {Object} proximity Proximity data that moves the canvas.
           */
        moveCanvas: function (proximity) {
            console.log('move canvas', proximity);
            const location = proximity.Location;
            const x = location[0];
            const y = location[1];
            const angle = proximity.Orientation;

            const centerX = canvasWidth * x;
            const centerY = canvasHeight * y;

            let centerPoint = { x: centerX, y: centerY };
            // centerPoint = adjustCenterPoint(centerPoint);
            rotateTransform.centerPoint.x = centerPoint.x;
            rotateTransform.centerPoint.y = centerPoint.y;
            rotateTransform.set(angle);
            
            translateTransform.set(-centerX + window.innerWidth / 2, -centerY + window.innerHeight / 2);
            transformer.reapplyTransforms();
        },

        // /**
        //    * Render presence location indicators for other presences. An indicator is
        //    * a blue line that points in the direction of the presence.
        //    *
        //    * @param {Object} presences Other presences.
        //    */
        // renderPresences: function (presences) {

        //     // array for later removing presences that are not available anymore
        //     var currentIds = [];

        //     var $presenceContainer = $('#presences-container');
        //     $presenceContainer.addClass('fullheight');

        //     presences.forEach(function (presence) {

        //         if (presence.Type != "Display") return;

        //         var id2 = parseInt(presence.Identity);
        //         var location2 = presence.Location;
        //         var x2 = location2[0];
        //         var y2 = location2[1];

        //         // push id on array that indicates available presences
        //         currentIds.push(id2);

        //         var $presence = $('#presence-' + id2);

        //         if (!$presence.length && $presenceContainer.length) {
        //             var $presenceElement = $('<div id="presence-' + id2 + '" presence-id="' + id2 + '" class="huddle-presence"></div>');
        //             $presenceContainer.append($presenceElement);
        //         }

        //         var containerWidth = $('#presences-container').width();
        //         var containerHeight = $('#presences-container').height();

        //         var presenceWidth = $presence.width();

        //         var presenceLeft = (containerWidth / 2) - (presenceWidth / 2);
        //         var presenceTop = (containerHeight / 2);

        //         // $presence.css('height', presenceHeight + "px");
        //         $presence.css('left', presenceLeft + "px");
        //         $presence.css('top', presenceTop + "px");
        //         $presence.css('height', $(window).width() + "px");
        //         $presence.rotate(parseInt(presence.Orientation) - 180);
        //     });

        //     // removes all presences that are not available anymore
        //     $('.huddle-presence').each(function (index, value) {
        //         var presenceId = parseInt($(this).attr('presence-id'));
        //         if ($.inArray(presenceId, currentIds) < 0) {
        //             window.console.log("Removed")
        //             $(this).remove();
        //         }
        //     });
        // },

        /**
           * Connects Huddle client to host and port with the given name.
           *
           * @param {string} host Huddle Engine host.
           * @param {int} port Huddle Engine port.
           * @param {string} [name] Huddle client's name.
           */
        hutHutHut: function (host, port, name) {
            
            huddle = Huddle.client({
                name: name
            })
                .on("proximity", (data) => {

                    // move canvas
                    Peephole.moveCanvas(data);

                    // // render presence indicators
                    // Peephole.renderPresences(data.Presences);
                });
            huddle.connect(host, port);
        },
    };

    Peephole.hutHutHut("localhost", 1948, "HuddleLamp Peephole");
});

});