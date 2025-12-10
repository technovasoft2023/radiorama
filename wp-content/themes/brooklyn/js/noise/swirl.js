/* <![CDATA[ */
(function($){

    "use strict";

    /* utils */
    let {PI, cos, sin, abs, random} = Math;
    let TAU = 2 * PI;
    let rand = n => n * random();
    let randRange = n => n - rand(2 * n);
    let fadeInOut = (t, m) => {
        let hm = 0.5 * m;
        return abs((t + hm) % m - hm) / (hm);
    };
    let lerp = (n1, n2, speed) => (1 - speed) * n1 + speed * n2;

    /* environment */
    let particleCount = 700;
    let particlePropCount = 9;
    let particlePropsLength = particleCount * particlePropCount;
    let rangeY = 100;
    let baseTTL = 50;
    let rangeTTL = 150;
    let baseSpeed = 0.1;
    let rangeSpeed = 2;
    let baseRadius = 1;
    let rangeRadius = 4;
    let noiseSteps = 8;
    let xOff = 0.00125;
    let yOff = 0.00125;
    let zOff = 0.0005;

    window.UT_Swirl_Effect = class UT_Swirl_Effect {

        constructor( el, callback ) {

            this.container        = el;
            this.config           = JSON.parse( this.container.dataset.effectConfig );
            this.canvas           = '';
            this.ctx              = '';
            this.center           = [];
            this.tick             = 0;
            this.simplex          = '';
            this.particleProps    = '';

            $(this.container).css( 'mix-blend-mode' , this.config.blend_mode );

            this.createCanvas();
            this.resize();
            this.initParticles();
            this.draw();

            if( callback && typeof(callback) === "function" ) {

                callback( this );

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

            this.container.appendChild(this.canvas.a);

            this.ctx = {
                a: this.canvas.a.getContext('2d'),
                b: this.canvas.b.getContext('2d')
            };

        }

        initParticles() {

            this.simplex = new SimplexNoise();
            this.particleProps = new Float32Array(particlePropsLength);

            let i;

            for (i = 0; i < particlePropsLength; i += particlePropCount) {
                this.initParticle(i);
            }

        }

        initParticle(i) {

            let x, y, vx, vy, life, ttl, speed, radius, hue;

            x = rand(this.canvas.a.width);
            y = this.center[1] + randRange(rangeY);
            vx = 0;
            vy = 0;
            life = 0;
            ttl = baseTTL + rand(rangeTTL);
            speed = baseSpeed + rand(rangeSpeed);
            radius = baseRadius + rand(rangeRadius);
            hue = this.config.hue.H + rand(this.config.rangeHue);

            this.particleProps.set([x, y, vx, vy, life, ttl, speed, radius, hue], i);

        }

        drawParticles() {

            let i;

            for (i = 0; i < particlePropsLength; i += particlePropCount) {
                this.updateParticle(i);
            }

        }

        updateParticle(i) {

            let i2 = 1 + i, i3 = 2 + i, i4 = 3 + i, i5 = 4 + i, i6 = 5 + i, i7 = 6 + i, i8 = 7 + i, i9 = 8 + i;
            let n, x, y, vx, vy, life, ttl, speed, x2, y2, radius, hue;

            x = this.particleProps[i];
            y = this.particleProps[i2];
            n = this.simplex.noise3D(x * xOff, y * yOff, this.tick * zOff) * noiseSteps * TAU;
            vx = lerp(this.particleProps[i3], cos(n), 0.5);
            vy = lerp(this.particleProps[i4], sin(n), 0.5);
            life = this.particleProps[i5];
            ttl = this.particleProps[i6];
            speed = this.particleProps[i7];
            x2 = x + vx * speed;
            y2 = y + vy * speed;
            radius = this.particleProps[i8];
            hue = this.particleProps[i9];

            this.drawParticle(x, y, x2, y2, life, ttl, radius, hue);

            life++;

            this.particleProps[i] = x2;
            this.particleProps[i2] = y2;
            this.particleProps[i3] = vx;
            this.particleProps[i4] = vy;
            this.particleProps[i5] = life;

            (this.checkBounds(x, y) || life > ttl) && this.initParticle(i);

        }

        drawParticle(x, y, x2, y2, life, ttl, radius, hue) {

            this.ctx.a.save();
            this.ctx.a.lineCap = 'round';
            this.ctx.a.lineWidth = radius;
            this.ctx.a.strokeStyle = `hsla(${hue},${this.config.hue.S}%,${this.config.hue.L}%,${fadeInOut(life, ttl)})`;
            this.ctx.a.beginPath();
            this.ctx.a.moveTo(x, y);
            this.ctx.a.lineTo(x2, y2);
            this.ctx.a.stroke()
            this.ctx.a.closePath();
            this.ctx.a.restore();

        }

        checkBounds(x, y) {
            return (
                x > this.canvas.a.width ||
                x < 0 ||
                y > this.canvas.a.height ||
                y < 0
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

            this.center[0] = 0.5 * this.canvas.a.width;
            this.center[1] = 0.5 * this.canvas.a.height;

        }

        renderGlow() {

            this.ctx.b.save();
            this.ctx.b.filter = 'blur(8px) brightness(200%)';
            this.ctx.b.globalCompositeOperation = 'lighter';
            this.ctx.b.drawImage(this.canvas.a, 0, 0);
            this.ctx.b.restore();

            this.ctx.b.save();
            this.ctx.b.filter = 'blur(4px) brightness(200%)';
            this.ctx.b.globalCompositeOperation = 'lighter';
            this.ctx.b.drawImage(this.canvas.a, 0, 0);
            this.ctx.b.restore();

        }

        renderToScreen() {

            this.ctx.b.save();
            this.ctx.b.globalCompositeOperation = 'lighter';
            this.ctx.b.drawImage(this.canvas.a, 0, 0);
            this.ctx.b.restore();

        }

        draw() {

            this.tick++;

            this.ctx.a.clearRect(0, 0, this.canvas.a.width, this.canvas.a.height);
            this.ctx.b.fillStyle = this.config.backgroundColor;
            this.ctx.b.fillRect(0, 0, this.canvas.a.width, this.canvas.a.height);

            this.drawParticles();
            this.renderGlow();
            this.renderToScreen();

        }

    }

})(jQuery);
/* ]]> */