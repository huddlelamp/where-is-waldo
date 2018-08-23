import { Template } from 'meteor/templating';

import './body.html';

const urlParams = new URLSearchParams(window.location.search);
const host = urlParams.get('host') || "localhost";
const port = +urlParams.get('port') || 1948;

Template.content.onRendered(function () {

    const canvas = document.querySelector('#peephole-canvas');
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const canvasWidth = parseInt(window.getComputedStyle(canvas).width) // image width
    const canvasHeight = parseInt(window.getComputedStyle(canvas).height) // image height

    const presencesContainer = document.querySelector('#presences-container');

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
                const location = proximity.Location;
                const x = location[0];
                const y = location[1];
                const angle = proximity.Orientation;

                const ratio = proximity.RgbImageToDisplayRatio;
                const scaleX = ((1 / ratio.X) * windowWidth) / canvasWidth;
                const scaleY = ((1 / ratio.Y) * windowHeight) / canvasHeight;
                // console.log({
                //     ratio,
                //     windowWidth,
                //     windowHeight,
                //     canvasWidth,
                //     canvasHeight,
                //     scaleX,
                //     scaleY
                // });
                // var scaleX = ((1 / ratio.X * windowWidth) / canvasWidth);
                // var scaleY = ((1 / ratio.Y * windowHeight) / canvasHeight);
                // console.log('ratio', ratio.X, ratio.Y);
                // console.log(ratio.X + ', ' + ratio.Y);

                const uniformScale = Math.max(scaleX, scaleY);

                const centerX = (canvasWidth * x) * uniformScale;
                const centerY = (canvasHeight * y) * uniformScale;

                let centerPoint = { x: centerX, y: centerY };
                // centerPoint = adjustCenterPoint(centerPoint);

                // scaleTransform.centerPoint.x = centerPoint.x;
                // scaleTransform.centerPoint.y = centerPoint.y;
                scaleTransform.set(uniformScale, uniformScale);

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
                const currentIds = [];

                presences.forEach(function (presence) {

                    if (presence.Type != "Display") return;

                    let identity = parseInt(presence.Identity);
                    let orientation = parseInt(presence.Orientation);

                    // push id on array that indicates available presences
                    currentIds.push(identity);

                    let presenceElement = presencesContainer.querySelector(`#presence-${identity}`);
                    if (!presenceElement) {
                        presenceElement = document.createElement("div");
                        presenceElement.setAttribute("id", `presence-${identity}`);
                        presenceElement.setAttribute("presence-id", identity);
                        presenceElement.classList.add("huddle-presence");
                        presencesContainer.appendChild(presenceElement);
                    }
                    presenceElement.style.transform = `rotate(${orientation}deg)`;
                });

                // removes all presences that are not available anymore
                const presenceElements = document.querySelectorAll('.huddle-presence');
                Array.from(presenceElements).forEach((presenceElement) => {
                    const presenceId = +presenceElement.getAttribute("presence-id");
                    if (!currentIds.includes(presenceId)) {
                        presenceElement.remove();
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

        Peephole.hutHutHut(host, port, "HuddleLamp Peephole");
    });
});