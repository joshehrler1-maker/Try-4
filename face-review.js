(()=>{'use strict';
const anchor=document.getElementById('inspect-suit');if(!anchor)return;
const button=document.createElement('button');button.type='button';button.textContent='Review detailed faces';anchor.before(button);
const dialog=document.createElement('dialog');dialog.setAttribute('aria-label','Detailed hero face review');dialog.style.cssText='width:min(96vw,1000px);height:90dvh;padding:10px;border:1px solid #9bbada;border-radius:14px;background:#090f24;color:white';
const close=document.createElement('button');close.type='button';close.textContent='Close review · return to game';
const frame=document.createElement('iframe');frame.title='Whisker and Luna face close-up';frame.style.cssText='width:100%;height:calc(100% - 56px);border:0';frame.allow='fullscreen';dialog.append(close,frame);document.body.append(dialog);
button.onclick=()=>{const pause=document.getElementById('pause');if(pause?.textContent.includes('Pause'))pause.click();frame.src='hero-models.html?view=face';dialog.showModal();};
close.onclick=()=>dialog.close();dialog.addEventListener('close',()=>{frame.src='about:blank';button.focus();});
})();
