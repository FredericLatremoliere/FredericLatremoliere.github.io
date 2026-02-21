class Complex
{
    constructor (x,y) { this.set(x,y); };
    set(x,y) {  this.re = x; this.im = y; return this; };

    
    add(t1,t2) { return this.set(t1.re + t2.re, t1.im + t2.im); }
    sub(t1,t2) { return this.set(t1.re - t2.re, t1.im - t2.im); }
    conj(z)    { return this.set(z.re,-ze.im); }
    mul(f1,f2) { let x1 = f1.re; let x2 = f2.re;
		 return this.set( x1 * x2 - f1.im * f2.im, x1*f2.im + f1.im*x2) }
    get_mod2()  { return this.re*this.re + this.im*this.im; }
    get_mod()   { return Math.sqrt(this.get_mod2()); }
    mod2(z)     { return this.set(z.get_mod2(),0.0); }
    mod(z)      { return this.set(z.get_mod(), 0.0); }

    
    inv(z)      { let m = z.get_mod2();
		  return this.set(z.re/m, -z.im / m); }
    div(f1,f2)  { let m = z.get_mod2();
		  let x1 = f1.re;
		  let x2= f1.re;
		  return this.set((x1 * x2 - f1.im*f2.im)/m, (-x1 * f2.im - f1.im * x2)/m); }
    
    toPolar()   { return { r: this.get_mod(), theta: 2 * Math.atan(y / (x + r) ) }; }
    fromPolar(r,theta) { this.re = r * Math.cos(theta); this.im = r*Math.sin(theta); return this; }

    powInt(z,n) { this.re = 1;
		  this.im = 0;
		  for(let j = 0 ; j < n ; ++j)
		  { this.mul(this,z); }
		  return this; }

};

class ComplexFractalMaker
{
    constructor (fractal_description_collection,color_description_collection, canvas_id)
    {
	this.canvas = document.getElementById(canvas_id);
	if(this.canvas)
	{
	    this.resizeCanvasToDisplaySize();
		
	    this.ctx = this.canvas.getContext("2d");
	    this.bounding = this.canvas.getBoundingClientRect();
	    window.addEventListener("resize", e=>{ this.bounding = this.canvas.getBoundingClientRect(); });
		
		this.fractal =
		{
		    height : Math.round(this.bounding.height),
		    width : Math.round(this.bounding.width),
		    xmin : -2,
		    xmax : 2,
		    ymin : -2,
		    ymax : 2,
		    fn : "",
		    mandelbrot : true,
		    c: new Complex(0,0),
		    max_iter: 1000
		};

	    this.worker = new Worker("./makeFractalsWorker.js");
	    this.worker.onmessage = e => {
		this.colorizeCollection(e.data);
		this.draw() ;
		this.wait = false;
	    }

	    
	    this.img = this.ctx.createImageData(this.fractal.width,this.fractal.height);
	    
	    this.axes = false;
	    this.box = false;
	    this.boxx = 0;
	    this.boxy = 0;
	    
	    this.wait = false; 
	    
	    
	    this.collection = fractal_description_collection;
	    this.colorParams = color_description_collection;
	    this.n = fractal_description_collection.length;
	    this.ncolors = color_description_collection.length; 
	    
	    this.clr = 0;
	    
	    
	    
	    // Set up the canvas

this.canvas.addEventListener("mousemove", e => {
    if (!this.wait) {
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.round(e.clientX - rect.left);
        const y = Math.round(e.clientY - rect.top);
        
        this.draw(x, y, true, this.box);
    }
});

this.canvas.addEventListener("mousedown", e => {
    if (!this.wait) {
        const rect = this.canvas.getBoundingClientRect();
        this.boxx = Math.round(e.clientX - rect.left);
        this.boxy = Math.round(e.clientY - rect.top);
        this.draw(this.boxx, this.boxy, true, true);
    }
});

this.canvas.addEventListener("mouseup", e => {
    if (!this.wait) {
        this.axes = this.box = false;
        const rect = this.canvas.getBoundingClientRect();
        
        let x = Math.round(e.clientX - rect.left);
        let y = Math.round(e.clientY - rect.top);
        
        let xpix, xxpix, ypix, yypix;
        if (this.boxx > x) { xpix = x; xxpix = this.boxx; }
        else { xpix = this.boxx; xxpix = x; }

        if (this.boxy > y) { ypix = y; yypix = this.boxy; }
        else { ypix = this.boxy; yypix = y; }
        
        if (xxpix - xpix < 5 && yypix - ypix < 5) {
            this.run();
        } else {
            // Zoom logic using the fresh rect
            let frac = this.fractal;
            let w = (frac.xmax - frac.xmin) / frac.width;
            let h = (frac.ymax - frac.ymin) / frac.height;
            let xm = frac.xmin;
            let ym = frac.ymax;
            
            frac.xmin = xm + w * xpix;
            frac.ymin = ym - h * yypix;
            frac.xmax = xm + w * xxpix;
            frac.ymax = ym - h * yypix; // Note: You had a small typo here in original (yypix vs ypix)
            
            clearTimeout(this.timer_id);
            this.wait = false;
            this.computeScreen();
            this.worker.postMessage(this.fractal);
        }
    }
});
	
	    this.canvas.addEventListener("mouseleave", e=>
		{ if(!this.wait) { this.draw(); } }); 

	    
	}
	else
	{
	    throw new Error(`Canvas ${canvas_id} not found on the page. Fractal factory was not created.`);
	}
	

    }


