/* dailyoufit — Link & Katalog
   - klik counter per tombol (localStorage)
   - ganti foto ikon per item (long-press pada foto)
   - simpan foto sebagai dataURL di localStorage
*/

const $ = (sel, el=document)=>el.querySelector(sel);
const $$ = (sel, el=document)=>[...el.querySelectorAll(sel)];
const store = {
  /* get & set JSON in localStorage */
  get(key, def){ try{ return JSON.parse(localStorage.getItem(key)) ?? def; }catch{ return def; } },
  set(key, val){ localStorage.setItem(key, JSON.stringify(val)); }
};

// restore counts & photos
function restore() {
  $$(".link").forEach(li=>{
    const key = li.dataset.key;
    const c = store.get(`count:${key}`, 0);
    $(".count", li).textContent = c;

    const img = $("img", $(".photo", li));
    const saved = store.get(`photo:${key}`, null);
    if(saved) img.src = saved;
  });
}
restore();

// handle click count
$$(".link .cta").forEach(a=>{
  a.addEventListener("click", e=>{
    const li = e.currentTarget.closest(".link");
    const key = li.dataset.key;
    const span = $(".count", li);
    let c = Number(span.textContent||0)+1;
    span.textContent = c;
    store.set(`count:${key}`, c);
  });
});

// image picker per item (long-press)
const picker = $("#picker");
let currentKey = null;
$$(".link .photo").forEach(btn=>{
  let pressTimer;
  btn.addEventListener("pointerdown", e=>{
    pressTimer = setTimeout(()=>{
      currentKey = btn.closest(".link").dataset.key;
      picker.click();
    }, 420); // long press
  });
  ["pointerup","pointerleave","pointercancel"].forEach(ev=>{
    btn.addEventListener(ev, ()=> clearTimeout(pressTimer));
  });
});

// read chosen image and save
picker.addEventListener("change", e=>{
  const file = e.target.files?.[0]; if(!file || !currentKey) return;
  const reader = new FileReader();
  reader.onload = ev=>{
    const dataURL = ev.target.result;
    // update UI
    const li = $(`.link[data-key="${currentKey}"]`);
    $(".photo img", li).src = dataURL;
    // save
    store.set(`photo:${currentKey}`, dataURL);
    picker.value = "";
    currentKey = null;
  };
  reader.readAsDataURL(file);
});

// small sugar: brand color ring on focus/hover (using :has is limited, set inline)
$$(".link").forEach(li=>{
  const col = li.dataset.color;
  if(!col) return;
  const photo = $(".photo", li);
  photo.style.outlineColor = col + "40";
  photo.addEventListener("mouseenter", ()=> photo.style.boxShadow = `0 0 0 2px ${col}60 inset, 0 0 20px ${col}33`);
  photo.addEventListener("mouseleave", ()=> photo.style.boxShadow = "inset 0 0 0 1px #223049");
});

// (opsional) save search & sort to feel persistent
["q","sort"].forEach(id=>{
  const el = document.getElementById(id);
  const key = `ui:${id}`;
  const val = store.get(key,"");
  if(val) el.value = val;
  el.addEventListener("input", ()=> store.set(key, el.value));
});