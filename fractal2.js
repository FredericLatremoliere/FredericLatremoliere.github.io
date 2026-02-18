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
    constructor (fractal_description_collection,color_description_collection, canvas_id,timeout)
    {
	this.canvas = document.getElementById(canvas_id);
	if(this.canvas)
	{
	    this.resizeCanvasToDisplaySize()
	    this.ctx = this.canvas.getContext("2d");
	    let bounding = this.canvas.getBoundingClientRect();
	    this.cleft = Math.round(bounding.left);
	    this.ctop = Math.round(bounding.top);
	    this.cright = Math.round(bounding.right);
	    this.cbottom = Math.round(bounding.bottom);
	    this.height = Math.round(bounding.height);
	    this.width = Math.round(bounding.width);

	    console.log(this.width, this.height);
	    
	    this.img = this.ctx.createImageData(this.width,this.height);
	    
	    this.axes = false;
	    this.box = false;
	    this.boxx = 0;
	    this.boxy = 0;
	    
	    this.xmin = -2;
	    this.xmax = 2;
	    this.ymin = -2;
	    this.ymax = 2;
	    
	    this.timeout = timeout;
	    this.timer_id = 0 ;
	    this.wait = false; 
	    
	    
	    this.collection = fractal_description_collection;
	    this.colorParams = color_description_collection;
	    this.n = fractal_description_collection.length;
	    this.ncolors = color_description_collection.length;
	    
	    this.clr = 0;
	    this.fractal = 0;
	    
	    
	    
	    // Set up the canvas

	    this.canvas.addEventListener("mouseenter", e=>
		{
		    if(!this.wait) { this.wait = true; clearTimeout(this.timer_id); }
		});
	    
	    this.canvas.addEventListener("mousemove",  e=>
		{
		    let x = e.clientX;
		    let y = e.clientY;
		    this.draw(e.clientX-this.cleft,e.clientY-this.ctop,true,this.box);
		});
	    
	    this.canvas.addEventListener("mousedown", e=>
		{
		    this.boxx = e.clientX - this.cleft;
		    this.boxy = e.clientY - this.ctop;
		    this.draw(this.boxx,this.boxy,true,true);    
		});
	    
	    this.canvas.addEventListener("mouseup", e =>
		{
		    this.axes=this.box=false;
		    let xpix, xxpix, ypix, yypix;
		    
		    let x = e.clientX - this.cleft;
		    let y = e.clientY - this.ctop;
		    
		    if(this.boxx>x)
		    {
			xpix = x;
			xxpix = this.boxx;
		    }
		    else
		    {
			xpix = this.boxx;
			xxpix = x;
		    }
		    
		    if(this.boxy>y)
		    {
			ypix = y;
			yypix = this.boxy;
		    }
		    else
		    {
			ypix = this.boxy;
			yypix = y;
		    }
		    
		    if(xxpix-xpix < 5 && yypix-ypix < 5)
		    {
			// Click
			console.log(this.xmin,this.xmax,this.ymin,this.ymax);
			this.wait=  false ; // unblock random rotation until refresh
			this.run();
		    }
		    else
		    {
			let w = (this.xmax-this.xmin) / this.width;
			let h = (this.ymax-this.ymin) / this.height;
			let xm = this.xmin;
			let ym = this.ymax;

			this.xmin = xm +  w * xpix;
			this.ymin = ym -  h * yypix;
		this.xmax = xm +  w * xxpix;
			this.ymax = ym -  h * ypix;
			
			this.makeFractal();
			this.draw(0,0,false,false);
		    }
		});

	    this.canvas.addEventListener("mouseleave", e=>
		{ this.draw(); if(this.wait) { this.wait = false; setTimeout(()=>{ this.run();},this.timeout); } } );

	    
	}
	else
	{
	    throw new Error(`Canvas ${canvas_id} not found on the page. Fractal factory was not created.`);
	}
	

    }


    resizeCanvasToDisplaySize() {
	// Get the size the browser is displaying the canvas in CSS pixels
	const displayWidth = this.canvas.clientWidth;
	const displayHeight = this.canvas.clientHeight;
	
	// Check if the canvas is not the same size as the display size
	if(this.canvas.width !== displayWidth || this.canvas.height !== displayHeight)
	{
	    // Make the canvas drawing buffer the same size as the display size
	    this.canvas.width = displayWidth;
	    this.canvas.height = displayHeight;
	}
    }
    
    run()
    {
	if(!this.wait)
	{
	    let worker = new Worker("./makeFractalWorker.js");
	    const data = {
		xmin: this.xmin,
		xmax: this.xmax,
		ymin: this.ymin,
		ymax: this.ymax,
		mandelbrot: this.mandelbrot,
		fn: this.fn,
		width: this.width,
		height: this.height,
		c: this.c,
	    }
	    this.chooseRandom(); console.log(this.clr, this.fractal);
	    worker.onmessage = e => { this.colorizeCollection(e.data); this.draw() };
	    worker.postMessage(data);
	    this.timer_id = setTimeout(() => { this.run(); },this.timeout);
	}
    }
    
    select(n,j)
    {
	let f = this.collection[n];
	this.fn = f.fn; // fns[f.fn] ||  fns["quadratic"];
	this.mandelbrot = f.mandelbrot;
	this.xmin = f.xmin || -2;
	this.xmax = f.xmax || 2;
	this.ymin = f.ymin || -2 ;
	this.ymax = f.ymax || 2;
	this.c = f.c || new Complex(0,0) ;
	this.max_iter = f.max_iter || 1000;
	this.clr = j;
	this.fractal = n;
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
	const n = this.max_iter;
	
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
	    const pos_str = `From: ${(this.xmin + this.boxx/this.width*(this.xmax-this.xmin)).toFixed(6)} + ${(this.ymax-this.boxy/this.height*(this.ymax-this.ymin)).toFixed(6)}i, To: ${(this.xmin + x/this.width*(this.xmax-this.xmin)).toFixed(6)} + ${(this.ymax-y/this.height*(this.ymax-this.ymin)).toFixed(6)} i`;
	    ctx.strokeText( pos_str, 10,10);
	}
	else if(ax)
	{
	    ctx.beginPath();
	    ctx.moveTo(0,y);
	    ctx.lineTo(this.width,y);
	    ctx.moveTo(x,0);
	    ctx.lineTo(x,this.height);
	    ctx.strokeStyle="red";
	    ctx.lineWidth = 1;
	    ctx.stroke();
	    ctx.font = "10px Arial";
	    const pos_str = `${(this.xmin + x/this.width*(this.xmax-this.xmin)).toFixed(6)} + ${(this.ymax-y/this.height*(this.ymax-this.ymin)).toFixed(6)}i`;
	    ctx.strokeText( pos_str, 10,10);
	    ctx.strokeText( "HOW TO USE: Drag to select a zoom area, click to return to random selection", 10, this.height-20);

	}
	this.axes = ax;
	this.box = bx;
    }


}




