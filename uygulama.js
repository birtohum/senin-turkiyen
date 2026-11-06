"use strict";
const T = "https://birtohum.github.io/";
const $ = (id) => document.getElementById(id);
const sayi = (x, b = 0) => x.toLocaleString("tr-TR", {minimumFractionDigits: b, maximumFractionDigits: b});
const buyuk = (s) => s.trim().replace(/\s+/g, " ").toLocaleUpperCase("tr");
const guzel = (s) => s.toLocaleLowerCase("tr").split(" ").map((w) => w.charAt(0).toLocaleUpperCase("tr") + w.slice(1)).join(" ");
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
const BUGUN = 2026, SON = 2025;
const GRUP = ["0-4", "5-9", "10-14", "15-19", "20-24", "25-29", "30-34", "35-39", "40-44", "45-49", "50-54", "55-59", "60-64", "65-69", "70-74", "75-79", "80-84", "85+"];
let IS, SOY, YAS, IL, kart = null, son = null, cinsZorla = null;

// Türkçe ekler
function ek(s, e) {
  const k = s.toLocaleLowerCase("tr"), sesli = [...k].reverse().find((h) => "aıoueiöü".includes(h)) || "e";
  const kalin = "aıou".includes(sesli), so = k.slice(-1), biter = "aıoueiöü".includes(so), sert = "fstkçşhp".includes(so);
  if (e === "da") return `${s}'${sert ? "t" : "d"}${kalin ? "a" : "e"}`;
  if (e === "nin") { const u = {a: "ı", ı: "ı", e: "i", i: "i", o: "u", u: "u", ö: "ü", ü: "ü"}[sesli]; return `${s}'${biter ? "n" : ""}${u}n`; }
  return s;
}

// Sayıya gelen ekler okunuşa göre: 1930'da, 2008'de, %27'si, %71'i
const ON = {0: "e", 10: "a", 20: "e", 30: "a", 40: "a", 50: "e", 60: "a", 70: "e", 80: "e", 90: "a"};
const BIR = {1: "e", 2: "e", 3: "e", 4: "e", 5: "e", 6: "a", 7: "e", 8: "e", 9: "a"};
const SERT = (n) => [3, 4, 5].includes(n % 10) || (n % 10 === 0 && [40, 60, 70].includes(n % 100));
function yilDa(y) {
  const b = y % 10, u = b ? BIR[b] : ON[y % 100];
  return `${y}'${SERT(y) ? "t" : "d"}${u}`;
}
function yuzde(n) {
  const b = n % 10, E = {1: "i", 2: "si", 3: "ü", 4: "ü", 5: "i", 6: "sı", 7: "si", 8: "i", 9: "u"};
  const O = {0: "ı", 10: "u", 20: "si", 30: "u", 40: "ı", 50: "si", 60: "ı", 70: "i", 80: "i", 90: "ı"};
  return n === 100 ? "%100'ü" : `%${n}'${b ? E[b] : O[n]}`;
}

function adBul(ad, yil, zorla) {
  const A = buyuk(ad).split(" "), adlar = [A.join(" "), A[0]];
  for (const a of adlar) {
    const e = IS.n[`${a}|1`], k = IS.n[`${a}|2`];
    if (!e && !k) continue;
    const i = yil - IS.y0;
    const r = (s) => (s && s[i] > 0 ? s[i] : Infinity);
    let c = zorla && IS.n[`${a}|${zorla}`] ? zorla : !e ? "2" : !k ? "1" : r(k) <= r(e) ? "2" : "1";
    const s = IS.n[`${a}|${c}`];
    let tv = Infinity;
    s.forEach((v) => { if (v > 0 && v < tv) tv = v; });
    const yillar = s.map((v, j) => (v === tv ? IS.y0 + j : null)).filter(Boolean);
    return {ad: a, c, iki: !!(e && k), sira: s[i] > 0 ? s[i] : null, tepeSira: tv, tepeIlk: yillar[0], tepeSon: yillar[yillar.length - 1]};
  }
  return null;
}

function birinci(yil, c) {
  const i = yil - IS.y0;
  for (const [k, s] of Object.entries(IS.n)) if (k.endsWith("|" + c) && s[i] === 1) return guzel(k.split("|")[0]);
  return null;
}

