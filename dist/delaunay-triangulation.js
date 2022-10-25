(()=>{"use strict";function t(t,e,r){var s=function(t,e){var r=t.createShader(t.VERTEX_SHADER);if(t.shaderSource(r," attribute vec4 aVertexPosition;\n\nvoid main() {\n  gl_Position = aVertexPosition;\n}"),t.compileShader(r),t.getShaderParameter(r,t.COMPILE_STATUS))return r;console.log(t.getShaderInfoLog(r)),t.deleteShader(r)}(t),o=function(t,e){var r=t.createShader(t.FRAGMENT_SHADER);if(t.shaderSource(r,"precision mediump float;\nuniform vec4 vColor;\nuniform int point;\n\nvoid main() {\n\n  gl_FragColor = vColor;\n}\n\n"),t.compileShader(r),t.getShaderParameter(r,t.COMPILE_STATUS))return r;console.log(t.getShaderInfoLog(r)),t.deleteShader(r)}(t),i=function(t,e,r){var s=t.createProgram();if(t.attachShader(s,e),t.attachShader(s,r),t.linkProgram(s),t.getProgramParameter(s,t.LINK_STATUS))return s;console.log(t.getProgramInfoLog(s)),t.deleteProgram(s)}(t,s,o),a=t.getAttribLocation(i,"aVertexPosition"),n=t.getUniformLocation(i,"vColor"),h=t.getUniformLocation(i,"point"),p=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,p),r=function(t,e,r){for(var s=[],o=0;o<t.length;o+=2)for(var i=2*Math.PI/12,a=0;a<=2*Math.PI;a+=i)s=s.concat([t[o],t[o+1],Math.sin(a)*r+t[o],Math.cos(a)*r+t[o+1],Math.sin(a+i)*r+t[o],Math.cos(a+i)*r+t[o+1]]);return s}(r,0,.02);var u=e.concat(r);t.bufferData(t.ARRAY_BUFFER,new Float32Array(u),t.STATIC_DRAW),t.viewport(0,0,t.canvas.width,t.canvas.height),t.clearColor(.094,.094,.145,1),t.clear(t.COLOR_BUFFER_BIT),t.useProgram(i),t.enableVertexAttribArray(a),t.bindBuffer(t.ARRAY_BUFFER,p);var l=t.FLOAT,c=0;t.vertexAttribPointer(a,2,l,!1,0,c),t.uniform4f(n,.537,.706,.98,1),t.uniform1i(h,1);var f=t.LINES;c=0;var g=e.length/2;console.log(g),t.drawArrays(f,c,g),t.uniform4f(n,.953,.545,.659,1),t.uniform1i(h,1),f=t.TRIANGLES,c=e.length/2,g=r.length/2,t.drawArrays(f,c,g)}var e=function(){function t(t,e){this.x=t,this.y=e}return t.prototype.cmult=function(e){return new t(this.x*e,this.y*e)},t.prototype.add=function(e){return new t(this.x+e.x,this.y+e.y)},t.prototype.sub=function(t){return this.add(t.cmult(-1))},t.prototype.equals=function(t){return this.x==t.x&&this.y==t.y},t.prototype.mag=function(){return Math.sqrt(Math.pow(this.x,2)+Math.pow(this.y,2))},t.prototype.crossMag=function(t){return Math.abs(this.x*t.y-this.y*t.x)},t.prototype.dot=function(t){return this.x*t.x+this.y*t.y},t.prototype.pair=function(){return[this.x,this.y]},t}(),r=function(){function t(t,e,r){this.p1=t,this.p2=e,this.p3=r}return t.prototype.equals=function(t){return this.p1.equals(t.p1)&&this.p2.equals(t.p2)&&this.p3.equals(t.p3)||this.p1.equals(t.p1)&&this.p2.equals(t.p3)&&this.p3.equals(t.p2)||this.p1.equals(t.p2)&&this.p2.equals(t.p1)&&this.p3.equals(t.p3)||this.p1.equals(t.p2)&&this.p2.equals(t.p3)&&this.p3.equals(t.p1)||this.p1.equals(t.p3)&&this.p2.equals(t.p1)&&this.p3.equals(t.p2)||this.p1.equals(t.p3)&&this.p2.equals(t.p2)&&this.p3.equals(t.p1)},t.prototype.hasCommmonVertex=function(t){return this.p1.equals(t.p1)||this.p2.equals(t.p1)||this.p3.equals(t.p1)||this.p1.equals(t.p2)||this.p2.equals(t.p2)||this.p3.equals(t.p2)||this.p1.equals(t.p3)||this.p2.equals(t.p3)||this.p3.equals(t.p3)},t.prototype.getEdges=function(){return[[this.p1,this.p2],[this.p2,this.p3],[this.p3,this.p1]]},t.prototype.getCircumradius=function(){return this.p1.sub(this.p2).mag()*this.p2.sub(this.p3).mag()*this.p3.sub(this.p1).mag()/(2*this.p1.sub(this.p2).crossMag(this.p2.sub(this.p3)))},t.prototype.getCircumcenter=function(){var t=2*Math.pow(this.p1.sub(this.p2).crossMag(this.p2.sub(this.p3)),2),e=Math.pow(this.p2.sub(this.p3).mag(),2)*this.p1.sub(this.p3).dot(this.p1.sub(this.p2))/t,r=Math.pow(this.p1.sub(this.p3).mag(),2)*this.p2.sub(this.p3).dot(this.p2.sub(this.p1))/t,s=Math.pow(this.p1.sub(this.p2).mag(),2)*this.p3.sub(this.p1).dot(this.p3.sub(this.p2))/t;return this.p1.cmult(e).add(this.p2.cmult(r)).add(this.p3.cmult(s))},t.prototype.inCircumscribe=function(t){return this.getCircumcenter().sub(t).mag()<this.getCircumradius()},t.prototype.hasEdge=function(t,e){return(this.p1.equals(t)||this.p2.equals(t)||this.p3.equals(t))&&(this.p1.equals(e)||this.p2.equals(e)||this.p3.equals(e))&&!t.equals(e)},t}();function s(t,e){for(var r=0;r<t.length;r++)if(t[r].equals(e))return r;return-1}!function(){var o=document.querySelector("canvas"),i=o.getContext("webgl"),a=[],n=[];t(i,a,n);var h=document.getElementById("triangulate"),p=document.getElementById("clear");o.onmousedown=function(e){console.log("offsetX:"+e.offsetX),console.log("offsetY:"+e.offsetY);var r=(-o.width/2+e.offsetX)/(o.width/2),s=(o.height/2-e.offsetY)/(o.height/2);console.log("X: "+r),console.log("Y: "+s),n=n.concat([r,s]),t(i,a,n)},h.addEventListener("click",(function(){!function(o,i,a){void 0===a&&(a=!1);var n=[],h=[];if(i.length<2)return h;for(var p=i[0],u=p,l=i[1],c=l,f=0;f<i.length;f+=2)i[f]<p&&(p=i[f]),i[f]>u&&(u=i[f]),i[f+1]<l&&(l=i[f+1]),i[f+1]>c&&(c=i[f+1]),n.push(new e(i[f],i[f+1]));var g=u-p,m=c-l,d=new e(p-2-Math.floor(g/2),l-Math.floor(m/10)-1),v=new e(u+2+Math.floor(g/2),l-Math.floor(m/10)-1),q=new e(Math.floor((p+u)/2),c+1+m+Math.floor(m/2)),y=new r(d,v,q);h.push(y),y.getCircumcenter(),y.getCircumradius();for(var b=0,M=n;b<M.length;b++){for(var S=M[b],w=[],A=0,x=h;A<x.length;A++)(G=x[A]).inCircumscribe(S)&&w.push(G);for(var E=[],C=0,P=w;C<P.length;C++)for(var R=P[C],L=0,I=R.getEdges();L<I.length;L++){for(var T=I[L],_=!1,F=0,U=w;F<U.length;F++){var B=U[F];!R.equals(B)&&B.hasEdge(T[0],T[1])&&(_=!0)}_||E.push(T)}for(var V=0,Y=w;V<Y.length;V++)(H=s(h,G=Y[V]))>-1?h.splice(H,1):console.log("Unable to remove triangle from array!");for(var O=0,X=E;O<X.length;O++){var D=X[O];h.push(new r(D[0],D[1],S))}}for(var N=[],k=0;k<h.length;){var G;if((G=h[k]).hasCommmonVertex(y)){var H;(H=s(h,G))>-1?h.splice(H,1):console.log("Unable to remove triangle from array!")}else{for(var K=0,W=G.getEdges();K<W.length;K++)D=W[K],N.push(D[0].x,D[0].y,D[1].x,D[1].y);k++}}t(o,N,i)}(i,n)})),p.addEventListener("click",(function(){t(i,a=[],n=[])}))}()})();