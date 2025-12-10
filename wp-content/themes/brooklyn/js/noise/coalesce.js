/* <![CDATA[ */
(function ($) {

    "use strict";

    let { PI, cos, sin, abs, random, atan2 } = Math;
    let HALF_PI = 0.5 * PI;
    let rand = n => n * random();
    let fadeInOut = (t, m) => {
        let hm = 0.5 * m;
        return abs((t + hm) % m - hm) / (hm);
    };
    let angle = (x1, y1, x2, y2) => atan2(y2 - y1, x2 - x1);
    let lerp = (n1, n2, speed) => (1 - speed) * n1 + speed * n2;

    let particleCount = 700;
    let particlePropCount = 9;
    let particlePropsLength = particleCount * particlePropCount;
    let baseTTL = 100;
    let rangeTTL = 500;
    let baseSpeed = 0.1;
    let rangeSpeed = 1;
    let baseSize = 2;
    let rangeSize = 10;

    window.UT_Coalesce_Effect = class UT_Coalesce_Effect {

        constructor(el, callback) {

            this.container = el;
            this.config = JSON.parse(this.container.dataset.effectConfig);
            this.canvas = '';
            this.ctx = '';
            this.center = [];
            this.simplex = '';
            this.particleProps = '';

            $(this.container).css( 'mix-blend-mode' , this.config.blend_mode );

            this.createCanvas();
            this.resize();
            this.initParticles();
            this.draw();

            if (callback && typeof (callback) === "function") {

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

            this.container.appendChild(this.canvas.a);

            this.ctx = {
                a: this.canvas.a.getContext('2d'),
                b: this.canvas.b.getContext('2d')
            };

        }

        initParticles() {

            this.particleProps = new Float32Array(particlePropsLength);

            let i;

            for (i = 0; i < particlePropsLength; i += particlePropCount) {
                this.initParticle(i);
            }

        }

        initParticle(i) {

          let theta, x, y, vx, vy, life, ttl, speed, size, hue;

            x = rand(this.canvas.a.width);
            y = rand(this.canvas.a.height);
            theta = angle(x, y, this.center[0], this.center[1]);
            vx = cos(theta) * 6;
            vy = sin(theta) * 6;
            life = 0;
            ttl = baseTTL + rand(rangeTTL);
            speed = baseSpeed + rand(rangeSpeed);
            size = baseSize + rand(rangeSize);
            hue = this.config.hue.H + rand(this.config.rangeHue);

            this.particleProps.set([x, y, vx, vy, life, ttl, speed, size, hue], i);

        }

        drawParticles() {

            let i;

            for (i = 0; i < particlePropsLength; i += particlePropCount) {
                this.updateParticle(i);
            }

        }

        updateParticle(i) {

            let i2=1+i, i3=2+i, i4=3+i, i5=4+i, i6=5+i, i7=6+i, i8=7+i, i9=8+i;
            let x, y, theta, vx, vy, life, ttl, speed, x2, y2, size, hue;

            x = this.particleProps[i];
            y = this.particleProps[i2];
            theta = angle(x, y, this.center[0], this.center[1]) + 0.75 * HALF_PI;
            vx = lerp(this.particleProps[i3], 2 * cos(theta), 0.05);
            vy = lerp(this.particleProps[i4], 2 * sin(theta), 0.05);
            life = this.particleProps[i5];
            ttl = this.particleProps[i6];
            speed = this.particleProps[i7];
            x2 = x + vx * speed;
            y2 = y + vy * speed;
            size = this.particleProps[i8];
            hue = this.particleProps[i9];

            this.drawParticle(x, y, theta, life, ttl, size, hue);

            life++;

            this.particleProps[i] = x2;
            this.particleProps[i2] = y2;
            this.particleProps[i3] = vx;
            this.particleProps[i4] = vy;
            this.particleProps[i5] = life;

            life > ttl && this.initParticle(i);

        }

        drawParticle(x, y, theta, life, ttl, size, hue) {

            let xRel = x - (0.5 * size), yRel = y - (0.5 * size);

            this.ctx.a.save();
            this.ctx.a.lineCap = 'round';
            this.ctx.a.lineWidth = 1;
            this.ctx.a.strokeStyle = `hsla(${hue},${this.config.hue.S}%,${this.config.hue.L}%,${fadeInOut(life, ttl)})`;
            this.ctx.a.beginPath();
            this.ctx.a.translate(xRel, yRel);
            this.ctx.a.rotate(theta);
            this.ctx.a.translate(-xRel, -yRel);
            this.ctx.a.strokeRect(xRel, yRel, size, size);
            this.ctx.a.closePath();
            this.ctx.a.restore();

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

        render() {
            this.ctx.b.save();
            this.ctx.b.globalCompositeOperation = 'lighter';
            this.ctx.b.drawImage(this.canvas.a, 0, 0);
            this.ctx.b.restore();
        }

        draw() {

            this.ctx.a.clearRect(0, 0, this.canvas.a.width, this.canvas.a.height);

            this.ctx.b.fillStyle = this.config.backgroundColor;
            this.ctx.b.fillRect(0, 0, this.canvas.a.width, this.canvas.a.height);

            this.drawParticles();
            this.renderGlow();
            this.render();

        }

    }

})(jQuery);
/* ]]> */