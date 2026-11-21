
(() => {
  const save = window.PawtopiaSave, market = window.PawtopiaItems;
  const $ = id => document.getElementById(id);
  const category = $('market-category'), search = $('market-search'), owned = $('market-owned');
  const list = $('market-list'), status = $('market-status');
  const tier = $('market-tier'), source = $('market-source');
  const previous = $('market-prev'), next = $('market-next');
  const pageSize = 24;
  const art=window.PawtopiaItemArt;
  let page = 0;
  const stock = window.PawtopiaShopStock;
  const storefront = document.body.dataset.storefront;
  const staples = document.getElementById('local-stock');
  const shopItems = storefront ? market.items.filter(item => stock.shopFor(item)===storefront) : market.items;
  const query = new URLSearchParams(location.search);
  if (storefront) source.value='shop';
  else if (['shop','achievement','ready'].includes(query.get('source'))) source.value = query.get('source');
  const categories = [...new Set(shopItems.map(item => item.category))];
  for (const name of categories) category.add(new Option(name,name));
  const add = (parent, tag, value, className) => {
    const node = document.createElement(tag);
    node.textContent = value;
    if (className) node.className = className;
    parent.append(node);
    return node;
  };
  function picture(parent,item,className='item-illustration') {
    if(!art||!item)return;
    art.mount(add(parent,'span','',className),item);
  }
  function showUsed(item,message) {
    const feedback=$('market-used-item');
    if(!feedback)return;
    feedback.replaceChildren();
    if(!/^(Used|Read|Equipped|Displayed)\b/.test(message))return;
    picture(feedback,item,'item-use-portrait');
    add(feedback,'strong',item.name);
  }
  function control(parent, label, action, item, disabled=false) {
    const button = add(parent,'button',label);
    button.type = 'button';
    button.disabled = disabled;
    button.addEventListener('click',async () => {
      button.disabled=true;
      status.textContent=await save.update(p => market[action](p,item.id));
      render(item.id);
      showUsed(item,status.textContent);
    });
  }
  function renderStaples(progress) {
    if (!staples) return;
    staples.replaceChildren();
    const offers = stock.shops.filter(offer => offer.store===document.body.dataset.localStock);
    for (const [index,offer] of offers.entries()) {
      const name = offer.label || stock.labels[offer.item];
      const row = add(staples,'li','');
      picture(row,art?.staple(name,offer.item),'item-staple-portrait');
      add(row,'span',name);
      const button = add(row,'button','Buy · '+offer.price+' coins');
      button.type='button';
      button.disabled=progress.coins<offer.price;
      button.addEventListener('click',async () => {
        button.disabled=true;
        status.textContent=await save.update(current => stock.purchase(current,offer));
        render();
        const currentButton=staples.querySelectorAll('button')[index];
        if (currentButton && !currentButton.disabled) currentButton.focus({preventScroll:true});
        else {
          const heading=staples.closest('section').querySelector('h2');
          heading.tabIndex=-1;
          heading.focus({preventScroll:true});
        }
      });
    }
  }
  function render(focusItem) {
    const p = save.read(), cat = p.companion;
    renderStaples(p);
    $('market-player').textContent = (p.coins || 0) + ' Paw Coins · ' + (cat ? 'Active cat: ' + cat.name : 'Adopt a cat to use and equip items.');
    const loadout = $('market-loadout');
    loadout.replaceChildren();
    for (const [slot,name] of Object.entries({weapon:'Weapon',armor:'Armor',relic:'Relic',wearable:'Wearable'})){
      const item=market.worn(p,cat,slot);
      const row=add(loadout,'li','');
      picture(row,item,'item-mini-portrait');
      add(row,'span',name+': '+(item?.name||'Empty'));
    }
    const displayed=market.exhibition(p);
    const display=add(loadout,'li','');
    picture(display,displayed,'item-mini-portrait');
    add(display,'span','Cottage display: '+(displayed?.name||'Empty'));
    const term=search.value.toLowerCase().trim();
    const visible=shopItems.filter(item => {
      if (category.value && item.category!==category.value) return false;
      if (tier.value && item.tier!==tier.value) return false;
      if (owned.checked && !market.stock(p,item.id)) return false;
      if (source.value==='shop' && !item.price) return false;
      if (source.value==='achievement' && !item.achievement) return false;
      if (source.value==='ready' && (!item.achievement || market.hasClaimed(p,item) ||
          !market.achievementProgress(p,item).every(goal => goal.current>=goal.target))) return false;
      return (item.name+' '+item.description).toLowerCase().includes(term);
    });
    const pageCount=Math.max(1,Math.ceil(visible.length/pageSize));
    page=Math.min(page,pageCount-1);
    list.replaceChildren();
    $('market-count').textContent=visible.length.toLocaleString()+' of '+shopItems.length.toLocaleString()+' items';
    $('market-page').textContent='Page '+(page+1)+' of '+pageCount;
    previous.disabled=page===0;
    next.disabled=page+1>=pageCount;
    if (!visible.length) add(list,'p','No matching items.');
    for (const item of visible.slice(page*pageSize,(page+1)*pageSize)){
      const units=market.stock(p,item.id), card=add(list,'article','');
      card.id='item-'+item.id;
      picture(card,item);
      add(card,'h3',item.name);
      const classification=item.tier?' · '+item.tier+' tier · Power '+item.rating:'';
      const acquisition=item.achievement?' · Achievement reward':item.price?' · Shop':'';
      add(card,'p',item.category+classification+acquisition+' · '+units+' owned','meta');
      add(card,'p',item.description);
      if(art?.design(item).aura)add(card,'p','Arena aura · Shown when equipped','item-aura-label');
      if (item.recipe){
        const parts=Object.entries(item.recipe).map(([id,amount]) => market.byId.get(id).name+
          ' '+Math.min(market.stock(p,id),amount)+'/'+amount);
        add(card,'p',parts.join(' · '),'meta');
      }
      const claimed=item.achievement && market.hasClaimed(p,item);
      const goals=item.achievement && !claimed ? market.achievementProgress(p,item) : [];
      if (goals.length) {
        const objectives=add(card,'ul','','achievement-goals');
        for (const goal of goals) {
          const row=add(objectives,'li',Math.min(goal.current,goal.target)+' / '+goal.target+' ');
          add(row,'a',goal.label).href=goal.href;
        }
      }
      if (claimed) add(card,'p','Achievement reward collected.','meta');
      if (item.lore && units) add(card,'p',item.lore);
      const actions=add(card,'div','','actions');
      if (goals.length) control(actions,'Claim reward','claim',item,goals.some(goal => goal.current<goal.target));
      const stackable=market.stackable(item);
      if (item.price && (!units || stackable)) control(actions,'Buy · '+item.price+' coins','buy',item,p.coins<item.price || units>=999);
      if (item.recipe && !units) control(actions,'Craft','craft',item,Object.entries(item.recipe).some(([id,n]) => market.stock(p,id)<n));
      if (item.refine && units) {
        const project=market.byId.get(item.workshopTarget);
        control(actions,'Refine','refine',item);
        if (project && !market.stock(p,project.id)) control(actions,'Craft '+project.name,'workshop',item);
      }
      if (item.exhibit && units) control(actions,market.exhibition(p)?.id===item.id?'Remove display':'Display','display',item);
      if (item.slot && units) control(actions,cat?.catalogGear?.[item.slot]===item.id?'Unequip':'Equip','equip',item,!cat);
      if ((item.care || item.read) && units) control(actions,item.read?'Read':item.category==='Toy'?'Play':item.category==='Furnishing'?'Use furnishing':'Use','use',item,!cat);
    }
    if (focusItem) {
      const item=$('item-'+focusItem);
      if (item) {
        item.tabIndex=-1;
        (item.querySelector('button:enabled') || item).focus({preventScroll:true});
      } else owned.focus({preventScroll:true});
    }
  }
  function resetPage() {
    page=0;
    render();
  }
  function turnPage(direction) {
    page+=direction;
    render();
    const heading=$('catalog-title');
    heading.tabIndex=-1;
    heading.focus();
  }
  search.addEventListener('input',resetPage);
  for (const filter of [category,tier,source,owned]) filter.addEventListener('change',resetPage);
  previous.addEventListener('click',() => turnPage(-1));
  next.addEventListener('click',() => turnPage(1));
  addEventListener('storage',() => render());
  addEventListener('pageshow',() => render());
  render();
})();