function soyBul(soy, ilNo) {
  const S = buyuk(soy);
  if (!S) return null;
  const tr = SOY.tr.find((x) => x[0] === S);
  const yer = [];
  SOY.iller.forEach((l, i) => { const x = l.find((y) => y[0] === S); if (x) yer.push({i, sira: x[2], n: x[1]}); });
  const buIl = yer.find((y) => y.i === ilNo);
  const ozel = SOY.ozel.findIndex((o) => o && o[0] === S);
  yer.sort((a, b) => a.sira - b.sira || b.n - a.n);
  return {ad: guzel(S), birinci: yer.filter((y) => y.sira === 1).length, tr: tr ? tr[2] : null, trN: tr ? tr[1] : null, yerSay: yer.length, en: yer[0] || null, buIl: buIl || null, ozel: ozel >= 0 ? ozel : null};
}

function yasli(yil) {
  const V = YAS[String(SON)], b = GRUP.map((g) => V[g][0]), toplam = b.reduce((x, y) => x + y, 0), a = SON - yil;
  let ust = 0;
  GRUP.forEach((g, i) => { const lo = parseInt(g, 10), gen = i === 17 ? 15 : 5; if (a < lo) ust += b[i]; else if (a < lo + gen) ust += (b[i] * (lo + gen - a - 0.5)) / gen; });
  return {oran: (ust / toplam) * 100, ust, alt: toplam - ust, toplam, yas: a};
}

function dogumNufus(yil) {
  const y = Object.keys(YAS).map(Number).sort((a, b) => a - b);
  const u = y.reduce((p, c) => (Math.abs(c - yil) < Math.abs(p - yil) ? c : p), y[0]);
  const V = YAS[String(u)];
  return {yil: u, n: GRUP.reduce((t, g) => t + V[g][0], 0)};
}

function hesapla(girdi) {
  const ilx = IL[girdi.il], yil = girdi.yil;
  const a = adBul(girdi.ad, yil, cinsZorla), s = soyBul(girdi.soy, girdi.il), y = yasli(yil), n = dogumNufus(yil);
  const c = a ? a.c : "2";
  return {girdi, ilx, a, s, y, n, bir: birinci(yil, c), cinsAd: c === "1" ? "erkek" : "kız"};
}

