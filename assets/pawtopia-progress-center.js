/* Pawtopia's free local Quest & Progress Center. No accounts or paid APIs. */
(() => {
  'use strict';
  const save=window.PawtopiaSave,el=id=>document.getElementById(id);
  if(!save||!el('daily-quest-list'))return;
  const setFeedback=message=>{el('quest-feedback').textContent=message||'';};
  const add=(parent,tag,label,className)=>{
    const node=document.createElement(tag);
    if(className)node.className=className;
    if(label!==undefined)node.textContent=label;
    parent.append(node);return node;
  };
  function renderQuests(period,progress,journal){
    const target=el(period+'-quest-list');
    target.replaceChildren();
    const tasks=save.questDefs[period],claims=journal[period==='daily'?'claimedDaily':'claimedWeekly'];
    for(const task of tasks){
      const completed=(journal[period][task.id]||0)>=task.target;
      const claimed=claims.includes(task.id);
      const item=add(target,'article',undefined,'quest');
      const content=add(item,'div');
      add(content,'div',task.title,'quest-title');
      const amount=Math.min(task.target,journal[period][task.id]||0);
      add(content,'p',amount+' of '+task.target+' completed · '+task.coins+' Paw Coins reward','quest-detail');
      const bar=add(content,'progress');
      bar.max=task.target;bar.value=amount;
      bar.setAttribute('aria-label',task.title+' progress');
      const actions=add(item,'div',undefined,'quest-side');
      const button=add(actions,'button',claimed?'Collected':completed?'Claim '+task.coins+' coins':'Not ready');
      button.type='button';button.disabled=claimed||!completed||!progress.companion;
      button.addEventListener('click',async()=>{
        button.disabled=true;
        const result=await save.claimQuest(period,task.id);
        setFeedback(result.message);
        render();
      });
      const link=add(actions,'a','Go to activity');
      link.href=task.href;
    }
    const done=tasks.filter(task=>claims.includes(task.id)).length;
    el(period+'-summary').textContent=done+' of '+tasks.length+' rewards collected';
  }
  function render(){
    const p=save.read(),j=save.questJournal(p);
    const cats=[p.companion,...(Array.isArray(p.otherCompanions)?p.otherCompanions:[])].filter(Boolean);
    el('progress-pet').textContent=p.companion?p.companion.name+' · Lv '+(p.companion.stats?.level||1):'Adopt a cat first';
    el('progress-coins').textContent=Number.isSafeInteger(p.coins)?p.coins.toLocaleString():'0';
    el('progress-cats').textContent=String(cats.length);
    el('progress-rank').textContent=String(p.battleUnlocked||1);
    renderQuests('daily',p,j);renderQuests('weekly',p,j);
  }
  el('download-backup').addEventListener('click',()=>{
    try{
      const data=JSON.stringify(save.exportBackup(),null,2);
      const blob=new Blob([data],{type:'application/json'});
      const url=URL.createObjectURL(blob);
      const a=document.createElement('a');
      a.href=url;a.download='pawtopia-progress-'+new Date().toISOString().slice(0,10)+'.json';
      document.body.append(a);a.click();a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),5000);
      setFeedback('Backup prepared. Keep the downloaded file somewhere safe.');
    }catch{setFeedback('Download failed. Check your browser permissions and available storage.');}
  });
  el('restore-backup').addEventListener('click',async()=>{
    const file=el('restore-file').files?.[0];
    if(!file){setFeedback('Select a Pawtopia JSON backup file first.');return;}
    if(file.size>2*1024*1024){setFeedback('This file is too large to be a Pawtopia progress backup.');return;}
    try{
      const data=JSON.parse(await file.text());
      if(data?.format!=='pawtopia-progress-backup'||data.version!==1||!data.progress)
        throw Error('This is not a Pawtopia backup.');
      const previous=data.exportedAt?new Date(data.exportedAt):null;
      const when=previous&&!isNaN(previous.getTime())?previous.toLocaleString():'unknown date';
      const name=typeof data.progress.companion?.name==='string'?data.progress.companion.name:'no active cat';
      const okay=window.confirm('Restore backup from '+when+' for '+name+'? This REPLACES the current cats, coins, game progress and quest records in this browser. You cannot undo this without another backup.');
      if(!okay){setFeedback('Restore canceled. Your progress was not changed.');return;}
      const result=await save.restoreBackup(data);
      setFeedback(result.message);
      if(result.ok){el('restore-file').value='';render();}
    }catch(error){
      setFeedback(error instanceof Error?error.message:'The backup could not be read.');
    }
  });
  window.addEventListener('storage',render);
  window.addEventListener('pageshow',render);
  render();
})();