    computeScreen()
    {
	let ctx = this.ctx;
	this.wait=true;
	ctx.clearRect(0,0,this.fractal.width,this.fractal.height);
	ctx.fillStyle = "black;"
	ctx.font = "20px Times";
	ctx.fillText( "Please wait as a new fractal is being computed...", 10,20);
    }
    
    resizeCanvasToDisplaySize() {
	const displayWidth = this.canvas.clientWidth;
	const displayHeight = this.canvas.clientHeight;
	
	if(this.canvas.width !== displayWidth || this.canvas.height !== displayHeight)
	{
	    this.canvas.width = displayWidth;
	    this.canvas.height = displayHeight;
	}
    }
    
    run()
    {
	if(!this.wait)
	{
	    this.chooseRandom();
	    this.computeScreen();
	    this.worker.postMessage(this.fractal);
	}
    }
    
    select(n,j)
    {
	let f = this.collection[n];
	let fractal=this.fractal;
	fractal.fn = f.fn; 
	fractal.mandelbrot = f.mandelbrot;
	fractal.xmin = f.xmin || -2;
	fractal.xmax = f.xmax || 2;
	fractal.ymin = f.ymin || -2 ;
	fractal.ymax = f.ymax || 2;
	fractal.c = f.c || new Complex(0,0) ;
	fractal.max_iter = f.max_iter || 5000;
	fractal.n = n;
	
	this.clr = j;
	this.makeColors();
    }

    
    
    chooseRandom() {
	this.select(Math.floor(Math.random()*this.n),Math.floor(Math.random()*this.ncolors));
    }
		     
    makeColors()
    {
	const clr = this.colorParams[this.clr];
	const red_base = clr.red_base;
	const red_pwr = clr.red_power;
	const green_base = clr.green_base;
	const green_pwr = clr.green_power;
	const blue_base = clr.blue_base;
	const blue_pwr = clr.blue_power;
	const n = this.fractal.max_iter;
	
	this.colors = [];
	for(let j = 0 ; j < n ; ++j)
	{
	    this.colors[j] = [ Math.round((Math.pow(j/n,red_pwr)*red_base) + 2)%256,
			       Math.round((Math.pow(j/n,green_pwr)*green_base) + 2)%256,
			       Math.round((Math.pow(j/n,blue_pwr) *blue_base)  + 2)%256  ];
	}
	
    }
    
    colorizeCollection(imgin)
    {
	const len = imgin.length;
	const colors = this.colors;
	let imgout = this.img.data;
	
	for(let j = 0 , k = 0 ; j < len ; ++j)
	{
	    let index = imgin[j];
	    if(index >= colors.length) index = colors.length-1;
	    let color = colors[index];
	    imgout[k++] = color[0];
	    imgout[k++] = color[1];
	    imgout[k++] = color[2];
	    imgout[k++] = 255;
	}
	return imgout;
    }
    
    
    
