/* <![CDATA[ */
(function ($) {

    "use strict";

    /* utils */
    let {PI, cos, sin, abs, random} = Math;
    const TAU = 2 * PI;
    let rand = n => n * random();
    let fadeInOut = (t, m) => {
        let hm = 0.5 * m;
        return abs((t + hm) % m - hm) / (hm);
    };

    let circleCount = 30;
    let circlePropCount = 8;
    let circlePropsLength = circleCount * circlePropCount;
    let baseSpeed = 0.5;
    let rangeSpeed = 1;
    let baseTTL = 150;
    let rangeTTL = 200;
    let baseRadius = 100;
    let rangeRadius = 200;
    let xOff = 0.0015;
    let yOff = 0.0015;
    let zOff = 0.0015;

    window.UT_Shift_Effect = class UT_Shift_Effect {

        constructor(el, callback) {

            this.container        = el;
            this.config           = JSON.parse( this.container.dataset.effectConfig );
            this.canvas           = '';
            this.ctx              = '';
            this.simplex          = '';
            this.circleProps      = '';

            $(this.container).css( 'mix-blend-mode' , this.config.blend_mode );

            this.createCanvas();
            this.resize();
            this.initCircles();
            this.draw();

            if( callback && typeof (callback) === "function" ) {

                callback(this);

            }

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

            this.container.appendChild( this.canvas.b );

            this.ctx = {
                a: this.canvas.a.getContext('2d'),
                b: this.canvas.b.getContext('2d')
            };

        }

        initCircles() {

            this.circleProps = new Float32Array(circlePropsLength );
            this.simplex = new SimplexNoise();

            let i;

            for (i = 0; i < circlePropsLength; i += circlePropCount) {
                this.initCircle(i);
            }

        }

        initCircle(i) {

            let x, y, n, t, speed, vx, vy, life, ttl, radius, hue;

            x = rand(this.canvas.a.width);
            y = rand(this.canvas.a.height);
            n = this.simplex.noise3D(x * xOff, y * yOff, this.config.hue.H * zOff);
            t = rand(TAU);
            speed = baseSpeed + rand(rangeSpeed);
            vx = speed * cos(t);
            vy = speed * sin(t);
            life = 0;
            ttl = baseTTL + rand(rangeTTL);
            radius = baseRadius + rand(rangeRadius);
            hue = this.config.hue.H + n * this.config.rangeHue;

            this.circleProps.set([x, y, vx, vy, life, ttl, radius, hue], i);

        }

        updateCircles() {

            let i;
            for (i = 0; i < circlePropsLength; i += circlePropCount) {
                this.updateCircle(i);
            }

        }

        updateCircle(i) {

            let i2 = 1 + i, i3 = 2 + i, i4 = 3 + i, i5 = 4 + i, i6 = 5 + i, i7 = 6 + i, i8 = 7 + i;
            let x, y, vx, vy, life, ttl, radius, hue;

            x = this.circleProps[i];
            y = this.circleProps[i2];
            vx = this.circleProps[i3];
            vy = this.circleProps[i4];
            life = this.circleProps[i5];
            ttl = this.circleProps[i6];
            radius = this.circleProps[i7];
            hue = this.circleProps[i8];

            this.drawCircle(x, y, life, ttl, radius, hue);

            life++;

            this.circleProps[i] = x + vx;
            this.circleProps[i2] = y + vy;
            this.circleProps[i5] = life;

            (this.checkBounds(x, y, radius) || life > ttl) && this.initCircle(i);
        }

        drawCircle(x, y, life, ttl, radius, hue) {
            this.ctx.a.save();
            this.ctx.a.fillStyle = `hsla(${hue},${this.config.hue.S}%,${this.config.hue.L}%,${fadeInOut(life, ttl)})`;
            this.ctx.a.beginPath();
            this.ctx.a.arc(x, y, radius, 0, TAU);
            this.ctx.a.fill();
            this.ctx.a.closePath();
            this.ctx.a.restore();
        }

        checkBounds(x, y, radius) {
            return (
                x < -radius ||
                x > this.canvas.a.width + radius ||
                y < -radius ||
                y > this.canvas.a.height + radius
            );
        }

        resize() {

            const {clientWidth, clientHeight} = this.container;

            this.canvas.a.width = clientWidth;
            this.canvas.a.height = clientHeight;

            this.ctx.a.drawImage(this.canvas.b, 0, 0);

            this.canvas.b.width = clientWidth;
            this.canvas.b.height = clientHeight;

            this.ctx.b.drawImage(this.canvas.a, 0, 0);

        }

        render() {
            this.ctx.b.save();
            this.ctx.b.filter = 'blur(50px)';
            this.ctx.b.drawImage(this.canvas.a, 0, 0);
            this.ctx.b.restore();
        }

        draw() {
            this.ctx.a.clearRect(0, 0, this.canvas.a.width, this.canvas.a.height);
            this.ctx.b.fillStyle = this.config.backgroundColor;
            this.ctx.b.fillRect(0, 0, this.canvas.b.width, this.canvas.b.height);
            this.updateCircles();
            this.render();
        }

    }

})(jQuery);
/* ]]> */