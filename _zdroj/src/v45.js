
// ===================== v2.25: jídelníček v2.1 (každý večer 2 porce, svačiny podle typu) =====================
// jednorázově přepnout na vestavěný plán 2.1; předchozí aktivní verze zůstane jako „předchozí“ (jde vrátit v Nastavení)
(function () { const V = JD_DEFAULT.meta.verze + '@' + JD_DEFAULT.meta.datum; if (S.settings.jdForce === V) return; const L = jlLoad();
  if (L.act !== 'default') { L.prev = L.act; L.act = 'default'; if (!jlSave(L)) return; jlApply(); } S.settings.jdForce = V; save(); })();