    draw(x=0,y=0,ax=false,bx=false)
    {
	let ctx=this.ctx;
	
	ctx.putImageData(this.img,0,0);
	if(this.box)
	{
	    ctx.strokeStyle="red";
	    ctx.lineWidth = 0.5;
	    ctx.strokeRect(this.boxx,this.boxy,x-this.boxx,y-this.boxy);
	    ctx.font = "10px Arial";
	    const pos_str = `From: ${(this.fractal.xmin + this.boxx/this.fractal.width*(this.fractal.xmax-this.fractal.xmin)).toFixed(6)} + ${(this.fractal.ymax-this.boxy/this.fractal.height*(this.fractal.ymax-this.fractal.ymin)).toFixed(6)}i, To: ${(this.fractal.xmin + x/this.fractal.width*(this.fractal.xmax-this.fractal.xmin)).toFixed(6)} + ${(this.fractal.ymax-y/this.fractal.height*(this.fractal.ymax-this.fractal.ymin)).toFixed(6)} i`;
	    ctx.fillStyle="red";
	    ctx.fillText( pos_str, 10,10);
	}
	else if(ax)
	{
	    ctx.beginPath();
	    ctx.moveTo(0,y);
	    ctx.lineTo(this.fractal.width,y);
	    ctx.moveTo(x,0);
	    ctx.lineTo(x,this.fractal.height);
	    ctx.strokeStyle="red";
	    ctx.lineWidth = 1;
	    ctx.stroke();
	    ctx.font = "10px Arial";
	    const pos_str = `${(this.fractal.xmin + x/this.fractal.width*(this.fractal.xmax-this.fractal.xmin)).toFixed(6)} + ${(this.fractal.ymax-y/this.fractal.height*(this.fractal.ymax-this.fractal.ymin)).toFixed(6)}i`;
	    ctx.fillStyle="red";
	    ctx.fillText( pos_str, 10,10);
	    ctx.fillText( "HOW TO USE: Drag to select a zoom area, click for a new fractal.", 10, this.fractal.height-20);

	}
	this.axes = ax;
	this.box = bx;
    }


}




