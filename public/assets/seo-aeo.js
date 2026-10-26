/* Saul's Podship — GEO metadata helper.
   Route FAQ content and FAQPage JSON-LD are rendered by React from src/data/faq.ts,
   so this asset intentionally never writes visible DOM or structured data. */
(function () {
  var geo = [
    ['geo.region', 'PK'],
    ['geo.placename', 'Karachi, Pakistan — serving believers worldwide'],
    ['geo.position', '24.8607;67.0011'],
    ['ICBM', '24.8607, 67.0011']
  ];

  geo.forEach(function (entry) {
    var selector = 'meta[name="' + entry[0] + '"]';
    var meta = document.head.querySelector(selector);
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = entry[0];
      document.head.appendChild(meta);
    }
    meta.content = entry[1];
  });
})();
