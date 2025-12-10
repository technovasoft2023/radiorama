/* <![CDATA[ */
(function ($) {

    "use strict";

    let { PI, cos, sin, abs, sqrt, pow, round, random, atan2 } = Math;
    let HALF_PI = 0.5 * PI;
    let TAU = 2 * PI;
    let TO_RAD = PI / 180;
    let rand = n => n * random();
    let fadeInOut = (t, m) => {
        let hm = 0.5 * m;
        return abs((t + hm) % m - hm) / (hm);
    };

    let pipeCount = 30;
    let pipePropCount = 8;
    let pipePropsLength = pipeCount * pipePropCount;
    let turnCount = 8;
    let turnAmount = (360 / turnCount) * TO_RAD;
    let turnChanceRange = 58;
    let baseSpeed = 0.5;
    let rangeSpeed = 1;
    let baseTTL = 100;
    let rangeTTL = 300;
    let baseWidth = 2;
    let rangeWidth = 4;

    window.UT_Pipeline_Effect = class UT_Pipeline_Effect {

          constructor( el, callback ) {

              this.container        = el;
              this.config           = JSON.parse( this.container.dataset.effectConfig );
              this.canvas           = '';
              this.ctx              = '';
              this.center           = [];
              this.tick             = 0;
              this.simplex          = '';
              this.pipeProps        = [];

              $(this.container).css( 'mix-blend-mode' , this.config.blend_mode );

              this.createCanvas();
              this.resize();
              this.initPipes();
              this.draw();

              if( callback && typeof(callback) === "function" ) {

                  callback( this );

              }

          }

          initPipes() {

              this.pipeProps = new Float32Array(pipePropsLength);

              let i;

              for (i = 0; i < pipePropsLength; i += pipePropCount) {
                this.initPipe(i);
              }

          }

          initPipe(i) {

              let x, y, direction, speed, life, ttl, width, hue;

              x = rand(this.canvas.a.width);
              y = this.center[1];
              direction = (round(rand(1)) ? HALF_PI : TAU - HALF_PI);
              speed = baseSpeed + rand(rangeSpeed);
              life = 0;
              ttl = baseTTL + rand(rangeTTL);
              width = baseWidth + rand(rangeWidth);
              hue = this.config.hue.H + rand(this.config.rangeHue);

              this.pipeProps.set([x, y, direction, speed, life, ttl, width, hue], i);

          }

          updatePipes() {

              this.tick++;

              let i;

              for (i = 0; i < pipePropsLength; i += pipePropCount) {
                  this.updatePipe(i);
              }

          }

          updatePipe(i) {

              let i2=1+i, i3=2+i, i4=3+i, i5=4+i, i6=5+i, i7=6+i, i8=7+i;
              let x, y, direction, speed, life, ttl, width, hue, turnChance, turnBias;

              x = this.pipeProps[i];
              y = this.pipeProps[i2];
              direction = this.pipeProps[i3];
              speed = this.pipeProps[i4];
              life = this.pipeProps[i5];
              ttl = this.pipeProps[i6]
              width = this.pipeProps[i7];
              hue = this.pipeProps[i8];

              this.drawPipe(x, y, life, ttl, width, hue);

              life++;
              x += cos(direction) * speed;
              y += sin(direction) * speed;
              turnChance = !(this.tick % round(rand(turnChanceRange))) && (!(round(x) % 6) || !(round(y) % 6));
              turnBias = round(rand(1)) ? -1 : 1;
              direction += turnChance ? turnAmount * turnBias : 0;

              this.pipeProps[i] = x;
              this.pipeProps[i2] = y;
              this.pipeProps[i3] = direction;
              this.pipeProps[i5] = life;

              life > ttl && this.initPipe(i);

          }

          drawPipe(x, y, life, ttl, width, hue) {

              this.ctx.a.save();
              this.ctx.a.strokeStyle = `hsla(${hue},${this.config.hue.S}%,${this.config.hue.L}%,${fadeInOut(life, ttl) * 0.125})`;
              this.ctx.a.beginPath();
              this.ctx.a.arc(x, y, width, 0, TAU);
              this.ctx.a.stroke();
              this.ctx.a.closePath();
              this.ctx.a.restore();

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
                this.ctx.b.fillStyle = this.config.backgroundColor;
                this.ctx.b.fillRect(0,0,this.canvas.b.width,this.canvas.b.height);
                this.ctx.b.restore();

                this.ctx.b.save();
                this.ctx.b.filter = 'blur(12px)'
                this.ctx.b.drawImage(this.canvas.a, 0, 0);
                this.ctx.b.restore();

                this.ctx.b.save();
                this.ctx.b.drawImage(this.canvas.a, 0, 0);
                this.ctx.b.restore();

          }

          draw() {
              this.updatePipes();
              this.render();
          }

    }

})(jQuery);
/* ]]> */