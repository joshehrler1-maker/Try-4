
(() => {
  const save = window.PawtopiaSave, market = window.PawtopiaItems;
  const $ = id => document.getElementById(id);
  const category = $('market-category'), search = $('market-search'), owned = $('market-owned');
  const list = $('market-list'), status = $('market-status');
  const categories = [...new Set(market.items.map(item => item.category))];
  for (const name of categories) category.add(new Option(name,name));
  const add = (parent, tag, value, className) => {
    const node = document.createElement(tag);
    node.textContent = value;
    if (className) node.className = className;
    parent.append(node);
    return node;
  };
  function control(parent, label, action, item, disabled=false) {
    const button = add(parent,'button',label);
    button.type = 'button';
    button.disabled = disabled;
    button.addEventListener('click',async () => {
      button.disabled=true;
      status.textContent=await save.update(p => market[action](p,item.id));
      render(item.id);
    });
  }
  function render(focusItem) {
    const p = save.read(), cat = p.companion;
    $('market-player').textContent = (p.coins || 0) + ' Paw Coins · ' + (cat ? 'Active cat: ' + cat.name : 'Adopt a cat to use and equip items.');
    const loadout = $('market-loadout');
    loadout.replaceChildren();
    for (const [slot,name] of Object.entries({weapon:'Weapon',armor:'Armor',relic:'Relic',wearable:'Wearable'})){
      add(loadout,'li',name + ': ' + (market.worn(p,cat,slot)?.name || 'Empty'));
    }
    const term=search.value.toLowerCase().trim();
    const visible=market.items.filter(item => (!category.value || item.category===category.value) &&
      (!owned.checked || market.stock(p,item.id)>0) &&
      (item.name+' '+item.description).toLowerCase().includes(term));
    list.replaceChildren();
    $('market-count').textContent=visible.length+' of '+market.items.length+' items';
    if (!visible.length) add(list,'p','No matching items.');
    for (const item of visible){
      const units=market.stock(p,item.id), card=add(list,'article','');
      card.id='item-'+item.id;
      add(card,'h3',item.badge ? item.badge+' '+item.name : item.name);
      add(card,'p',item.category+' · '+units+' owned','meta');
      add(card,'p',item.description);
      if (item.recipe){
        const parts=Object.entries(item.recipe).map(([id,amount]) => market.byId.get(id).name+
          ' '+Math.min(market.stock(p,id),amount)+'/'+amount);
        add(card,'p',parts.join(' · '),'meta');
      }
      if (item.lore && units) add(card,'p',item.lore);
      const actions=add(card,'div','','actions');
      const stackable=['Food','Remedy'].includes(item.category);
      if (item.price && (!units || stackable)) control(actions,'Buy · '+item.price+' coins','buy',item,p.coins<item.price || units>=999);
      if (item.recipe && !units) control(actions,'Craft','craft',item,Object.entries(item.recipe).some(([id,n]) => market.stock(p,id)<n));
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
  search.addEventListener('input',() => render());
  category.addEventListener('change',() => render());
  owned.addEventListener('change',() => render());
  addEventListener('storage',() => render());
  addEventListener('pageshow',() => render());
  render();
})();
