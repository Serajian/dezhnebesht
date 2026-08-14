// منطق محضِ نقشهٔ راه — بدون DOM و بدون localStorage، پس در Node
// import می‌شود و با تست پوشش داده می‌شود. همان تفکیکی که groups.js دارد.

/**
 * شناسه‌ی همهٔ مدخل‌های نقشه، به ترتیب مسیر. نقشهٔ خراب یا غایب
 * آرایه‌ی خالی می‌دهد، نه استثنا — سایت باید بالا بیاید.
 */
export function roadmapEntryIds(roadmap) {
  if (!Array.isArray(roadmap?.stages)) return [];
  return roadmap.stages.flatMap((stage) => (Array.isArray(stage?.entries) ? stage.entries : []));
}

/**
 * اعتبارسنجی خالص نقشه. خروجی هم‌شکلِ خطاهای data.js است تا در همان
 * بنر موجود بنشیند.
 */
export function validateRoadmap(roadmap, entries, topicId) {
  const file = `${topicId}/roadmap.json`;
  const errors = [];
  if (!roadmap || typeof roadmap !== 'object' || !Array.isArray(roadmap.stages)) {
    errors.push({ file, id: '', message: 'نقشه باید شیئی با آرایه‌ی stages باشد' });
    return errors;
  }

  // فقط مدخل‌های همین موضوع مجازند: نقشه به‌ازای هر موضوع است و
  // شناسه‌ها در کل سایت یکتا هستند، پس اشتباه گرفتن‌شان ممکن است.
  const inTopic = new Set(entries.filter((entry) => entry.topic === topicId).map((entry) => entry.id));

  const seenStage = new Set();
  const seenEntry = new Map();

  for (const stage of roadmap.stages) {
    if (!stage?.id) {
      errors.push({ file, id: '(بدون شناسه)', message: 'مرحله فیلد id ندارد' });
      continue;
    }
    if (seenStage.has(stage.id)) {
      errors.push({ file, id: stage.id, message: 'شناسه‌ی مرحله تکراری است' });
    }
    seenStage.add(stage.id);

    if (!stage.fa?.title) {
      errors.push({ file, id: stage.id, message: 'مرحله عنوان فارسی (fa.title) ندارد' });
    }
    if (!Array.isArray(stage.entries)) {
      errors.push({ file, id: stage.id, message: 'مرحله آرایه‌ی entries ندارد' });
      continue;
    }
    for (const entryId of stage.entries) {
      if (!inTopic.has(entryId)) {
        errors.push({ file, id: stage.id, message: `مدخلی با شناسه‌ی ${entryId} در این موضوع وجود ندارد` });
        continue;
      }
      if (seenEntry.has(entryId)) {
        errors.push({
          file,
          id: stage.id,
          message: `مدخل ${entryId} در بیش از یک مرحله آمده (${seenEntry.get(entryId)} و ${stage.id})`,
        });
      } else {
        seenEntry.set(entryId, stage.id);
      }
    }
  }
  return errors;
}
