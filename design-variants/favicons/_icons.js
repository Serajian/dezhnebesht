/* دوازده نامزد favicon برای دژنبشت.
 *
 * قید حاکم: خوانایی در ۱۶ پیکسل. viewBox روی ۰ ۰ ۳۲ ۳۲ است، پس هر
 * واحد در ۱۶ پیکسل نیم پیکسل می‌شود — هیچ جزئیاتی نازک‌تر از ۳ واحد
 * نباید باشد وگرنه در تب مرورگر محو می‌شود.
 *
 * همه با currentColor کار می‌کنند تا صفحهٔ انتخاب بتواند در رنگ‌ها و
 * زمینه‌های مختلف نشانشان بدهد.
 */

export const ICONS = [
  {
    id: 'battlement',
    fa: 'کنگرهٔ دژ',
    note: 'سیلوئت کنگرهٔ برج. مستقیم‌ترین خوانش «دژ» و قوی‌ترین سیلوئت در اندازهٔ کوچک.',
    svg: `<path fill="currentColor" d="M3 11h5V6h4v5h4V6h4v5h5v15H3z"/>`,
  },
  {
    id: 'battlement-lines',
    fa: 'دژ و نوشته',
    note: 'کنگره با سه سطر نوشته در فضای منفی — «دژِ نوشته‌ها» در یک شکل.',
    svg: `<path fill="currentColor" d="M3 11h5V6h4v5h4V6h4v5h5v15H3z"/>
          <path fill="var(--icon-bg, #fff)" d="M7 15h18v2.4H7zm0 4.6h18V22H7z"/>`,
  },
  {
    id: 'chain',
    fa: 'زنجیر گره‌ها',
    note: 'سه گره لوزی روی یک خط — امضای بصری خودِ سایت، همان چیزی که دسته‌ها را به هم وصل می‌کند.',
    svg: `<path fill="currentColor" d="M14.6 3.6h2.8v24.8h-2.8z"/>
          <path fill="currentColor" d="M16 2.2l4.6 4.6L16 11.4 11.4 6.8zm0 9.6l4.6 4.6L16 21l-4.6-4.6zm0 9.6l4.6 4.6L16 30.6 11.4 26z"/>`,
  },
  {
    id: 'node',
    fa: 'گره تنها',
    note: 'یک لوزی توپر با برشِ درونی. کمینه‌ترین نسخه — در ۱۶ پیکسل هم کاملاً واضح.',
    svg: `<path fill="currentColor" d="M16 1.5L30.5 16 16 30.5 1.5 16z"/>
          <path fill="var(--icon-bg, #fff)" d="M16 9.5L22.5 16 16 22.5 9.5 16z"/>`,
  },
  {
    id: 'dal',
    fa: 'حرف د',
    note: 'حرف «د» به شکل هندسی — حرف اول نام. تنها نسخه‌ای که مستقیماً فارسی است.',
    svg: `<path fill="currentColor" d="M7 6h13.5c4.7 0 8 3 8 7.3 0 4.6-3.6 7.7-8.6 7.7H13v5H7z"/>
          <path fill="var(--icon-bg, #fff)" d="M13 11.4h7.2c1.6 0 2.6.8 2.6 2 0 1.3-1 2.1-2.7 2.1H13z"/>`,
  },
  {
    id: 'tablet',
    fa: 'لوح گلی',
    note: 'لوح با سه سطر میخی — اشاره به لوح‌های تخت جمشید که خودشان یک آرشیو بودند.',
    svg: `<rect x="4" y="4" width="24" height="24" rx="3" fill="currentColor"/>
          <g fill="var(--icon-bg, #fff)">
            <path d="M8 10h4l-2 3.4zm6 0h4l-2 3.4zm6 0h4l-2 3.4z"/>
            <path d="M8 17h4l-2 3.4zm6 0h4l-2 3.4zm6 0h4l-2 3.4z"/>
          </g>`,
  },
  {
    id: 'stack',
    fa: 'انباشت',
    note: 'سه نوار با عرض کاهنده — دانشی که لایه‌لایه روی هم جمع می‌شود.',
    svg: `<g fill="currentColor">
            <rect x="3" y="7" width="26" height="5" rx="2"/>
            <rect x="6" y="14.5" width="20" height="5" rx="2"/>
            <rect x="9" y="22" width="14" height="5" rx="2"/>
          </g>`,
  },
  {
    id: 'seal',
    fa: 'مُهر ساسانی',
    note: 'مُهر گرد با ستارهٔ چهارپر. آرشیو با مُهر بسته می‌شد.',
    svg: `<circle cx="16" cy="16" r="14" fill="currentColor"/>
          <path fill="var(--icon-bg, #fff)" d="M16 5.5l3 7.5 7.5 3-7.5 3-3 7.5-3-7.5-7.5-3 7.5-3z"/>`,
  },
  {
    id: 'blocks',
    fa: 'بلوک‌های زنجیرشده',
    note: 'سه بلوک با بند اتصال — موضوع اول سایت، و همان استعارهٔ زنجیر.',
    svg: `<g fill="currentColor">
            <rect x="2.5" y="11" width="8" height="10" rx="2"/>
            <rect x="12" y="11" width="8" height="10" rx="2"/>
            <rect x="21.5" y="11" width="8" height="10" rx="2"/>
            <rect x="10" y="14.6" width="4" height="2.8"/>
            <rect x="19.5" y="14.6" width="4" height="2.8"/>
          </g>`,
  },
  {
    id: 'arch',
    fa: 'طاق',
    note: 'طاق بلند ساسانی. سیلوئتی که فقط با یک شکل، معماری را می‌رساند.',
    svg: `<path fill="currentColor" d="M4 29V15c0-6.6 5.4-12 12-12s12 5.4 12 12v14h-7V15a5 5 0 0 0-10 0v14z"/>`,
  },
  {
    id: 'pages',
    fa: 'برگ‌ها',
    note: 'سه برگ جابه‌جا روی هم — نوشته‌ها، نه ساختمان.',
    svg: `<g fill="currentColor">
            <rect x="3" y="3" width="18" height="22" rx="2.5" opacity="0.45"/>
            <rect x="7" y="6" width="18" height="22" rx="2.5" opacity="0.7"/>
            <rect x="11" y="9" width="18" height="22" rx="2.5"/>
          </g>`,
  },
  {
    id: 'wedge',
    fa: 'میخ',
    note: 'یک میخِ خط میخی، بزرگ و تنها. جسورترین نسخه — هیچ جزئیاتی برای گم شدن ندارد.',
    svg: `<path fill="currentColor" d="M6 4h13.5L29 16l-9.5 12H6l9.5-12z"/>`,
  },
];
