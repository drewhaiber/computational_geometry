(()=>{"use strict";function e(e,o,r){var t=function(e,o){var r=e.createShader(e.VERTEX_SHADER);if(e.shaderSource(r," attribute vec4 aVertexPosition;\n\nvoid main() {\n  gl_Position = aVertexPosition;\n}"),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS))return r;console.log(e.getShaderInfoLog(r)),e.deleteShader(r)}(e),a=function(e,o){var r=e.createShader(e.FRAGMENT_SHADER);if(e.shaderSource(r,"precision mediump float;\nuniform vec4 vColor;\nuniform int point;\n\nvoid main() {\n  //vec4 red = vec4(0.953, 0.545, 0.659, 1); // Catppuccin Mocha Red\n  //vec4 blue = vec4(0.537, 0.706, 0.980, 1);  // Catppuccin Mocha Blue\n\n  gl_FragColor = vColor;\n}\n\n"),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS))return r;console.log(e.getShaderInfoLog(r)),e.deleteShader(r)}(e),n=function(e,o,r){var t=e.createProgram();if(e.attachShader(t,o),e.attachShader(t,r),e.linkProgram(t),e.getProgramParameter(t,e.LINK_STATUS))return t;console.log(e.getProgramInfoLog(t)),e.deleteProgram(t)}(e,t,a),i=e.getAttribLocation(n,"aVertexPosition"),c=e.getUniformLocation(n,"vColor"),f=e.getUniformLocation(n,"point"),l=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,l),r=function(e,o,r){for(var t=[],a=0;a<e.length;a+=2)for(var n=2*Math.PI/12,i=0;i<=2*Math.PI;i+=n)t=t.concat([e[a],e[a+1],Math.sin(i)*r+e[a],Math.cos(i)*r+e[a+1],Math.sin(i+n)*r+e[a],Math.cos(i+n)*r+e[a+1]]);return t}(r,0,.02);var g=o.concat(r);e.bufferData(e.ARRAY_BUFFER,new Float32Array(g),e.STATIC_DRAW),e.viewport(0,0,e.canvas.width,e.canvas.height),e.clearColor(.094,.094,.145,1),e.clear(e.COLOR_BUFFER_BIT),e.useProgram(n),e.enableVertexAttribArray(i),e.bindBuffer(e.ARRAY_BUFFER,l);var h=e.FLOAT,s=0;e.vertexAttribPointer(i,2,h,!1,0,s),e.uniform4f(c,.537,.706,.98,1),e.uniform1i(f,1);var u=e.LINES,d=(s=0,o.length/2);console.log(d),e.drawArrays(u,s,d),e.uniform4f(c,.953,.545,.659,1),e.uniform1i(f,1),u=e.TRIANGLES,s=o.length/2,d=r.length/2,e.drawArrays(u,s,d)}var o,r,t,a;o=document.querySelector("canvas"),e(r=o.getContext("webgl"),t=[],a=[]),o.onmousedown=function(n){console.log("offsetX:"+n.offsetX),console.log("offsetY:"+n.offsetY);var i=(-o.width/2+n.offsetX)/(o.width/2),c=(o.height/2-n.offsetY)/(o.height/2);console.log("X: "+i),console.log("Y: "+c),a=a.concat([i,c]),e(r,t,a)}})();