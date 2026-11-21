/* Original procedural sound effects for Pawtopia's Battle Arena. */
(() => {
  'use strict';
  let context, output, texture, enabled=false;
  function setEnabled(value){
    enabled=false;
    if(!value){
      if(output)output.gain.setTargetAtTime(0,context.currentTime,.012);
      return false;
    }
    const Audio=window.AudioContext||window.webkitAudioContext;
    if(!Audio)return false;
    try{
      if(!context){
        context=new Audio();
        output=context.createGain();
        output.gain.value=0;
        const compressor=context.createDynamicsCompressor();
        compressor.threshold.value=-16;
        compressor.ratio.value=5;
        output.connect(compressor).connect(context.destination);
        texture=context.createBuffer(1,Math.ceil(context.sampleRate*.8),context.sampleRate);
        const samples=texture.getChannelData(0);
        let seed=0x83b317bc;
        for(let i=0;i<samples.length;i++){
          seed=(Math.imul(seed,1664525)+1013904223)>>>0;
          samples[i]=seed/2147483648-1;
        }
      }
      if(context.state!=='running')context.resume().catch(()=>{});
      output.gain.setTargetAtTime(.66,context.currentTime,.012);
      enabled=true;
    }catch{
      return false;
    }
    return enabled;
  }
  // Each cue is a short score. The body of a hit uses a low pitch drop,
  // while filtered texture and a second transient give it a physical edge.
  const kitSounds={
    spark:['triangle',420,1170,2500,'bandpass'],
    frost:['sine',920,2490,4900,'highpass'],
    leaf:['triangle',320,780,3000,'bandpass'],
    star:['sine',560,1510,4200,'highpass'],
    water:['sine',260,930,850,'lowpass'],
    wind:['sine',220,550,1500,'bandpass'],
    gear:['triangle',195,690,2150,'bandpass'],
    shadow:['sine',134,280,740,'lowpass']
  };
  const scores={
    enabled(v){v.bell(622,0,.15,.10);v.bell(932,.056,.15,.085);},
    step(v){
      v.tone('sine',115,54,0,.10,.16);
      v.noise('lowpass',430,170,.0,.12,.14,.006);
    },
    charge(v){
      v.noise('bandpass',240,800,0,.27,.18,.055);
      v.tone('triangle',52,106,0,.26,.15,.045);
      v.tone('sine',121,64,.135,.13,.16);
      v.noise('lowpass',530,280,.14,.12,.12,.004);
    },
    swipe(v){
      v.noise('bandpass',610,4100,0,.22,.22,.055);
      v.noise('highpass',2800,1300,.02,.12,.085,.027);
    },
    guard(v){
      v.noise('bandpass',560,1250,0,.17,.16,.018);
      v.bell(330,.008,.21,.11);
      v.bell(494,.029,.29,.075);
    },
    block(v){
      v.tone('triangle',276,135,0,.11,.18);
      v.noise('bandpass',2700,960,0,.17,.25,.003);
      v.bell(788,.012,.22,.105);
      v.bell(1247,.02,.15,.044);
    },
    hit(v,{heavy}){
      v.tone('sine',heavy?131:172,heavy?42:68,0,heavy ? .23:.14,heavy ? .33:.24,.004);
      v.noise('lowpass',heavy?900:1350,330,0,.21,heavy ? .28:.21,.003);
      v.noise('bandpass',2100,1050,.006,.10,.15,.002);
      if(heavy)v.tone('triangle',96,46,.057,.19,.12);
    },
    windup(v,{theme,ultimate}){
      const [wave,base,top,cut,filter]=kitSounds[theme]||kitSounds.spark;
      v.tone(wave,base*.47,base,0,ultimate ? .43:.29,.12,.074);
      v.noise(filter,cut*.52,cut,0,ultimate ? .40:.26,.125,.10);
      if(ultimate)v.bell(top*.49,.15,.26,.10);
    },
    cast(v,{theme,ultimate}){
      const [wave,base,top,cut,filter]=kitSounds[theme]||kitSounds.spark;
      v.noise(filter,cut*.6,cut,0,.25,.17,.035);
      v.tone(wave,base,top,.018,.22,.13,.029);
      v.bell(top*.77,.085,.24,.085);
      if(ultimate)v.bell(top,.14,.31,.088);
    },
    spellHit(v,options){
      const [,base,top]=kitSounds[options.theme]||kitSounds.spark;
      scores.hit(v,{heavy:options.ultimate});
      v.bell(base*1.22,.012,.24,.11);
      v.bell(top*.82,.06,.29,.085);
      if(options.ultimate)v.tone('sine',69,32,0,.34,.22,.012);
    },
    victory(v){
      [523.25,659.25,783.99,1046.50].forEach((note,i)=>v.bell(note,i*.085,.27,.105));
      v.bell(1318.51,.29,.33,.077);
    },
    defeat(v){
      v.tone('triangle',392,330,0,.23,.12,.024);
      v.tone('sine',311,246,.12,.27,.15,.028);
      v.tone('sine',196,98,.25,.34,.14,.025);
      v.noise('lowpass',410,160,0,.34,.085,.035);
    }
  };
  function play(cue,options={}){
    if(!enabled||!Object.hasOwn(scores,cue)||!context||context.state==='closed')return;
    try{
      const start=context.currentTime+.008;
      const rate=Math.max(.65,Math.min(3,options.speed||1));
      const side=options.side==='pet'?-.19:options.side==='foe' ? .19:0;
      function voice(source,filter,offset,length,level,attack=.008){
        const at=start+offset/rate, span=length/rate;
        const gain=context.createGain();
        const pan=context.createStereoPanner?.();
        gain.gain.setValueAtTime(.0001,at);
        gain.gain.linearRampToValueAtTime(level,at+Math.min(span*.5,attack/rate));
        gain.gain.exponentialRampToValueAtTime(.0001,at+span);
        (filter?source.connect(filter):source).connect(gain);
        if(pan){pan.pan.value=side;gain.connect(pan).connect(output);}
        else gain.connect(output);
        source.onended=()=>{source.disconnect();filter?.disconnect();gain.disconnect();pan?.disconnect();};
        source.start(at);
        source.stop(at+span+.008);
      }
      function tone(wave,from,to,delay,time,level,attack){
        const osc=context.createOscillator();
        osc.type=wave;
        osc.frequency.setValueAtTime(from,start+delay/rate);
        osc.frequency.exponentialRampToValueAtTime(to,start+(delay+time)/rate);
        voice(osc,null,delay,time,level,attack);
      }
      function noise(type,from,to,delay,time,level,attack){
        const buffer=context.createBufferSource(), filter=context.createBiquadFilter();
        buffer.buffer=texture;buffer.loop=true;
        filter.type=type;filter.Q.value=type==='bandpass' ? .85:.5;
        filter.frequency.setValueAtTime(from,start+delay/rate);
        filter.frequency.exponentialRampToValueAtTime(to,start+(delay+time)/rate);
        voice(buffer,filter,delay,time,level,attack);
      }
      function bell(note,delay,time,level){
        tone('sine',note,note,delay,time,level,.004);
        tone('sine',note*2.64,note*2.63,delay,time*.48,level*.29,.003);
      }
      scores[cue]({tone,noise,bell},options);
    }catch{}
  }
  window.PawtopiaBattleSound=Object.freeze({setEnabled,play});
})();
