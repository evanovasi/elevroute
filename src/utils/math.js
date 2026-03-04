export function calcGain(e) {
  let g = 0;
  for (let i = 1; i < e.length; i++) if (e[i] > e[i - 1]) g += e[i] - e[i - 1];
  return Math.round(g);
}

export function calcLoss(e) {
  let l = 0;
  for (let i = 1; i < e.length; i++) if (e[i] < e[i - 1]) l += e[i - 1] - e[i];
  return Math.round(l);
}

export function haversine(la1, ln1, la2, ln2) {
  const R = 6371000, f1 = la1 * Math.PI / 180, f2 = la2 * Math.PI / 180;
  const df = (la2 - la1) * Math.PI / 180, dl = (ln2 - ln1) * Math.PI / 180;
  const a = Math.sin(df / 2) ** 2 + Math.cos(f1) * Math.cos(f2) * Math.sin(dl / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function calcMaxGrade(er) {
  let mx = 0;
  for (let i = 1; i < er.length; i++) {
    const dE = Math.abs(er[i].elevation - er[i - 1].elevation);
    const dD = haversine(er[i - 1].location.lat(), er[i - 1].location.lng(), er[i].location.lat(), er[i].location.lng());
    if (dD > 0) mx = Math.max(mx, (dE / dD) * 100);
  }
  return mx.toFixed(1);
}

export function calcScore(dist, dur, gain) {
  return Math.round(Math.max(0, 100 - dist / 1000) * 0.3 + Math.max(0, 100 - dur / 60) * 0.4 + Math.max(0, 100 - gain / 10) * 0.3);
}

export function hexRgb(h) {
  return `${parseInt(h.slice(1, 3), 16)},${parseInt(h.slice(3, 5), 16)},${parseInt(h.slice(5, 7), 16)}`;
}
