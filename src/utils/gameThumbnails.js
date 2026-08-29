// Made by loxqcx on Discord.
export function chooseRotatingThumbnail(urls, previousUrl = '', random = Math.random) {
  const available = [...new Set((urls || []).filter(Boolean))];
  if (!available.length) return '';
  const choices = available.length > 1 ? available.filter((url) => url !== previousUrl) : available;
  return choices[Math.floor(random() * choices.length)] || choices[0];
}