function damgalar(r) {
  const {girdi, ilx, a, s, y, n, bir, cinsAd} = r, yil = girdi.yil, out = [];
  if (a) {
    const aralik = a.tepeIlk !== a.tepeSon, yasi = BUGUN - a.tepeSon;
    const zirve = aralik ? (a.tepeSira === 1 ? `${a.tepeIlk}–${a.tepeSon} arası birinciydi` : `${a.tepeIlk}–${a.tepeSon} arası ${a.tepeSira}. sıraya kadar çıktı`) : `en çok ${yilDa(a.tepeSon)} modaydı`;
    const zirveH = aralik ? (a.tepeSira === 1 ? `<em>${a.tepeIlk}–${a.tepeSon}</em> arası birinciydi` : `<em>${a.tepeIlk}–${a.tepeSon}</em> arası zirvedeydi`) : `en çok <em>${a.tepeSon}</em>'${yilDa(a.tepeSon).split("'")[1]} modaydı`;
    const bu = bir && bir === guzel(a.ad) ? ` ${yil} doğumluların birinci ${cinsAd} adı senin adın.` : bir ? ` ${yil} doğumluların birinci ${cinsAd} adı: ${bir}.` : "";
    out.push({b: "Adın", h: `${esc(guzel(a.ad))}, ${zirveH}`, d: `${aralik ? "" : `En üst sırası ${a.tepeSira}.; o yıl doğanlar bugün ${yasi} yaşında. `}${yil} doğumlular arasında ${a.sira ? `${a.sira}. sırada` : "listede yok"}.${bu}`, l: ["Adın kaç yaşında?", "adin-kac-yasinda/"], kisa: `Adın ${zirve}`});
  } else {
    out.push({b: "Adın", h: `Adın listede <em>yok</em>`, d: `TÜİK'in yayımladığı 1.205 ismin dışında. ${bir ? `${yil} doğumluların birinci ${cinsAd} adı: ${bir}.` : ""}`, l: ["Adın kaç yaşında?", "adin-kac-yasinda/"], kisa: "Adın 1.205 ismin dışında"});
  }
  if (s) {
    if (s.yerSay) {
      const enIl = IL[s.en.i].ad;
      const baslik = s.tr ? `${s.ad}, Türkiye'de <em>${s.tr}.</em>` : `${s.ad}, en çok <em>${esc(enIl)}</em>'lik`;
      const ek1 = s.ozel !== null ? ` ${ek(IL[s.ozel].ad, "nin")} kendine özgü soyadı.` : "";
      const birinciIl = s.birinci > 1 ? `${s.birinci} ilde birinci.` : s.yerSay === 1 ? `Yalnız ${ek(enIl, "nin")} ilk 30'unda.` : `${s.yerSay} ilin ilk 30'unda; en üst sıra ${enIl} (${s.en.sira}.).`;
      const ek2 = s.buIl ? ` ${ek(ilx.ad, "da")} ${s.buIl.sira}. sırada.` : ` ${ek(ilx.ad, "da")} ilk 30'da değil.`;
      out.push({b: "Soyadın", h: baslik, d: `${birinciIl}${ek2}${ek1}`, l: ["Soyadın nereli?", "soyadin-nereli/"], kisa: s.tr ? `Soyadın Türkiye'de ${s.tr}. sırada` : `Soyadın ${s.yerSay} ilin ilk 30'unda`});
    } else {
      out.push({b: "Soyadın", h: `${s.ad}, listelerin <em>dışında</em>`, d: "Hiçbir ilin ilk 30'unda yok. Bu, nadir olduğu anlamına gelmez; TÜİK yalnız ilk 30'u yayımlıyor.", l: ["Soyadın nereli?", "soyadin-nereli/"], kisa: "Soyadın ilk 30'ların dışında"});
    }
  }
  const yz = Math.round(y.oran), yyaz = yuzde(yz);
  out.push({b: "Yaşın", h: yz < 1 ? "Senden yaşlı neredeyse <em>kimse yok</em>" : `Türkiye'nin <em>${yyaz}</em> senden yaşlı`, d: `2025'te yaklaşık ${sayi(y.ust / 1e6, 1)} milyon kişi senden yaşlı, ${sayi(y.alt / 1e6, 1)} milyon kişi genç. Doğduğun yıla en yakın veride (${n.yil}) Türkiye ${sayi(n.n / 1e6, 1)} milyon kişiydi.`, l: ["Kaç kişi senden yaşlı?", "kac-kisi-senden-yasli/"], kisa: yz < 1 ? "Senden yaşlı neredeyse kimse yok" : `Türkiye'nin ${yyaz} senden yaşlı`});
  const u = (ilx.uclar && ilx.uclar[0]) || `${ilx.ad}, ${sayi(ilx.nufus)} kişi`;
  const kim = ilx.kisiler && ilx.kisiler[0] ? ` Sokaklarında en çok ${ilx.kisiler[0][0]} geçiyor.` : "";
  out.push({b: `${String(ilx.p).padStart(2, "0")} ${ilx.ad}`, h: esc(u), d: `Net göç, yıllık her 1.000 kişide ${ilx.net_binde > 0 ? "+" : ""}${sayi(ilx.net_binde, 1).replace("-", "−")}.${kim}${ilx.soy_ozel ? ` Kendine özgü soyadı ${ilx.soy_ozel}.` : ""}`, l: ["İlin Kimliği", `il-kimligi/il/${ilx.slug}/`], kisa: u});
  return out;
}

function goster(r, ornek) {
  son = r;
  $("sonuc").hidden = false;
  $("ornek").hidden = !ornek;
  $("kisi").innerHTML = `${esc(guzel(r.girdi.ad))}<small>${r.girdi.yil} doğumlu · ${esc(r.ilx.ad)}</small>`;
  kart = damgalar(r);
  $("damgalar").innerHTML = kart.map((d, i) => `<section class="damga"><h2>${esc(d.b)}</h2><b>${d.h}</b><p>${esc(d.d)}</p><a href="${T}${d.l[1]}">${esc(d.l[0])} ↗</a>${i === 0 && r.a && r.a.iki ? `<div class="secim"><button type="button" data-c="2" aria-pressed="${r.a.c === "2"}">Kız adları</button><button type="button" data-c="1" aria-pressed="${r.a.c === "1"}">Erkek adları</button></div>` : ""}</section>`).join("");
  document.querySelectorAll(".secim button").forEach((b) => (b.onclick = () => { cinsZorla = b.dataset.c; goster(hesapla(r.girdi), ornek); }));
}

