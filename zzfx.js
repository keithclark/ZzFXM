// zzfx() - the universal entry point -- returns a AudioBufferSourceNode
zzfx=(...t)=>zzfxP(zzfxG(...t))

// zzfxP() - the sound player -- returns a AudioBufferSourceNode
zzfxP=(...t)=>{let e=zzfxX.createBufferSource(),f=zzfxX.createBuffer(t.length,t[0].length,44100);t.map((d,i)=>f.getChannelData(i).set(d)),e.buffer=f,e.connect(zzfxX.destination),e.start();return e}

// zzfxG() - the sound generator -- returns an array of sample data
zzfxG=(a=1,t=.05,h=220,M=0,n=0,r=.1,s=0,i=1,z=0,f=0,m=0,o=0,x=0,b=0,d=0,u=0,e=0,G=1,I=0,P=2*Math.PI,V=44100,c=(a=>2*a*Math.random()-a),g=(a=>0<a?1:-1),j=(z*=500*P/V**2),k=g(d)*P/4,l=(h*=(1+c(t))*P/V),p=99+M*V|0,q=I*V|0,v=n*V|0,w=r*V|0,y=e*V|0,A=500*f*P/V**3,B=d*P/V,C=m*P/V,D=o*V,E=x*V,F=p+q+v+w+y,H=[],J=0,K=0,L=0,N=1,O=0,Q=0,R=0)=>{for(;L<F;H[L++]=R)++Q>100*u&&(Q=0,R=J*h*Math.sin(K*B-k),R=g(R=s?1<s?2<s?3<s?Math.sin((R%P)**3):Math.max(Math.min(Math.tan(R),1),-1):1-(2*R/P%2+2)%2:1-4*Math.abs(Math.round(R/P)-R/P):Math.sin(R))*Math.abs(R)**i,R*=a*zzfxV*(L<p?L/p:L<p+q?1-(L-p)/q*(1-G):L<p+q+v?G:L<F-y?(F-L-y)/w*G:0),R=y?R/2+(y>L?0:(L<F-y?1:(L-F)/y)*H[L-y]/2):R),J+=1+c(b),K+=1+c(b),h+=z+=A,N&&++N>D&&(h+=C,l+=C,N=0),E&&++O>E&&(h=l,z=j,O=1,N=N||1);return H};

// zzfxV - global volume
zzfxV=.3

// zzfxX - the common audio context
zzfxX=new(top.AudioContext||webkitAudioContext);