const myCollection =
      [

	  { fn: "z.add(z.mul(z,z),c)",
	    xmin: -2,
	    xmax: 2,
	    ymin: -2,
	    ymax: 2,
	    c: new Complex(0.7885*Math.cos(3),0.7885*Math.sin(3)),
	    mandelbrot: false
	  },

	  { fn: "z.add(z.mul(z,z),c)",
	    xmin: -2,
	    xmax: 2,
	    ymin: -2,
	    ymax: 2,
	    c: new Complex(0.7885*Math.cos(1.7),0.7885*Math.sin(1.7)),
	    mandelbrot: false
	  },


	  { fn: "z.add(z.mul(z,z),c)",
	    xmin: -0.8509902413009751,
	    xmax: -0.06375619874778371,
	    ymin: -0.290829453623092,
	    ymax: 0.3706852295299219,
	    c: new Complex(0.7885*Math.cos(1.7),0.7885*Math.sin(1.7)),
	    mandelbrot: false
	  },

	  
	  { fn: "z.add(y.mul(z,y.mul(z,z)),c)",
	    xmin: -2,
	    xmax: 2,
	    ymin: -2,
	    ymax: 2,
	    c: new Complex(0.7885*Math.cos(1.7),0.7885*Math.sin(1.7)),
	    mandelbrot: false
	  },

	  { fn: "z.add(z.mul(z,z),c)", // quadratic
	    xmin: -1.5,
	    xmax: 0.6,
	    ymin: -1.5,
	    ymax: 1.5,
	    mandelbrot: true
	  },

	  { fn: "y.add(y.mul(z,y.mul(z,z)),c)", // cubic
	    xmin: -1.5,
	    xmax: 1.5,
	    ymin: -1.5,
	    ymax: 1.5,
	    mandelbrot: true
	  },

	  { fn: "y.add(y.mul(z,y.mul(z,y.mul(z,z))), c)", // quartic
	    xmin: -1.5,
	    xmax: 1.5,
	    ymin: -1.5,
	    ymax: 1.5,
	    mandelbrot: true
	  },

	  
	  { fn: "y.add(y.mul(z,y.mul(z,y.mul(z,y.mul(z,z)))),c)", // quintic
	    xmin: -1.5,
	    xmax: 1.5,
	    ymin: -1.5,
	    ymax: 1.5,
	    mandelbrot: true
	  },
	  
	  { fn: "y.add(y.mul(z,y.mul(z,y.mul(z,y.mul(z,y.mul(z,z))))),c)", // hextic
	    xmin: -1.5,
	    xmax: 1.5,
	    ymin: -1.5,
	    ymax: 1.5,
	    mandelbrot: true
	  },

	  
	  { fn: "y.add(y.mul(z,y.mul(z,y.mul(z,y.mul(z,y.mul(z,y.mul(z,z)))))),c)", // heptic
	    xmin: -1.5,
	    xmax: 1.5,
	    ymin: -1.5,
	    ymax: 1.5,
	    mandelbrot: true
	  },

	  { fn: "y.add(y.mul(z,y.mul(z,y.mul(z,y.mul(z,y.mul(z,y.mul(z,y.mul(z,z))))))),c)", // octic
	    xmin: -1.5,
	    xmax: 1.5,
	    ymin: -1.5,
	    ymax: 1.5,
	    mandelbrot: true
	  },

{
fn: "y.add(y.mul(z,y.mul(z,y.mul(z,y.mul(z,y.mul(z,y.mul(z,z)))))),c)",
mandelbrot: true,
max_iter: 5000,
xmax: -0.7078651685393259,
xmin: -0.8146067415730337,
ymax: 0.672573189522342,
ymin: 0.5986132511556239
},

{
fn: "y.add(y.mul(z,y.mul(z,z)),c)",
mandelbrot: true,
max_iter: 5000,
xmax: -0.061797752808988804,
xmin: -0.3707865168539326,
ymax: 1.199537750385208,
ymin: 0.9637904468412942,
},


{
fn: "y.add(y.mul(z,y.mul(z,z)),c)",
mandelbrot: true,
max_iter: 5000,
xmax: -0.19604006228169846,
xmin: -0.26258258637377435,
ymax: 1.1777429303349232,
ymin: 1.135243031236868,
},

{
fn: "y.add(y.mul(z,y.mul(z,y.mul(z,y.mul(z,y.mul(z,z))))),c)",
mandelbrot: true,
max_iter: 5000,
xmax: -0.5490468375205151,
xmin: -0.6056684762024998,
ymax: 0.3776379923124588,
ymin: 0.3393047499887226
},

{
c: new Complex (-0.7806090835694511,0.1112731263552053),
fn: "z.add(z.mul(z,z),c)",
mandelbrot: false,
max_iter: 5000,
xmax: -0.26217228464419473,
xmin: -0.7191011235955056,
ymax: 0.23112480739599373,
ymin: -0.1325115562403698,
},

{
c: new Complex(-0.7806090835694511,0.1112731263552053),
fn: "z.add(z.mul(z,z),c)",
mandelbrot: false,
max_iter: 5000,
xmax: -0.5856162942389429,
xmin: -0.6147091416628091,
ymax: 0.09160946911332113,
ymin: 0.07255918195825739,
},

{
 fn: "y.add(y.mul(z,y.mul(z,y.mul(z,z))), c)",
 mandelbrot: true,
 max_iter: 5000,
 xmax: -1.0366115389471027,
 xmin: -1.1752304002019947,
 ymax: 0.3038561162010536,
 ymin: 0.20493897212969575
},


{
 fn: "y.add(y.mul(z,y.mul(z,y.mul(z,z))), c)",
 mandelbrot: true,
 max_iter: 5000,
 xmax: -0.38896603964145937,
 xmin:-0.41901275091528845,
 ymax: 0.503385557014347,
 ymin: 0.48377021896909067
},


{
 c: new Complex (-0.10159388375202118, 0.7819277030417714),
 fn: "z.add(z.mul(z,z),c)",
 mandelbrot: false,
 max_iter: 5000,
 xmax: -0.2836687381525523,
 xmin: -0.2859627712550323,
 ymax: 0.5049808466653736,
 ymin: 0.5036669721996696
},

{
 fn: "y.add(y.mul(z,y.mul(z,y.mul(z,y.mul(z,z)))),c)",
 mandelbrot: true,
 max_iter: 5000,
 xmax: -0.5155554338753798,
 xmin: -0.5155585472270902,
 ymax: 0.7555840731995819,
 ymin: 0.7555824430082831
},

{
 c: new Complex (-0.10159388375202118, 0.7819277030417714),
 fn: "z.add(y.mul(z,y.mul(z,z)),c)",
 mandelbrot: false,
 max_iter: 5000,
 xmax: -0.23970037453183513,
 xmin: -0.696629213483146,
    ymax: -0.1510015408320493,
 ymin: -0.5208012326656397
},

{
 fn: "z.add(z.mul(z,z),c)",
 mandelbrot: true,
 max_iter: 5000,
 xmax: 0.0730337078651686,
 xmin: -0.25337078651685396,
 ymax: 1.12095531587057,
 ymin: 0.7742681047765793
},

{
 fn: "z.add(z.mul(z,z),c)",
 mandelbrot: true,
 max_iter: 5000,
 xmax: -0.12378697975844802,
 xmin: -0.16657408576358207,
 ymax: 0.8843105785598799,
 ymin: 0.8469175049441953
},

{
 fn: "z.add(z.mul(z,z),c)",
 mandelbrot: true,
 max_iter: 5000,
 xmax: -0.13819301017636984,
 xmin: -0.14063819344258086,
 ymax: 0.8571583684083105,
 ymin: 0.8558381254219521
},

{
 c: new Complex (-0.7806090835694511, 0.1112731263552053),
 fn: "z.add(z.mul(z,z),c)",
 mandelbrot: false,
 max_iter: 5000,
 xmax: 0.39700374531835214,
 xmin: -0.26217228464419473,
 ymax: 0.909090909090909,
 ymin: 0.3913713405238828
},


{
 c: new Complex (-0.7806090835694511, 0.1112731263552053),
 fn: "z.add(z.mul(z,z),c)",
 mandelbrot: false,
 max_iter: 5000,
 xmax: 0.0674157303370787,
 xmin: -0.10416754337976403,
 ymax: 0.6562140165859054,
 ymin: 0.5333653054005094
},

{
c: new Complex (-0.7806090835694511, 0.1112731263552053),
fn: "z.add(z.mul(z,z),c)",
mandelbrot: false,
max_iter: 5000,
xmax: -0.02940035202984312,
xmin: -0.033441852471222965,
ymax: 0.6031442751573616,
ymin: 0.5998761565856717
},

{
 c: new Complex (-0.7806090835694511, 0.1112731263552053),
 fn: "z.add(z.mul(z,z),c)",
 Mandelbrot: false,
 max_iter: 5000,
 xmax: -0.03197359201124602,
 xmin: -0.03211739071608912,
 ymax: 0.6017846572615893,
 ymin: 0.6016688379593568
}	  
      ];

