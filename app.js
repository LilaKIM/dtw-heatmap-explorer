const state={data:[],filtered:[],selected:new Set()};
const $=s=>document.querySelector(s);

const els={
  search:$("#search"),
  model:$("#model"),
  pattern:$("#pattern"),
  segmentation:$("#segmentation"),
  segmentCount:$("#segmentCount"),
  layer:$("#layer"),
  gallery:$("#gallery"),
  summary:$("#summary"),
  empty:$("#empty"),
  reset:$("#reset"),
  compareBar:$("#compareBar"),
  compareCount:$("#compareCount"),
  compareButton:$("#compareButton"),
  clearCompare:$("#clearCompare"),
  viewer:$("#viewer"),
  viewerImage:$("#viewerImage"),
  viewerTitle:$("#viewerTitle"),
  comparison:$("#comparison"),
  comparisonGrid:$("#comparisonGrid"),
  compareSegmentations:$("#compareSegmentations"),
  segmentationComparison:$("#segmentationComparison"),
  segmentationComparisonGrid:$("#segmentationComparisonGrid"),
  segmentationComparisonTitle:$("#segmentationComparisonTitle"),
  statFigures:$("#statFigures"),
  statModels:$("#statModels"),
  statPatterns:$("#statPatterns"),
  statSegmentations:$("#statSegmentations")
};

function uniq(field,data=state.data){
  return [...new Set(
    data.map(x=>x[field]).filter(x=>x!==null&&x!==undefined&&x!=="")
  )].sort((a,b)=>String(a).localeCompare(String(b),"fr",{numeric:true}));
}

function fill(select,values){
  values.forEach(v=>{
    const o=document.createElement("option");
    o.value=String(v);
    o.textContent=String(v);
    select.append(o);
  });
}

function searchable(x){
  return [
    x.model,x.pattern,x.err_pattern,x.corr_pattern,
    x.segmentation,x.segment_count,x.layer
  ].join(" ").toLowerCase();
}

function apply(){
  const q=els.search.value.trim().toLowerCase();

  state.filtered=state.data.filter(x=>
    (!q||searchable(x).includes(q)) &&
    (!els.model.value||x.model===els.model.value) &&
    (!els.pattern.value||x.pattern===els.pattern.value) &&
    (!els.segmentation.value||x.segmentation===els.segmentation.value) &&
    (!els.segmentCount.value||String(x.segment_count)===els.segmentCount.value) &&
    (!els.layer.value||String(x.layer)===els.layer.value)
  );

  updateSegmentationButton();
  updateStats();
  render();
}

function updateStats(){
  els.statFigures.textContent=state.filtered.length;
  els.statModels.textContent=uniq("model",state.filtered).length;
  els.statPatterns.textContent=uniq("pattern",state.filtered).length;

  const segmentationKeys=new Set(
    state.filtered.map(x=>
      x.segment_count===null ? x.segmentation : `${x.segmentation}:${x.segment_count}`
    )
  );
  els.statSegmentations.textContent=segmentationKeys.size;
}

function updateSegmentationButton(){
  const ready=Boolean(els.model.value&&els.pattern.value);
  els.compareSegmentations.disabled=!ready;
  els.compareSegmentations.title=ready
    ? "Afficher la segmentation en tons et les découpages temporels disponibles"
    : "Sélectionnez d’abord un modèle et un pattern";
}

function patternBlock(x){
  const wrap=document.createElement("div");
  wrap.className="pattern-display";

  const errLabel=document.createElement("b");
  errLabel.className="err-label";
  errLabel.textContent="ERR";

  const errCode=document.createElement("code");
  errCode.textContent=x.err_pattern;

  const corrLabel=document.createElement("b");
  corrLabel.className="corr-label";
  corrLabel.textContent="CORR";

  const corrCode=document.createElement("code");
  corrCode.textContent=x.corr_pattern;

  wrap.append(errLabel,errCode,corrLabel,corrCode);
  return wrap;
}

function segmentationLabel(x){
  return x.segment_count===null
    ? "Segmentation en tons"
    : `${x.segment_count} morceaux`;
}

function render(){
  els.gallery.replaceChildren();
  state.filtered.forEach(x=>els.gallery.append(card(x)));

  els.summary.textContent=
    `${state.filtered.length} figure${state.filtered.length>1?"s":""} trouvée${state.filtered.length>1?"s":""} `+
    `sur ${state.data.length}.`;

  els.empty.hidden=state.filtered.length!==0;
}

function card(x){
  const a=document.createElement("article");
  a.className="card";

  const imageButton=document.createElement("button");
  imageButton.className="image";
  imageButton.type="button";

  const image=document.createElement("img");
  image.loading="lazy";
  image.src=x.src;
  image.alt=x.title;
  imageButton.append(image);
  imageButton.onclick=()=>openViewer(x);

  const body=document.createElement("div");
  body.className="card-body";

  const model=document.createElement("p");
  model.className="model-label";
  model.textContent=x.model;

  const title=document.createElement("h2");
  title.textContent=segmentationLabel(x);

  const pattern=patternBlock(x);

  const badge=document.createElement("span");
  badge.className="segmentation-badge";
  badge.textContent=x.segment_count===null
    ? "Tons"
    : `${x.segment_count} morceaux`;

  const chips=document.createElement("div");
  chips.className="chips";
  if(x.layer!==null){
    const layer=document.createElement("span");
    layer.textContent=`Couche ${x.layer}`;
    chips.append(layer);
  }

  const actions=document.createElement("div");
  actions.className="card-actions";

  const label=document.createElement("label");
  const cb=document.createElement("input");
  cb.type="checkbox";
  cb.checked=state.selected.has(x.id);
  cb.onchange=()=>toggle(x,cb);
  label.append(cb,document.createTextNode(" Comparer"));

  const link=document.createElement("a");
  link.href=x.src;
  link.target="_blank";
  link.rel="noopener";
  link.textContent="Image originale";

  actions.append(label,link);
  body.append(model,title,pattern,badge,chips,actions);
  a.append(imageButton,body);
  return a;
}