// ---------------- paylaşılabilir görsel (yalnız ad, yıl, il; soyad yazılmaz)
function satirlar(g, metin, gen) {
  const out = []; let s = "";
  for (const k of metin.split(" ")) { const d = s ? s + " " + k : k; if (g.measureText(d).width > gen && s) { out.push(s); s = k; } else s = d; }
  if (s) out.push(s);
  return out;
}
async function ciz() {
  try { await document.fonts.load('400 80px "DM Serif Display"'); await document.fonts.load('500 28px Jost'); } catch (_) {}
  const c = $("tuval"), g = c.getContext("2d"), W = 1080, H = 1350;
  const gr = g.createRadialGradient(W / 2, 0, 80, W / 2, 200, 1300); gr.addColorStop(0, "#7a1530"); gr.addColorStop(.5, "#5c0c1f"); gr.addColorStop(1, "#3d0714");
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.strokeStyle = "#e8c56b"; g.lineWidth = 4; g.strokeRect(36, 36, W - 72, H - 72); g.lineWidth = 1.5; g.strokeRect(50, 50, W - 100, H - 100);
  g.fillStyle = "#e8c56b"; g.font = '500 28px Jost'; g.fillText("SENİN TÜRKİYEN", 90, 122);
  g.fillStyle = "#f8f0dd"; g.font = '400 100px "DM Serif Display"'; g.fillText(guzel(son.girdi.ad).slice(0, 18), 90, 236);
  g.fillStyle = "#dcb9a6"; g.font = '500 34px Jost'; g.fillText(`${son.girdi.yil} doğumlu · ${son.ilx.ad}`, 90, 290);
  let y = 370;
  for (const d of kart) {
    g.fillStyle = "#e8c56b"; g.font = '500 25px Jost'; g.fillText(d.b.toLocaleUpperCase("tr"), 90, y);
    g.fillStyle = "#f8f0dd"; g.font = '400 54px "DM Serif Display"';
    y += 62;
    for (const l of satirlar(g, d.kisa, W - 180).slice(0, 3)) { g.fillText(l, 90, y); y += 62; }
    y += 44;
  }
  g.fillStyle = "#dcb9a6"; g.font = '500 28px Jost'; g.fillText("birtohum.github.io/senin-turkiyen", 90, H - 88);
  return new Promise((ok) => c.toBlob(ok, "image/png"));
}
$("indir").onclick = async () => {
  const b = await ciz(), a = document.createElement("a");
  a.href = URL.createObjectURL(b); a.download = "senin-turkiyen.png"; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  $("not").textContent = "İndirildi.";
};
$("paylas").onclick = async () => {
  const u = "https://birtohum.github.io/senin-turkiyen/", m = "Senin Türkiyen: adın, soyadın, doğum yılın ve ilin tek kartta.";
  try {
    const b = await ciz(), f = new File([b], "senin-turkiyen.png", {type: "image/png"});
    if (navigator.canShare && navigator.canShare({files: [f]})) await navigator.share({files: [f], text: m, url: u});
    else if (navigator.share) await navigator.share({text: m, url: u});
    else { await navigator.clipboard.writeText(`${m} ${u}`); $("not").textContent = "Bağlantı kopyalandı."; }
  } catch (_) {}
};

$("form").onsubmit = (e) => {
  e.preventDefault();
  const y = Number($("yil").value);
  if (!(y >= 1930 && y <= SON) || !$("ad").value.trim()) return;
  cinsZorla = null;
  goster(hesapla({ad: $("ad").value, soy: $("soy").value, yil: y, il: Number($("il").value)}), false);
  $("sonuc").scrollIntoView({behavior: "smooth", block: "start"});
};

Promise.all(["adin-kac-yasinda/veri/isimler.json", "soyadin-nereli/veri/soyadlari.json", "kac-kisi-senden-yasli/veri/yas.json", "il-kimligi/veri/iller.json"].map((u) => fetch(T + u).then((r) => r.json())))
  .then(([a, b, c, d]) => {
    IS = a; SOY = b; YAS = c; IL = d;
    const sira = IL.map((x, i) => [x.ad, i]).sort((p, q) => p[0].localeCompare(q[0], "tr"));
    $("il").innerHTML = sira.map(([ad, i]) => `<option value="${i}">${esc(ad)}</option>`).join("");
    $("il").value = "33"; // İstanbul
    goster(hesapla({ad: "Zeynep", soy: "Yılmaz", yil: 2000, il: 33}), true);
  })
  .catch((e) => { $("sonuc").hidden = false; $("kisi").textContent = "Veri yüklenemedi. Biraz sonra yeniden dene."; console.error(e); });