const myColors =
      [
	  { red_base: 1000,
	    red_power: 1/3,
	    green_base: 1400,
	    green_power: 1/2,
	    blue_base: 2000,
	    blue_power: 1/2,
	  },

	  { red_base: 1000,
	    red_power: 1/2,
	    green_base: 0,
	    green_power: 1,
	    blue_base: 0,
	    blue_power: 1,
	  },
	  

	  { red_base: 500,
	    red_power: 0.7,
	    green_base: 300,
	    green_power: 0.7,
	    blue_base: 200,
	    blue_power: 0.5,
	  },

	  { red_base: 2000,
	    red_power: 1/4,
	    green_base: 3000,
	    green_power: 1/2,
	    blue_base: 1000,
	    blue_power: 1/4,
	  },

	  { red_base: 1000,
	    red_power: 1/4,
	    green_base: 3000,
	    green_power: 1/2,
	    blue_base: 1200,
	    blue_power: 1/4,
	  },

	  { red_base: 1000,
	    red_power: 1/3,
	    green_base: 3000,
	    green_power: 1/2,
	    blue_base: 2000,
	    blue_power: 1/2,
	  },
	  
      ];

function init(canvas_id)
{
    const fract1 = new ComplexFractalMaker(myCollection, myColors, canvas_id);
    fract1.run();
    return fract1;
}









