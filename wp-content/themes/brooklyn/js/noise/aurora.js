/* <![CDATA[ */
(function($){

    "use strict";

    let {abs, round, random } = Math;
    let rand = n => n * random();
    let fadeInOut = (t, m) => {
        let hm = 0.5 * m;
        return abs((t + hm) % m - hm) / (hm);
    };

    let rayCount = 100;
    let rayPropCount = 8;
    let rayPropsLength = rayCount * rayPropCount;
    let baseLength = 200;
    let rangeLength = 200;
    let baseSpeed = 0.05;
    let rangeSpeed = 0.1;
    let baseWidth = 10;
    let rangeWidth = 20;
    let baseTTL = 50;
    let rangeTTL = 100;
    let noiseStrength = 100;
    let xOff = 0.0015;
    let yOff = 0.0015;
    let zOff = 0.0015;

    window.UT_Aurora_Effect = class UT_Aurora_Effect {

        constructor( el, callback ) {

            this.container        = el;
            this.config           = JSON.parse( this.container.dataset.effectConfig );
            this.canvas           = '';
            this.ctx              = '';
            this.center           = [];
            this.tick             = 0;
            this.simplex          = '';
            this.rayProps         = '';

            $(this.container).css( 'mix-blend-mode' , this.config.blend_mode );

            this.createCanvas();
            this.resize();
            this.initRays();
            this.draw();

            if( callback && typeof(callback) === "function" ) {

                callback( this );

            }

        }

        initRays() {

            this.simplex = new SimplexNoise();
            this.rayProps = new Float32Array(rayPropsLength);

            let i;

            for (i = 0; i < rayPropsLength; i += rayPropCount) {
                this.initRay(i);
            }

        }

        initRay(i) {

            let length, x, y1, y2, n, life, ttl, width, speed, hue;

            length = baseLength + rand(rangeLength);
            x = rand(this.canvas.a.width);
            y1 = this.center[1] + noiseStrength;
            y2 = this.center[1] + noiseStrength - length;
            n = this.simplex.noise3D(x * xOff, y1 * yOff, this.tick * zOff) * noiseStrength;
            y1 += n;
            y2 += n;
            life = 0;
            ttl = baseTTL + rand(rangeTTL);
            width = baseWidth + rand(rangeWidth);
            speed = baseSpeed + rand(rangeSpeed) * (round(rand(1)) ? 1 : -1);
            hue = this.config.hue.H + rand(this.config.rangeHue);

            this.rayProps.set([x, y1, y2, life, ttl, width, speed, hue], i);

        }

        drawRays() {

            let i;

            for (i = 0; i < rayPropsLength; i += rayPropCount) {
                this.updateRay(i);
            }

        }

        updateRay(i) {

            let i2 = 1 + i, i3 = 2 + i, i4 = 3 + i, i5 = 4 + i, i6 = 5 + i, i7 = 6 + i, i8 = 7 + i;
            let x, y1, y2, life, ttl, width, speed, hue;

            x = this.rayProps[i];
            y1 = this.rayProps[i2];
            y2 = this.rayProps[i3];
            life = this.rayProps[i4];
            ttl = this.rayProps[i5];
            width = this.rayProps[i6];
            speed = this.rayProps[i7];
            hue = this.rayProps[i8];

            this.drawRay(x, y1, y2, life, ttl, width, hue);

            x += speed;
            life++;

            this.rayProps[i] = x;
            this.rayProps[i4] = life;

            (this.checkBounds(x) || life > ttl) && this.initRay(i);
        }

        drawRay(x, y1, y2, life, ttl, width, hue) {
            let gradient;

            gradient = this.ctx.a.createLinearGradient(x, y1, x, y2);
            gradient.addColorStop(0, `hsla(${hue},${this.config.hue.S}%,${this.config.hue.L}%,0)`);
            gradient.addColorStop(0.5, `hsla(${hue},${this.config.hue.S}%,${this.config.hue.L}%,${fadeInOut(life, ttl)})`);
            gradient.addColorStop(1, `hsla(${hue},${this.config.hue.S}%,${this.config.hue.L}%,0)`);

            this.ctx.a.save();
            this.ctx.a.beginPath();
            this.ctx.a.strokeStyle = gradient;
            this.ctx.a.lineWidth = width;
            this.ctx.a.moveTo(x, y1);
            this.ctx.a.lineTo(x, y2);
            this.ctx.a.stroke();
            this.ctx.a.closePath();
            this.ctx.a.restore();
        }

        checkBounds(x) {
            return x < 0 || x > this.canvas.a.width;
        }

        createCanvas() {

            this.canvas = {
                a: document.createElement('canvas'),
                b: document.createElement('canvas')
            };
            this.canvas.b.style = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
            `;

            this.container.appendChild(this.canvas.b);

            this.ctx = {
                a: this.canvas.a.getContext('2d'),
                b: this.canvas.b.getContext('2d')
            };

        }

        resize() {

            const {clientWidth, clientHeight} = this.container;

            this.canvas.a.width = clientWidth;
            this.canvas.a.height = clientHeight;

            this.ctx.a.drawImage(this.canvas.b, 0, 0);

            this.canvas.b.width = clientWidth;
            this.canvas.b.height = clientHeight;

            this.ctx.b.drawImage(this.canvas.a, 0, 0);

            this.center[0] = 0.5 * this.canvas.a.width;
            this.center[1] = 0.5 * this.canvas.a.height;

        }

        render() {
            this.ctx.b.save();
            this.ctx.b.filter = 'blur(12px)';
            this.ctx.a.globalCompositeOperation = 'lighter';
            this.ctx.b.drawImage(this.canvas.a, 0, 0);
            this.ctx.b.restore();
        }

        draw() {

            this.tick++;
            this.ctx.a.clearRect(0, 0, this.canvas.a.width, this.canvas.a.height);
            this.ctx.b.fillStyle = this.config.backgroundColor;
            this.ctx.b.fillRect(0, 0, this.canvas.b.width, this.canvas.a.height);
            this.drawRays();
            this.render();

        }

    }

})(jQuery);
/* ]]> */