const myCollection =
      [

	  { fn: (z,c) => { return z.add(z.mul(z,z),c); },
	    xmin: -2,
	    xmax: 2,
	    ymin: -2,
	    ymax: 2,
	    c: new Complex(0.7885*Math.cos(3),0.7885*Math.sin(3)),
	    mandelbrot: false
	  },

	  { fn: (z,c) => { return z.add(z.mul(z,z),c); },
	    xmin: -2,
	    xmax: 2,
	    ymin: -2,
	    ymax: 2,
	    c: new Complex(0.7885*Math.cos(1.7),0.7885*Math.sin(1.7)),
	    mandelbrot: false
	  },


	  { fn: (z,c) => { return z.add(z.mul(z,z),c); },
	    xmin: -0.8509902413009751,
	    xmax: -0.06375619874778371,
	    ymin: -0.290829453623092,
	    ymax: 0.3706852295299219,
	    c: new Complex(0.7885*Math.cos(1.7),0.7885*Math.sin(1.7)),
	    mandelbrot: false
	  },

	  
	  { fn: (z,c) => { let y = new Complex(0,0); return z.add(y.mul(z,y.mul(z,z)),c); },
	    xmin: -2,
	    xmax: 2,
	    ymin: -2,
	    ymax: 2,
	    c: new Complex(0.7885*Math.cos(1.7),0.7885*Math.sin(1.7)),
	    mandelbrot: false
	  },

	  { fn: (z,c) => { return z.add(z.mul(z,z),c); }, // quadratic
	    xmin: -1.5,
	    xmax: 0.6,
	    ymin: -1.5,
	    ymax: 1.5,
	    mandelbrot: true
	  },

	  { fn: (z,c) => { let y = new Complex(0,0); return y.add(y.mul(z,y.mul(z,z)),c); }, // cubic
	    xmin: -1.5,
	    xmax: 1.5,
	    ymin: -1.5,
	    ymax: 1.5,
	    mandelbrot: true
	  },

	  { fn: (z,c) => { let y = new Complex(0,0); return y.add(y.mul(z,y.mul(z,y.mul(z,z))), c); }, // quartic
	    xmin: -1.5,
	    xmax: 1.5,
	    ymin: -1.5,
	    ymax: 1.5,
	    mandelbrot: true
	  },

	  
	  { fn: (z,c) => { let y = new Complex(0,0); return y.add(y.mul(z,y.mul(z,y.mul(z,y.mul(z,z)))),c) ; }, // quintic
	    xmin: -1.5,
	    xmax: 1.5,
	    ymin: -1.5,
	    ymax: 1.5,
	    mandelbrot: true
	  },
	  
	  { fn: (z,c) => { let y = new Complex(0,0); return y.add(y.mul(z,y.mul(z,y.mul(z,y.mul(z,y.mul(z,z))))),c); }, // hextic
	    xmin: -1.5,
	    xmax: 1.5,
	    ymin: -1.5,
	    ymax: 1.5,
	    mandelbrot: true
	  },

	  
	  { fn: (z,c) => { let y = new Complex(0,0); return y.add(y.mul(z,y.mul(z,y.mul(z,y.mul(z,y.mul(z,y.mul(z,z)))))),c); }, // heptic
	    xmin: -1.5,
	    xmax: 1.5,
	    ymin: -1.5,
	    ymax: 1.5,
	    mandelbrot: true
	  },

	  { fn: (z,c) => { let y = new Complex(0,0); return y.add(y.mul(z,y.mul(z,y.mul(z,y.mul(z,y.mul(z,y.mul(z,y.mul(z,z))))))),c); }, // octic
	    xmin: -1.5,
	    xmax: 1.5,
	    ymin: -1.5,
	    ymax: 1.5,
	    mandelbrot: true
	  },

	  
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

	  { red_base: 2000,
	    red_power: 1/2,
	    green_base: 2000,
	    green_power: 1/2,
	    blue_base: 1000,
	    blue_power: 1/4,
	  },

	  { red_base: 2000,
	    red_power: 1/4,
	    green_base: 3000,
	    green_power: 1/2,
	    blue_base: 1000,
	    blue_power: 1/4,
	  },

	  { red_base: 1200,
	    red_power: 1/4,
	    green_base: 3000,
	    green_power: 1/2,
	    blue_base: 1200,
	    blue_power: 1/4,
	  },

	  { red_base: 3000,
	    red_power: 1/3,
	    green_base: 3000,
	    green_power: 1/2,
	    blue_base: 2000,
	    blue_power: 1/4,
	  },

	  
      ];

function init(canvas_id)
{
    const fract1 = new ComplexFractalMaker(myCollection, myColors, canvas_id,10000);
    setTimeout(fract1.run(),100);
    return fract1;
}
