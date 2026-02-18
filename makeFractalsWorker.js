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


onmessage = e =>
{
    let that=e.data;
    that.func = new Function('z','c',`let y = new Complex(0,0); return ${that.fn};`);
    let img = [];
    if(that.mandelbrot)
    {
	img = makeMandelbrotSet(that);
    }
    else
    {
	img = makeJuliaSet(that);
    }

    
    postMessage(img);
}


			    
function makeMandelbrotSet(that)
{
    let img = [ ] ;
    let fn = that.func ;
    
    let xstep = (that.xmax-that.xmin)/that.width ;
    let ystep = (that.ymax-that.ymin)/that.height ;
    
    
    let z = new Complex(0,0) ;
    let c = new Complex(0,0) ;
    
    let xx = that.xmin;
    let yy = that.ymax;
    
    let j = 0 ;
    
    for(let i = 0 ; i < that.height ; ++i)
    {
	let x = xx;
	for(let r = 0 ; r < that.width ; ++r)
	{
	    z.re = 0;
	    z.im = 0;
	    
	    c.re = x;
	    c.im = yy;
	    
	    let N = 0;
	    
	    while(z.get_mod2() < 2 && N++ < that.max_iter)
	    {
		z = fn(z,c) ; 
	    }
	    
	    img[j++] = N;
	    x += xstep;
	}
	yy-=ystep;
    }
    return img;
}

function makeJuliaSet(that)
{
    let xstep = (that.xmax-that.xmin)/that.width ;
    let ystep = (that.ymax-that.ymin)/that.height ;
    
    let img = [ ];
    let fn = that.func;
    
    let z = new Complex(that.xmin,that.ymax) ;
    let c = that.c;
    
    let j = 0 ;
    
    let xx = that.xmin;
    let yy = that.ymax;
    
    for(let i = 0 ; i < that.height; ++i)
    {
	let x = xx;
	for(let r = 0 ; r < that.width ; ++r)
	{
	    z.re = x;
	    z.im = yy;
	    
	    
	    let N = 0;
	    
	    while(z.get_mod2() < 4 && N++ < that.max_iter)
	    {
		z = fn(z,c); 
	    }
	    
	    img[j++] = N;
	    x += xstep;
	}
	yy -= ystep;
    }
    return img;
}