function toggle(x,cb){
  if(cb.checked){
    if(state.selected.size>=4){
      cb.checked=false;
      alert("Maximum : quatre figures.");
      return;
    }
    state.selected.add(x.id);
  }else{
    state.selected.delete(x.id);
  }
  updateCompare();
}

function updateCompare(){
  const n=state.selected.size;
  els.compareBar.hidden=n===0;
  els.compareCount.textContent=`${n} figure${n>1?"s":""} sélectionnée${n>1?"s":""}`;
  els.compareButton.disabled=n<2;
}

function openViewer(x){
  els.viewerImage.src=x.src;
  els.viewerImage.alt=x.title;
  els.viewerTitle.textContent=
    `${x.model} — ERR ${x.err_pattern} / CORR ${x.corr_pattern} — ${segmentationLabel(x)}`;
  els.viewer.showModal();
}

function comparisonItem(x){
  const article=document.createElement("article");

  const meta=document.createElement("div");
  meta.className="comparison-meta";
  meta.innerHTML=
    `<strong>${x.model}</strong>`+
    `<p>ERR ${x.err_pattern} · CORR ${x.corr_pattern}</p>`+
    `<p>${segmentationLabel(x)}${x.layer!==null?` · Couche ${x.layer}`:""}</p>`;

  const image=document.createElement("img");
  image.src=x.src;
  image.alt=x.title;

  article.append(meta,image);
  return article;
}

function openComparison(){
  els.comparisonGrid.replaceChildren();
  state.data
    .filter(x=>state.selected.has(x.id))
    .forEach(x=>els.comparisonGrid.append(comparisonItem(x)));
  els.comparison.showModal();
}

function segmentationOrder(x){
  if(x.segment_count===null)return 0;
  return x.segment_count;
}

function openSegmentationComparison(){
  const model=els.model.value;
  const pattern=els.pattern.value;

  const matches=state.data
    .filter(x=>x.model===model&&x.pattern===pattern)
    .sort((a,b)=>{
      const bySeg=segmentationOrder(a)-segmentationOrder(b);
      if(bySeg!==0)return bySeg;
      return (a.layer??999)-(b.layer??999);
    });

  els.segmentationComparisonGrid.replaceChildren();
  els.segmentationComparisonTitle.textContent=
    `${model} — ${pattern}`;

  matches.forEach(x=>{
    const article=document.createElement("article");
    article.className="segmentation-item";

    const header=document.createElement("header");
    header.innerHTML=
      `<h3>${segmentationLabel(x)}</h3>`+
      `<p>ERR ${x.err_pattern} · CORR ${x.corr_pattern}`+
      `${x.layer!==null?` · Couche ${x.layer}`:""}</p>`;

    const image=document.createElement("img");
    image.src=x.src;
    image.alt=x.title;

    article.append(header,image);
    els.segmentationComparisonGrid.append(article);
  });

  if(matches.length===0){
    const message=document.createElement("p");
    message.textContent="Aucune image correspondante.";
    els.segmentationComparisonGrid.append(message);
  }

  els.segmentationComparison.showModal();
}

function reset(){
  [els.search,els.model,els.pattern,els.segmentation,els.segmentCount,els.layer]
    .forEach(e=>e.value="");
  apply();
}

async function init(){
  try{
    const r=await fetch("data.json",{cache:"no-store"});
    if(!r.ok)throw new Error(r.status);

    state.data=await r.json();

    fill(els.model,uniq("model"));
    fill(els.pattern,uniq("pattern"));
    fill(els.segmentation,uniq("segmentation"));
    fill(els.segmentCount,uniq("segment_count"));
    fill(els.layer,uniq("layer"));

    [els.search,els.model,els.pattern,els.segmentation,els.segmentCount,els.layer]
      .forEach(e=>{
        e.addEventListener("input",apply);
        e.addEventListener("change",apply);
      });

    els.reset.onclick=reset;
    els.compareButton.onclick=openComparison;
    els.compareSegmentations.onclick=openSegmentationComparison;

    els.clearCompare.onclick=()=>{
      state.selected.clear();
      updateCompare();
      render();
    };

    $("#closeViewer").onclick=()=>els.viewer.close();
    $("#closeComparison").onclick=()=>els.comparison.close();
    $("#closeSegmentationComparison").onclick=()=>els.segmentationComparison.close();

    render();
    updateStats();
    updateSegmentationButton();
  }catch(e){
    console.error(e);
    els.summary.textContent="Erreur de chargement. Lancez un serveur HTTP local.";
    els.empty.hidden=false;
  }
}
init();
