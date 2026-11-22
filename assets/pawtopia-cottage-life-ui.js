(() => {
  'use strict';
  const save = window.PawtopiaSave, life = window.PawtopiaLife, market = window.PawtopiaItems;
  const stock = window.PawtopiaShopStock, art = window.PawtopiaItemArt;
  const byId = id => document.getElementById(id);
  const status = byId('life-status');
  const itemURL = item => 'pawtopia-items.html?item='+encodeURIComponent(item.id)+'#item-'+encodeURIComponent(item.id);
  const getList = value => Array.isArray(value) ? value : [];
  function add(parent, tag, label='', className='') {
    const element = document.createElement(tag);
    element.textContent = label;
    if (className) element.className = className;
    parent.append(element);
    return element;
  }
  function link(parent,label,href) { add(parent,'a',label).href=href; }
  function button(parent,label,change,disabled=false) {
    const el=add(parent,'button',label);
    el.type='button';
    el.disabled=disabled;
    el.addEventListener('click',async () => {
      el.disabled=true;
      status.textContent=await save.update(change);
      render();
      status.focus({preventScroll:true});
    });
  }
  function icon(parent,item) {
    if (art && item) art.mount(add(parent,'span','','item-illustration'),item);
  }
  function card(parent,title,detail) {
    const el=add(parent,'article','','life-card');
    add(el,'h3',title);
    if (detail) add(el,'p',detail);
    return el;
  }
  function empty(parent) {
    link(parent,'Choose or adopt a cat at the Cottage','pawtopia-companions.html#companion-care');
  }
  function render() {
    const progress=save.read(), cat=progress.companion;
    for (const node of document.querySelectorAll('[data-life-output]')) node.replaceChildren();
    const profile=byId('life-profile-output');
    const journal=byId('life-collection-output');
    const careers=byId('life-careers-output');
    const room=byId('life-room-output');
    if (cat) {
      const pet=card(profile,cat.name,cat.breed+' · Level '+(save.battleStats(cat).level||1));
      const portrait=add(pet,'span','','life-portrait');
      const sprite = window.PawtopiaBattleData?.kitFor(cat.breed).sprite;
      if (sprite) {
        portrait.setAttribute('role','img');
        portrait.setAttribute('aria-label',cat.breed+' portrait');
        portrait.style.backgroundImage='url("'+sprite.src+'")';
        portrait.style.backgroundSize=sprite.backgroundSize;
        portrait.style.backgroundPosition=sprite.backgroundPosition;
      } else portrait.remove();
      const label=add(pet,'label','About this cat');
      const bio=add(label,'textarea');bio.maxLength=240;bio.value=typeof cat.bio==='string'?cat.bio:'';
      button(pet,'Save bio',p=>{
        if (!p.companion || p.companion.name!==cat.name || p.companion.breed!==cat.breed) return 'Your active cat changed. Open its profile again.';
        p.companion.bio=bio.value.trim().slice(0,240);
        return 'Bio saved to this cat’s profile.';
      });
      add(pet,'p',getList(cat.battle?.trophies).length?'Battle trophies · '+cat.battle.trophies.join(' · '):'Battle trophies appear here as your cat earns them.');
      const display=market.byId.get(cat.cottageRoom?.[3]);
      if (display && market.stock(progress,display.id)) {
        icon(pet,display);
        add(pet,'p','Favorite keepsake on display · '+display.name);
      }
      for (const [category,title] of Object.entries(life.categories)) {
        const seen=life.collection(cat,category);
        const total=market.items.filter(item=>item.category===category).length;
        const panel=card(journal,title,seen.length+' of '+total+' discovered');
        const goal=[3,10,25,50][cat.collectionMilestones?.[category]||0];
        if (goal) button(panel,'Claim '+goal+'-item milestone',p=>life.claimCollection(p,category),seen.length<goal);
        const details=add(panel,'details');
        add(details,'summary','View collection checklist');
        details.addEventListener('toggle',()=>{
          if (!details.open || details.querySelector('ul')) return;
          const ids=new Set(seen);
          const entries=add(details,'ul');
          for (const item of market.items.filter(item=>item.category===category)) {
            const row=add(entries,'li',ids.has(item.id)?'Discovered · ':'To discover · ');
            link(row,item.name,itemURL(item));
          }
        });
      }
      const stats=save.battleStats(cat);
      for (const [id,job] of Object.entries(life.careers)) {
        const shifts=cat.careers?.[id]||0, value=stats[job.stat];
        const rank=shifts>=8 && value>=8?3:shifts>=3 && value>=5?2:1;
        const panel=card(careers,job.name,value>=3?'Rank '+rank+' · '+shifts+' completed shifts':'Unlock at 3 '+job.stat+' · current '+value);
        add(panel,'p',rank===3?'Top rank reached.':rank===2?'Next promotion at 8 shifts and 8 '+job.stat+'.':'Promotion at 3 shifts and 5 '+job.stat+'.');
        button(panel,'Work a shift',p=>life.shift(p,id),value<3||cat.lastCareerShift===life.day());
      }
      add(careers,'p','Each cat can work one shift per day.');
      const slots=add(room,'div','','life-room');
      life.roomSlots.forEach((name,i)=>{
        const item=market.byId.get(cat.cottageRoom?.[i]);
        const spot=card(slots,name);
        if (item && market.stock(progress,item.id)) icon(spot,item);
        const label=add(spot,'label',i===3?'Keepsake':'Furnishing');
        const select=add(label,'select');
        add(select,'option','Empty').value='';
        const category=i===3?'Collectible':'Furnishing';
        for (const entry of market.items.filter(entry=>entry.category===category && market.stock(progress,entry.id))) {
          const option=add(select,'option',entry.name);option.value=entry.id;option.selected=item?.id===entry.id;
        }
        button(spot,'Place item',p=>life.place(p,i,select.value));
      });
    } else for (const panel of [profile,journal,careers,room]) empty(panel);
    const wishlist=byId('life-wishlist-output');
    const saved=getList(progress.itemWishlist).map(id=>market.byId.get(id)).filter(Boolean);
    if (!saved.length) link(wishlist,'Find items to save in the Item Market','pawtopia-items.html#catalog-title');
    for (const item of saved) {
      const panel=card(wishlist,item.name,item.description);
      icon(panel,item);
      link(panel,'View item and requirements',itemURL(item));
      if (item.price) {
        const shop=stock?.shopFor(item);
        const friendly=Object.entries(stock?.locations||{}).find(([,url])=>url==='pawtopia-shop-'+shop+'.html');
        const path=shop?'pawtopia-shop-'+shop+'.html':'pawtopia-items.html';
        link(panel,(friendly?.[0]||({'main-shops':'Book Arcade','market-place':'Market Place','grooming-cottage':'Grooming Cottage','battle-academy':'Battle Academy'}[shop])||'Item Market')+' · '+item.price+' coins',path+'?item='+encodeURIComponent(item.id));
      }
      if (item.recipe) add(panel,'p','Recipe · '+Object.entries(item.recipe).map(([id,n])=>n+' × '+(market.byId.get(id)?.name||id)).join(', '));
      if (item.achievement) {
        const goals=add(panel,'ul');
        for (const goal of market.achievementProgress(progress,item)) add(goals,'li',goal.label+' · '+Math.min(goal.current,goal.target)+' / '+goal.target);
      }
      button(panel,'Remove from wishlist',p=>market.wishlist(p,item.id));
    }
    const keepers=byId('life-shops-output');
    for (const [id,keeper] of Object.entries(life.shops)) {
      const record=progress.shopFriendships?.[id]||{};
      const panel=card(keepers,keeper.name+' · '+keeper.shop,(record.points||0)+' friendship · gift at 8');
      add(panel,'p',keeper.favor);
      if ((record.points||0)>=4) add(panel,'p',keeper.name+' tells you that trail materials help keep the shop open during festivals.');
      link(panel,'Visit '+keeper.shop,keeper.path);
      button(panel,'Say hello',p=>life.favor(p,id,false),record.visited===life.day());
      button(panel,'Deliver material',p=>life.favor(p,id,true),record.delivered===life.day()||!market.stock(progress,keeper.material));
      button(panel,record.reward?'Friendship gift claimed':'Claim friendship gift',p=>life.claimShop(p,id),record.reward||(record.points||0)<8);
    }
    const rescues=byId('life-rescue-output');
    const cats=[cat,...getList(progress.otherCompanions)].filter(Boolean);
    const capacity=life.capacity(progress);
    const cottage=card(rescues,'Cottage capacity',cats.length+' of '+capacity+' places occupied');
    if (capacity<6) {
      const extra=capacity-4, coins=[20,35][extra], silk=[3,5][extra];
      add(cottage,'p','Next place costs '+coins+' Paw Coins and '+silk+' Sunleaf Silk.');
      button(cottage,'Expand the Cottage',life.expand,progress.coins<coins||market.stock(progress,'sunleaf-silk')<silk);
    }
    for (const [i,rescue] of life.rescues.entries()) {
      const done=getList(progress.rescuedCats).includes(i);
      const panel=card(rescues,rescue.name+' · '+rescue.breed,rescue.story);
      button(panel,done?'Adopted':'Adopt '+rescue.name,p=>life.adopt(p,i),done||cats.length>=capacity);
    }
  }
  addEventListener('pageshow',render);
  addEventListener('storage',render);
  render();
})();
