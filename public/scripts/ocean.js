export function startOcean(canvas,getState,{isPaused=()=>false,onError=console.error,preserveDrawingBuffer=false}={}){
const gl=canvas.getContext('webgl',{alpha:false,preserveDrawingBuffer:preserveDrawingBuffer,antialias:false});
const vertex=`attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
const fragment=`precision highp float;
uniform vec2 resolution;uniform vec4 meteor;uniform float time,swell,detail,moon,stars,dither,palette,horizon,frameHeight;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
vec2 gradient(vec2 p){float a=hash(p)*6.283185;return vec2(cos(a),sin(a));}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*f*(f*(f*6.-15.)+10.);return mix(mix(dot(gradient(i),f),dot(gradient(i+vec2(1,0)),f-vec2(1,0)),u.x),mix(dot(gradient(i+vec2(0,1)),f-vec2(0,1)),dot(gradient(i+vec2(1)),f-vec2(1)),u.x),u.y);}
float height(vec2 p){
 vec2 direction=vec2(.16,.987);
 float travel=dot(p,direction);
 vec2 flow=p-direction*time*.9;
 float bend=noise(vec2(flow.x*.13,flow.y*.09))*.85;
 float phase=travel*.8-time*1.05+bend;
 float longWave=sin(phase)+.22*sin(phase*2.);
 float companion=sin(dot(p,vec2(-.22,.976))*1.35-time*1.42+bend*.7);
 float chop=sin(dot(p,vec2(.35,.937))*2.7-time*2.05+bend);
 float ripples=noise(vec2(flow.x*.65,flow.y*2.2));
 return swell*(longWave*.50+companion*.22+chop*.075+(.15+detail)*ripples*.18);
}
float bayer(vec2 p){vec2 a=mod(floor(p),2.);return (2.*a.x+3.*a.y-4.*a.x*a.y);}
void main(){
 vec2 sceneResolution=vec2(resolution.x,resolution.y*(frameHeight>0.?frameHeight:1.));
 vec2 scenePixel=gl_FragCoord.xy-vec2(0.,resolution.y-sceneResolution.y);
 vec2 uv=scenePixel/sceneResolution;vec2 q=(scenePixel-.5*sceneResolution)/sceneResolution.y;
 vec3 ro=vec3(0,2.8,0);vec3 rd=normalize(vec3(q.x,(uv.y-horizon)*.85,1.1));
 float lum=.035+.065*exp(-abs(uv.y-horizon)*8.);
 vec2 cells=floor(vec2(q.x,uv.y)*190.);vec2 local=fract(vec2(q.x,uv.y)*190.)-.5;
 float star=step(1.-stars*.018,hash(cells))*step(length(local),.24+hash(cells+4.)*.20);
 lum+=star*smoothstep(horizon+.015,horizon+.18,uv.y)*(.65+.6*hash(cells+2.));
 if(meteor.z>=0. && meteor.z<1.){
  float aspect=sceneResolution.x/sceneResolution.y;
  vec2 direction=normalize(vec2(meteor.w,-.38));
  vec2 head=vec2(meteor.x*aspect,meteor.y)+direction*meteor.z*.30;
  vec2 point=vec2(uv.x*aspect,uv.y);
  float trailLength=min(.12,aspect*.24);
  float along=clamp(dot(head-point,direction),0.,trailLength);
  float distanceToTrail=length(point-(head-direction*along));
  float width=1.1/sceneResolution.y;
  float trail=(1.-smoothstep(width*.25,width*1.3,distanceToTrail))*(1.-along/trailLength);
  float fade=smoothstep(0.,.10,meteor.z)*(1.-smoothstep(.55,1.,meteor.z));
  lum+=trail*fade*smoothstep(horizon+.01,horizon+.06,uv.y);
 }


 if(rd.y<0.){
  float t=-ro.y/rd.y; t=min(t,180.);
  for(int i=0;i<7;i++){vec3 p=ro+rd*t;t=mix(t,(height(p.xz)-ro.y)/rd.y,.65);t=clamp(t,0.,200.);}
  vec3 p=ro+rd*t;float h=height(p.xz);float e=.065;
  vec3 n=normalize(vec3(h-height(p.xz+vec2(e,0)),e,h-height(p.xz+vec2(0,e))));
  vec3 light=normalize(vec3(-.35,.42,.85));
  float diffuse=max(dot(n,light),0.);float spec=pow(max(dot(reflect(rd,n),light),0.),32.);
  float fres=pow(1.-max(dot(n,-rd),0.),3.);
  lum=.025+diffuse*.13+moon*spec*.85+fres*.075;
  lum=mix(lum,.105,1.-exp(-t*.006));
  lum=mix(.035+.065*exp(-abs(uv.y-horizon)*8.),lum,smoothstep(0.,.045,horizon-uv.y));
 }
 float threshold=(bayer(gl_FragCoord.xy)+bayer(floor(gl_FragCoord.xy/2.))/4.)/4.-.46875;
 float level=clamp(floor(lum*5.+threshold*dither)/4.,0.,1.);
 vec3 dark=vec3(.025,.043,.085), mid=vec3(.22,.32,.46), bright=vec3(.83,.88,.94);
 if(palette>.5&&palette<1.5){dark=vec3(.045,.025,.085);mid=vec3(.36,.26,.51);bright=vec3(.94,.80,.85);}
 if(palette>1.5&&palette<2.5){dark=vec3(.015,.045,.055);mid=vec3(.13,.32,.35);bright=vec3(.65,.85,.80);}
 if(palette>2.5){dark=vec3(.025,.055,.05);mid=vec3(.30,.49,.39);bright=vec3(.78,.87,.62);}
 gl_FragColor=vec4(level<.5?mix(dark,mid,level*2.):mix(mid,bright,(level-.5)*2.),1.);
}`;
let program;
try {
 if(!gl) throw Error('WebGL is unavailable in this browser. Try a browser with hardware acceleration enabled.');
 const compile=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
 program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);
 if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
 gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
 const pos=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
} catch(err){ onError(err); return; }
const uniforms=program?Object.fromEntries(['resolution','time','meteor',...Object.keys(getState())].map(k=>[k,gl.getUniformLocation(program,k)])):{};
let time=12,last=performance.now(),lastDraw=0,previous='';
let elapsed=0,nextMeteor=2+Math.random()*4,meteor=null;
function draw(now){
 const dt=Math.min((now-last)/1000,.05);last=now;
 if(!document.hidden&&!isPaused()){
  time+=dt*getState().speed;
  elapsed+=dt;
  if(elapsed>=nextMeteor){
   const horizon=getState().horizon;
   const direction=Math.random()<.5?-1:1;
   meteor={x:direction>0?.12+Math.random()*.45:.43+Math.random()*.45,
    y:horizon+.12+Math.random()*Math.max(0,.85-horizon),start:elapsed,direction};
   nextMeteor=elapsed+8+Math.random()*16;
  }
 }
 if(!document.hidden && now-lastDraw>=1000/30){
  const state=getState();

  const scale=Math.min(1,1000/(canvas.clientWidth/state.pixel),750/(canvas.clientHeight/state.pixel));
  const width=Math.max(1,Math.round(canvas.clientWidth/state.pixel*scale));
  const height=Math.max(1,Math.round(canvas.clientHeight/state.pixel*scale));
  const signature=JSON.stringify([state,width,height]);
  if(!isPaused()||signature!==previous){
   if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;gl.viewport(0,0,width,height);}
   gl.uniform2f(uniforms.resolution,width,height);gl.uniform1f(uniforms.time,time);
   gl.uniform4f(uniforms.meteor,meteor?.x??0,meteor?.y??0,
    meteor&&!isPaused()?elapsed-meteor.start:-1,meteor?.direction??1);
   for(const key of Object.keys(state))if(uniforms[key])gl.uniform1f(uniforms[key],state[key]);
   gl.drawArrays(gl.TRIANGLES,0,6);previous=signature;
  }
  lastDraw=now;
 }
 requestAnimationFrame(draw);
}
requestAnimationFrame(draw);
}
