/**
 * Original generative cinematic ambience.
 * No stock music, copyrighted audio, API, playback download or user tracking.
 * Starts ONLY after the viewer explicitly clicks Enter Experience.
 * Intentional subtlety: low output gain, ducks while the narrator speaks.
 */
export class Soundscape{
 private ctx:AudioContext|null=null;
 private master:GainNode|null=null;
 private filter:BiquadFilterNode|null=null;
 private oscillators:OscillatorNode[]=[];
 private voices:GainNode[]=[];
 private started=false;
 private muted=false;
 private narrating=false;
 private chapter=0;

 start(){
  if(this.started){void this.ctx?.resume();return}
  if(typeof window==='undefined'||!window.AudioContext)return;
  try{
   const ctx=new AudioContext({latencyHint:'playback'});
   const master=ctx.createGain();master.gain.value=0;
   const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=1050;filter.Q.value=.38;
   filter.connect(master);master.connect(ctx.destination);
   this.ctx=ctx;this.master=master;this.filter=filter;
   for(const [i,freq] of [110,164.81,220,329.63].entries()){
    const osc=ctx.createOscillator();osc.type=i===0?'sine':i===1?'triangle':'sine';osc.frequency.value=freq;osc.detune.value=i===1?-4:i===2?3:0;
    const gain=ctx.createGain();gain.gain.value=[.34,.11,.065,.024][i];
    osc.connect(gain);gain.connect(filter);osc.start();
    this.oscillators.push(osc);this.voices.push(gain);
   }
   const lfo=ctx.createOscillator();lfo.type='sine';lfo.frequency.value=.075;
   const lfoGain=ctx.createGain();lfoGain.gain.value=170;lfo.connect(lfoGain);lfoGain.connect(filter.frequency);lfo.start();
   this.oscillators.push(lfo);
   this.started=true;
   void ctx.resume().catch(()=>{});
   this.setChapter(this.chapter);this.setNarrating(false);
  }catch{/* Never block documentary if a browser denies Web Audio. */}
 }

 setMuted(muted:boolean){this.muted=muted;this.updateGain()}
 setNarrating(narrating:boolean){this.narrating=narrating;this.updateGain()}
 setChapter(index:number){
  this.chapter=index;if(!this.ctx||!this.filter)return;
  const now=this.ctx.currentTime;
  const base=110*Math.pow(2,([0,2,-2,5,0,3,-3,1,5,7,2,0][index%12])/12);
  const ratios=[1,1.4983,2,2.996];
  this.oscillators.slice(0,4).forEach((osc,i)=>osc.frequency.setTargetAtTime(base*ratios[i],now,.85));
  this.filter.frequency.setTargetAtTime(700+(index%4)*135,now,2.4);
  this.pulse();
 }
 private updateGain(){if(!this.ctx||!this.master)return;const goal=this.muted?0:this.narrating ? 0.014 : 0.042;this.master.gain.cancelScheduledValues(this.ctx.currentTime);this.master.gain.setTargetAtTime(goal,this.ctx.currentTime,.7)}
 private pulse(){
  if(!this.ctx||this.muted)return;
  const ctx=this.ctx;const length=Math.floor(ctx.sampleRate*.33);
  const buffer=ctx.createBuffer(1,length,ctx.sampleRate);
  const chan=buffer.getChannelData(0);
  let seed=4321;for(let i=0;i<length;i++){seed=(seed*1664525+1013904223)>>>0;const noise=seed/2147483648-1;chan[i]=noise*Math.pow(1-i/length,2)}
  const source=ctx.createBufferSource();source.buffer=buffer;
  const filter=ctx.createBiquadFilter();filter.type='bandpass';filter.frequency.value=680;filter.Q.value=.65;
  const gain=ctx.createGain();gain.gain.value=.0038;
  source.connect(filter);filter.connect(gain);gain.connect(ctx.destination);
  source.start();source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect()};
 }
 stop(){for(const o of this.oscillators){try{o.stop()}catch{/* Already stopped */}o.disconnect()}this.oscillators=[];this.voices=[];void this.ctx?.close().catch(()=>{});this.ctx=null;this.master=null;this.filter=null;this.started=false}
}
