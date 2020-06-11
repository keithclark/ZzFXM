// zzfx() - the universal entry point -- returns a AudioBufferSourceNode
zzfx=(...t)=>zzfxP(zzfxG(...t))

// zzfxP() - the sound player -- returns a AudioBufferSourceNode
zzfxP=t=>{let e=zzfxX.createBufferSource(),f=zzfxX.createBuffer(1,t.length,44100);f.getChannelData(0).set(t),e.buffer=f,e.connect(zzfxX.destination),e.start();return e}

// zzfxG() - the sound generator -- returns an array of sample data
zzfxG=(t=1,e=.05,f=220,z=0,a=0,n=.1,r=0,h=1,x=0,l=0,o=0,s=0,M=0,c=0,i=0,u=0,d=0,g=2*Math.PI,X=44100,$=(t=>2*t*Math.random()-t),b=(t=>t>0?1:-1),m=(x*=500*g/X**2),G=(f*=(1+$(e))*g/X),P=b(i)*g/4,p=[],B=0,C=0,E=0,V=1,w=0,A=0,D=0,I=.5,S)=>{for(l*=500*g/X**3,S=(z=99+z*X|0)+(a=a*X|0)+(n=n*X|0)+(d=d*X|0),i*=g/X,o*=g/X,s*=X,M*=X;E<S;p[E++]=D)++A>100*u&&(A=0,D=B*f*Math.sin(C*i-P),D=b(D=r?r>1?r>2?r>3?Math.sin((D%g)**3):Math.max(Math.min(Math.tan(D),1),-1):1-(2*D/g%2+2)%2:1-4*Math.abs(Math.round(D/g)-D/g):Math.sin(D))*Math.abs(D)**h,D*=t*zzfxV*(E<z?E/z:E<z+a?1:E<S-d?1-(E-z-a)/n:0),D=d?D/2+(d>E?0:(E<S-d?1:(E-S)/d)*p[E-d]/2):D),B+=1+$(c),C+=1+$(c),f+=x+=l,V&&++V>s&&(f+=o,G+=o,V=0),M&&++w>M&&(f=G,x=m,w=1,V=V||1);return p}

// zzfxV - global volume
zzfxV=.3

// zzfxX - the common audio context
zzfxX=new(top.AudioContext||webkitAudioContext);