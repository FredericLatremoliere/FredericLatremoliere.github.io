

onmessage = e =>
{
    let that=e.data;
    if(that.mandelbrot)
    {
	that.colorizeCollection(makeMandelbrotSet(that) );
    }
    else
    {
	that.colorizeCollection(makeJuliaSet(that));
    }

    postMessage();
}


			    
function makeMandelbrotSet(that)
{
    let img = [ ] ;
    let fn = that.fn ;
    
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
	    
	    while(z.get_mod2() < 2 && ++N < that.max_iter)
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

makeJuliaSet()
{
    let xstep = (that.xmax-that.xmin)/that.width ;
    let ystep = (that.ymax-that.ymin)/that.height ;
    
    let img = [ ];
    let fn = that.fn;
    
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
	    
	    while(z.get_mod2() < 4 && ++N < that.max_iter)
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

