import { Template } from 'meteor/templating';

import './body.html';

Template.content.onRendered(function() {

const canvas = document.querySelector('#peephole-canvas');
const canvasWidth = parseInt(window.getComputedStyle(canvas).width) // image width
const canvasHeight = parseInt(window.getComputedStyle(canvas).height) // image height

const presencesContainer = document.querySelector('#presences-container');
const presencesContainerWidth = parseInt(window.getComputedStyle(presencesContainer).width) // presence conta width
const presencesContainerHeight = parseInt(window.getComputedStyle(presencesContainer).height) // image height

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

        /**
           * Render presence location indicators for other presences. An indicator is
           * a blue line that points in the direction of the presence.
           *
           * @param {Object} presences Other presences.
           */
        renderPresences: function (presences) {

            // array for later removing presences that are not available anymore
            var currentIds = [];

            presences.forEach(function (presence) {

                if (presence.Type != "Display") return;

                var identity = parseInt(presence.Identity);
                var orientation = parseInt(presence.Orientation);

                // push id on array that indicates available presences
                currentIds.push(identity);

                var presence = presencesContainer.querySelector(`#presence-${identity}`);
                if (!presence) {
                    presence = document.createElement("div");
                    presence.setAttribute("id", `presence-${identity}`);
                    presence.setAttribute("presence-id", identity);
                    presence.classList.add("huddle-presence");
                    presencesContainer.appendChild(presence);
                }
                
                presence.style.transform = `rotate(${orientation}deg)`;
            });

            // removes all presences that are not available anymore
            $('.huddle-presence').each(function (index, value) {
                var presenceId = parseInt($(this).attr('presence-id'));
                if ($.inArray(presenceId, currentIds) < 0) {
                    window.console.log("Removed")
                    $(this).remove();
                }
            });
        },

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

                    // render presence indicators
                    Peephole.renderPresences(data.Presences);
                });
            huddle.connect(host, port);
        },
    };

    Peephole.hutHutHut("localhost", 1948, "HuddleLamp Peephole");
});

});