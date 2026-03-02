import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import func2url from '../../backend/func2url.json';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

const HERO_IMG = "https://cdn.poehali.dev/projects/ed2b7d01-b39a-4dfc-86fa-df4a86f0bc38/bucket/09eaa7cf-3225-45f4-9b0d-ccd87df069d0.jpeg";
const PROJECT_IMG = "https://cdn.poehali.dev/projects/53d4eefc-24fa-41e9-b99a-3ee269a34aaf/files/f58cf424-fa55-4a9a-b4e1-748eda347225.jpg";
const BLOCKS_IMG = "https://cdn.poehali.dev/projects/53d4eefc-24fa-41e9-b99a-3ee269a34aaf/files/0e364350-2f9f-43b4-ac89-786857994f60.jpg";
const WAREHOUSE_IMG = "https://cdn.poehali.dev/projects/53d4eefc-24fa-41e9-b99a-3ee269a34aaf/files/b0027a22-2ff1-4763-a903-80740aeb5c92.jpg";

function useScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );
    const el = ref.current;
    if (el) {
      el.querySelectorAll('.scroll-animate').forEach((child) => observer.observe(child));
    }
    return () => observer.disconnect();
  }, []);
  return ref;
}

function AnimatedCounter({ end, suffix = '', duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [started, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

function FlipCard({ frontImage, frontTitle, backTitle, backDescription, backImage, noBlur, clickable }: {
  frontImage: string;
  frontTitle: string;
  backTitle: string;
  backDescription: string;
  backImage?: string;
  noBlur?: boolean;
  clickable?: boolean;
}) {
  const [flipped, setFlipped] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const isImageBack = backImage && !backTitle;
  const canOpenModal = isImageBack || (clickable && backImage);

  const handleMouseLeaveCard = () => {
    if (!modalOpen) setFlipped(false);
  };

  const handleBackClick = () => {
    if (canOpenModal) setModalOpen(true);
  };

  return (
    <>
      <div
        className="flip-card h-[320px] md:h-[360px] cursor-pointer"
        onMouseEnter={() => setFlipped(true)}
        onMouseLeave={handleMouseLeaveCard}
      >
        <div
          className="flip-card-inner"
          style={{
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.6s'
          }}
        >
          <div className="flip-card-front bg-white shadow-lg">
            <img src={frontImage} alt={frontTitle} className="w-full h-full object-cover" />
          </div>
          <div
            className={`flip-card-back shadow-lg overflow-hidden relative${canOpenModal ? ' cursor-zoom-in' : ''}`}
            onClick={handleBackClick}
          >
            <img src={backImage || frontImage} alt={backTitle} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'rgba(30,58,95,0.72)', backdropFilter: noBlur ? undefined : 'blur(6px)' }} />
            <div className="relative z-10 flex flex-col items-center justify-center h-full p-6 text-white text-center">
              <h3 className="font-bold text-xl mb-3">{backTitle}</h3>
              <p className="text-white/85 text-sm leading-relaxed">{backDescription}</p>
            </div>
          </div>
        </div>
      </div>

      {modalOpen && canOpenModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => { setModalOpen(false); setFlipped(false); }}>
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <img
              src={backImage}
              alt="Характеристики"
              className="rounded-xl shadow-2xl bg-white"
              style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain' }}
            />
            <button
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
              onClick={() => { setModalOpen(false); setFlipped(false); }}
            >
              <Icon name="X" size={18} />
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

const REVIEWS_URL = func2url['reviews'];

function LeaveReviewForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const [stars, setStars] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stars || !name.trim() || !text.trim()) return;
    setLoading(true);
    await fetch(REVIEWS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author: name.trim(), text: text.trim(), stars }),
    });
    setLoading(false);
    setSent(true);
    onSubmitted?.();
  };

  if (sent) {
    return (
      <div className="text-center py-4">
        <div className="text-3xl mb-2">🎉</div>
        <div className="font-semibold text-[#1E3A5F]">Спасибо за отзыв!</div>
        <div className="text-sm text-[#333]/50 mt-1">Он появится после проверки</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-1">
        {[1,2,3,4,5].map((s) => (
          <button
            key={s}
            type="button"
            onMouseEnter={() => setHovered(s)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setStars(s)}
          >
            <Icon
              name="Star"
              size={28}
              className={`transition-colors ${s <= (hovered || stars) ? 'text-[#E67E22] fill-[#E67E22]' : 'text-[#333]/20'}`}
            />
          </button>
        ))}
      </div>
      <Input
        placeholder="Ваше имя"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="bg-white border-[#1E3A5F]/15"
      />
      <Textarea
        placeholder="Ваш отзыв..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        className="bg-white border-[#1E3A5F]/15 resize-none"
      />
      <Button
        type="submit"
        disabled={!stars || !name.trim() || !text.trim() || loading}
        className="w-full bg-[#E67E22] hover:bg-[#d97218] text-white"
      >
        {loading ? 'Отправляем...' : 'Отправить отзыв'}
      </Button>
    </form>
  );
}

// ─── CATALOG DATA ─────────────────────────────────────────────────────────────
const CATALOG = [
  {
    id: 'pipes',
    title: 'Трубы',
    image: 'https://cdn.poehali.dev/projects/53d4eefc-24fa-41e9-b99a-3ee269a34aaf/bucket/b0027a22-2ff1-4763-a903-80740aeb5c92.jpg',
    subcategories: [
      {
        id: 'pressure',
        title: 'Напорные',
        items: ['100×3950', '150×3950', '200×3950', '200×5000', '250×5000', '300×3950', '300×5000', '400×3950', '400×5000', '500×5000'],
        unit: 'мм',
        colors: null,
      },
      {
        id: 'nonpressure',
        title: 'Безнапорные',
        items: ['100×9×3950', '150×10×3950', '200×11×3950', '300×15×3950', '300×5000', '400×19×5000', '500×23×5000'],
        unit: 'мм',
        colors: null,
      },
    ],
  },
  {
    id: 'slate',
    title: 'Шифер',
    image: 'https://cdn.poehali.dev/projects/53d4eefc-24fa-41e9-b99a-3ee269a34aaf/bucket/2b316a9f-dd27-4186-80d5-f14031da1d9d.jpeg',
    subcategories: [
      {
        id: 'slate8',
        title: '8-волновой',
        items: ['1750×1130×5,2'],
        unit: 'мм',
        colors: null,
      },
      {
        id: 'slateflat',
        title: 'Плоский',
        items: ['1200×1570×8', '1200×1570×10'],
        unit: 'мм',
        colors: null,
      },
      {
        id: 'slategarden',
        title: 'Для грядок',
        items: ['390×2500×8'],
        unit: 'мм',
        colors: null,
      },
    ],
  },
  {
    id: 'volnacolor',
    title: 'Цветная кровля',
    image: 'https://cdn.poehali.dev/projects/53d4eefc-24fa-41e9-b99a-3ee269a34aaf/bucket/51d898ff-06ce-4700-80cc-971341176291.jpeg',
    subcategories: [
      {
        id: 'volnacolor',
        title: 'Волнаколор',
        items: ['1250×1097×6'],
        unit: 'мм',
        colors: ['Шоколад', 'Красно-коричневый', 'Графит'],
      },
    ],
  },
];

function CatalogSection({ onOrderClick }: { onOrderClick: (params: string) => void }) {
  const [catId, setCatId] = useState<string | null>(null);
  const [subId, setSubId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const cat = CATALOG.find((c) => c.id === catId);
  const sub = cat?.subcategories.find((s) => s.id === subId);

  const goBack = () => {
    if (subId) { setSubId(null); setSelectedItem(null); setSelectedColor(null); }
    else { setCatId(null); }
  };

  const handleOrder = () => {
    if (!cat || !sub || !selectedItem) return;
    let params = `${cat.title} / ${sub.title} / ${selectedItem} ${sub.unit}`;
    if (selectedColor) params += ` / Цвет: ${selectedColor}`;
    onOrderClick(params);
  };

  // LEVEL 1 — categories
  if (!catId) return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {CATALOG.map((c) => (
        <button
          key={c.id}
          onClick={() => { setCatId(c.id); setSubId(null); setSelectedItem(null); setSelectedColor(null); }}
          className="group relative overflow-hidden rounded-2xl h-56 sm:h-64 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left"
        >
          <img src={c.image} alt={c.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1E3A5F]/80 via-[#1E3A5F]/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h3 className="text-white font-extrabold text-xl" style={{ fontFamily: 'Montserrat' }}>{c.title}</h3>
            <span className="inline-flex items-center gap-1 mt-1 text-[#E67E22] text-sm font-semibold">
              Смотреть <Icon name="ChevronRight" size={16} />
            </span>
          </div>
        </button>
      ))}
    </div>
  );

  // LEVEL 2 — subcategories
  if (!subId) return (
    <div>
      <div className="flex flex-wrap gap-2 items-center mb-6">
        <button onClick={() => setCatId(null)} className="text-sm text-[#1E3A5F]/50 hover:text-[#E67E22] transition-colors">Каталог</button>
        <Icon name="ChevronRight" size={14} className="text-[#1E3A5F]/30" />
        <span className="text-sm font-semibold text-[#1E3A5F]">{cat!.title}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {cat!.subcategories.map((s) => (
          <button
            key={s.id}
            onClick={() => { setSubId(s.id); setSelectedItem(null); setSelectedColor(null); }}
            className="group border-2 border-[#1E3A5F]/10 hover:border-[#E67E22] rounded-2xl p-6 text-left transition-all duration-200 bg-white hover:shadow-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-[#E67E22]/10 flex items-center justify-center mb-4 group-hover:bg-[#E67E22] transition-colors">
              <Icon name="Package" size={20} className="text-[#E67E22] group-hover:text-white transition-colors" />
            </div>
            <h3 className="font-bold text-[#1E3A5F] text-lg mb-1">{s.title}</h3>
            <p className="text-sm text-[#333]/50">{s.items.length} {s.items.length === 1 ? 'размер' : s.items.length < 5 ? 'размера' : 'размеров'}</p>
          </button>
        ))}
      </div>
    </div>
  );

  // LEVEL 3 — product card
  return (
    <div>
      <div className="flex flex-wrap gap-2 items-center mb-6">
        <button onClick={() => { setCatId(null); setSubId(null); }} className="text-sm text-[#1E3A5F]/50 hover:text-[#E67E22] transition-colors">Каталог</button>
        <Icon name="ChevronRight" size={14} className="text-[#1E3A5F]/30" />
        <button onClick={() => setSubId(null)} className="text-sm text-[#1E3A5F]/50 hover:text-[#E67E22] transition-colors">{cat!.title}</button>
        <Icon name="ChevronRight" size={14} className="text-[#1E3A5F]/30" />
        <span className="text-sm font-semibold text-[#1E3A5F]">{sub!.title}</span>
      </div>
      <div className={`flex flex-col ${sub!.id === 'nonpressure' ? 'md:flex-row' : ''} gap-6 items-stretch`}>
      <div className="bg-white rounded-2xl shadow-sm border border-[#1E3A5F]/8 p-6 md:p-8 flex-1 min-w-0 flex flex-col">
        <h3 className="font-extrabold text-[#1E3A5F] text-xl mb-1" style={{ fontFamily: 'Montserrat' }}>
          {cat!.title} — {sub!.title}
        </h3>
        <p className="text-sm text-[#333]/50 mb-6">Выберите размер{sub!.colors ? ' и цвет' : ''}</p>

        <p className="text-xs font-semibold text-[#333]/40 uppercase tracking-wider mb-3">Размер, {sub!.unit}</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {sub!.items.map((item) => (
            <button
              key={item}
              onClick={() => setSelectedItem(item)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all duration-150 ${
                selectedItem === item
                  ? 'bg-[#1E3A5F] border-[#1E3A5F] text-white shadow-md'
                  : 'border-[#1E3A5F]/15 text-[#1E3A5F] hover:border-[#E67E22] hover:text-[#E67E22] bg-white'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {sub!.colors && (
          <>
            <p className="text-xs font-semibold text-[#333]/40 uppercase tracking-wider mb-3">Цвет</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {sub!.colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all duration-150 ${
                    selectedColor === color
                      ? 'bg-[#E67E22] border-[#E67E22] text-white shadow-md'
                      : 'border-[#E67E22]/25 text-[#E67E22] hover:border-[#E67E22] bg-white'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </>
        )}

        <div className="mt-auto pt-4">
          <Button
            onClick={handleOrder}
            disabled={!selectedItem || (!!sub!.colors && !selectedColor)}
            className="w-full sm:w-auto bg-[#E67E22] hover:bg-[#d35400] text-white font-bold px-8 py-3 text-base rounded-xl disabled:opacity-40"
          >
            Узнать цену
          </Button>
        </div>
      </div>
      {sub!.id === 'nonpressure' && (
        <div className="hidden md:flex flex-1 min-w-0 rounded-2xl overflow-hidden shadow-sm border border-[#1E3A5F]/8">
          <img
            src="https://cdn.poehali.dev/projects/ed2b7d01-b39a-4dfc-86fa-df4a86f0bc38/bucket/37c2414a-1765-4a31-85e4-d9d8eae5c042.jpeg"
            alt="Безнапорные трубы"
            className="w-full h-full object-fill"
          />
        </div>
      )}
      </div>
    </div>
  );
}

// ─── INDEX ────────────────────────────────────────────────────────────────────
const Index = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' });
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const containerRef = useScrollAnimation();

  useEffect(() => {
    const onScroll = () => setHeaderScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const navItems = [
    { label: 'О компании', id: 'trust' },
    { label: 'Товары', id: 'categories' },
    { label: 'Преимущества', id: 'why-vis' },
    { label: 'Услуги', id: 'services' },
    { label: 'Объекты', id: 'projects' },
    { label: 'Отзывы', id: 'reviews' },
    { label: 'Контакты', id: 'contacts' },
  ];

  const services = [
    { icon: 'Train', title: 'Ж/Д тупик', description: 'Собственный железнодорожный тупик для приёмки вагонов с материалами' },
    { icon: 'Truck', title: 'Доставка', description: 'Доставка по Приморскому краю и Дальнему Востоку' },
    { icon: 'Calculator', title: 'Расчёт материалов', description: 'Бесплатный выезд на замеры и помощь в расчёте необходимого количества материалов' },
    { icon: 'RefreshCw', title: 'Бесперебойная поставка', description: 'Стабильные поставки на объект по согласованному графику' },
  ];

  const projects = [
    {
      frontImage: 'https://cdn.poehali.dev/projects/53d4eefc-24fa-41e9-b99a-3ee269a34aaf/bucket/2b316a9f-dd27-4186-80d5-f14031da1d9d.jpeg',
      frontTitle: 'Объект 1',
      backTitle: 'Частный дом',
      backDescription: 'Поставка газобетона для строительства трёхэтажного частного дома с гаражом.',
      backImage: 'https://cdn.poehali.dev/projects/53d4eefc-24fa-41e9-b99a-3ee269a34aaf/bucket/2b316a9f-dd27-4186-80d5-f14031da1d9d.jpeg',
    },
    {
      frontImage: 'https://cdn.poehali.dev/projects/53d4eefc-24fa-41e9-b99a-3ee269a34aaf/bucket/51d898ff-06ce-4700-80cc-971341176291.jpeg',
      frontTitle: 'Объект 2',
      backTitle: 'Одноэтажный дом',
      backDescription: 'Поставка газобетонных блоков для строительства одноэтажного жилого дома.',
      backImage: 'https://cdn.poehali.dev/projects/53d4eefc-24fa-41e9-b99a-3ee269a34aaf/bucket/51d898ff-06ce-4700-80cc-971341176291.jpeg',
    },
    {
      frontImage: 'https://cdn.poehali.dev/projects/53d4eefc-24fa-41e9-b99a-3ee269a34aaf/bucket/a7bd0a15-d930-46e9-81fa-117f19da3fc3.jpeg',
      frontTitle: 'Объект 3',
      backTitle: 'Двухэтажный дом',
      backDescription: 'Газобетон для двухэтажного дома с мансардой и панорамными окнами.',
      backImage: 'https://cdn.poehali.dev/projects/53d4eefc-24fa-41e9-b99a-3ee269a34aaf/bucket/a7bd0a15-d930-46e9-81fa-117f19da3fc3.jpeg',
    },
    {
      frontImage: 'https://cdn.poehali.dev/projects/53d4eefc-24fa-41e9-b99a-3ee269a34aaf/bucket/44db49fc-c19d-461d-b8ba-f5f7fcc3a263.jpeg',
      frontTitle: 'Объект 4',
      backTitle: 'Коттедж',
      backDescription: 'Поставка стеновых блоков для строительства коттеджа с тёмными окнами.',
      backImage: 'https://cdn.poehali.dev/projects/53d4eefc-24fa-41e9-b99a-3ee269a34aaf/bucket/44db49fc-c19d-461d-b8ba-f5f7fcc3a263.jpeg',
    },
  ];

  const staticReviews = [
    { company: 'СтройИнвест', author: 'Александр Петров', role: 'Директор', text: 'Работаем с ВИС уже 5 лет. Стабильные поставки, адекватные цены и всегда в наличии нужный ассортимент.', stars: 5 },
    { company: 'ДВ-Строй', author: 'Марина Ким', role: 'Начальник снабжения', text: 'Отличная логистика и оперативность. Материалы приходят точно в срок, качество подтверждено сертификатами.', stars: 5 },
    { company: 'ПримСтрой', author: 'Олег Волков', role: 'Прораб', text: 'Газобетон от ВИС — идеальная геометрия блоков. Кладка идёт быстро, расход клея минимальный.', stars: 5 },
  ];

  const [dbReviews, setDbReviews] = useState<{ id: number; author: string; company: string; role: string; text: string; stars: number }[]>([]);

  const loadReviews = () => {
    fetch(REVIEWS_URL)
      .then((r) => r.json())
      .then((data) => setDbReviews(data.reviews || []))
      .catch(() => {});
  };

  useEffect(() => { loadReviews(); }, []);

  const reviews = [
    ...dbReviews.map((r) => ({ company: r.company, author: r.author, role: r.role, text: r.text, stars: r.stars })),
    ...staticReviews,
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-[#F8F8F8]">
      {/* HEADER */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerScrolled ? 'bg-white/95 backdrop-blur-sm shadow-md' : 'bg-transparent'}`}>
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center gap-2">
            <img
              src="https://cdn.poehali.dev/projects/53d4eefc-24fa-41e9-b99a-3ee269a34aaf/bucket/b7e4dd2d-de05-4a2e-b0d5-bcf1064e0acc.png"
              alt="ВИС"
              className="h-12 md:h-14 w-auto cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            />
          </div>

          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`text-sm font-medium transition-colors hover:text-[#E67E22] ${headerScrolled ? 'text-[#333]' : 'text-white/90'}`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="tel:+74232448010"
              className={`hidden md:flex items-center gap-1.5 text-sm font-semibold transition-colors ${headerScrolled ? 'text-[#1E3A5F]' : 'text-white'}`}
            >
              <Icon name="Phone" size={16} />
              +7 (423) 244-80-10
            </a>
            <Button
              size="sm"
              className="bg-[#E67E22] hover:bg-[#d35400] text-white font-semibold hidden md:flex relative overflow-hidden ripple-btn"
              onClick={(e) => {
                const btn = e.currentTarget;
                const circle = document.createElement('span');
                const diameter = Math.max(btn.clientWidth, btn.clientHeight);
                const radius = diameter / 2;
                circle.style.cssText = `width:${diameter}px;height:${diameter}px;left:${e.clientX - btn.getBoundingClientRect().left - radius}px;top:${e.clientY - btn.getBoundingClientRect().top - radius}px;position:absolute;border-radius:50%;background:rgba(255,255,255,0.4);transform:scale(0);animation:ripple 0.6s linear;pointer-events:none;`;
                btn.appendChild(circle);
                setTimeout(() => circle.remove(), 600);
                scrollTo('callback');
              }}
            >
              Получить расчёт
            </Button>
            <button
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Icon name={mobileMenuOpen ? 'X' : 'Menu'} size={28} className={headerScrolled ? 'text-[#333]' : 'text-white'} />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-white shadow-lg border-t">
            <div className="px-4 py-4 space-y-3">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className="block w-full text-left text-[#333] font-medium py-2 hover:text-[#E67E22] transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <a href="tel:+74232448010" className="block text-[#1E3A5F] font-semibold py-2">
                +7 (423) 244-80-10
              </a>
              <Button className="w-full bg-[#E67E22] hover:bg-[#d35400] text-white" onClick={() => scrollTo('callback')}>
                Получить расчёт
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section
        className="relative min-h-screen flex items-start justify-center"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(30,58,95,0.82) 0%, rgba(30,58,95,0.55) 100%), url('${HERO_IMG}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 text-center text-white md:pt-[300px] py-[205px]">
          <h1 className="md:text-5xl lg:text-6xl leading-tight animate-fade-in mx-0 px-11 my-4 font-black text-5xl" style={{ fontFamily: 'Montserrat' }}>
            Асбестоцементные трубы и шифер.
            <br />
            <span className="text-[#E67E22]">Классика, которая работает</span>
          </h1>
          <p className="text-lg md:text-2xl text-white/85 max-w-3xl mx-auto mb-8 animate-fade-in-delay-1">
            Гарантия качества в каждом блоке
          </p>
        </div>
      </section>

      {/* TRUST NUMBERS */}
      <section id="trust" className="py-16 md:py-24 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { number: 23, suffix: '+', label: 'Лет на рынке стройматериалов', icon: 'Calendar' },
              { number: 2000, suffix: '+', label: 'Объектов снабжено', icon: 'Building2' },
              { number: 5000, suffix: ' м²', label: 'Площадь складского комплекса', icon: 'Warehouse' },
              { number: 24, suffix: 'ч', label: 'От заявки до отгрузки', icon: 'Clock' },
            ].map((stat, i) => (
              <div key={i} className="scroll-animate text-center group">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl relative flex items-center justify-center overflow-hidden bg-[#1E3A5F]/5">
                  <div className="absolute bottom-0 left-0 right-0 h-0 bg-[#E67E22] transition-all duration-500 ease-out group-hover:h-full" />
                  <Icon name={stat.icon} size={28} className="text-[#1E3A5F] group-hover:text-white transition-colors duration-300 relative z-10" />
                </div>
                <div className="text-3xl md:text-4xl font-extrabold text-[#1E3A5F] mb-2" style={{ fontFamily: 'Montserrat' }}>
                  {stat.number === 24 ? '< ' : ''}<AnimatedCounter end={stat.number} suffix={stat.suffix} />
                </div>
                <p className="text-sm md:text-base text-[#333]/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="categories" className="py-16 md:py-24 bg-[#F8F8F8]">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          <div className="scroll-animate text-center mb-12 md:mb-16">
            <p className="text-[#E67E22] font-semibold text-sm uppercase tracking-widest mb-3">Каталог</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1E3A5F]" style={{ fontFamily: 'Montserrat' }}>
              Асбестоцементные изделия
            </h2>
            <p className="text-[#333]/60 mt-4 max-w-xl mx-auto">
              Выберите категорию, затем подкатегорию и нужный размер
            </p>
          </div>
          <CatalogSection
            onOrderClick={(params) => {
              setFormData((prev) => ({ ...prev, message: params }));
              scrollTo('callback');
            }}
          />
        </div>
      </section>

      {/* WHY VIS */}
      <section id="why-vis" className="py-16 md:py-24 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          <div className="scroll-animate text-center mb-8">
            <p className="text-[#E67E22] font-semibold text-sm uppercase tracking-widest mb-3">Почему выбирают нас</p>
          </div>
          {(() => {
            const imgs = [
              { src: 'https://cdn.poehali.dev/projects/53d4eefc-24fa-41e9-b99a-3ee269a34aaf/bucket/9c4a9017-aa7d-4310-b677-354098a3ea03.jpg', alt: 'Почему выбирают нас' },
              { src: 'https://cdn.poehali.dev/projects/53d4eefc-24fa-41e9-b99a-3ee269a34aaf/bucket/9e2e8bef-3d4c-4a50-bf29-faa17aff20db.jpg', alt: 'ВИС — всё для стройки' },
            ];
            return (
              <div className="grid grid-cols-2 gap-4">
                {imgs.map((img, i) => (
                  <div
                    key={i}
                    className="scroll-animate rounded-2xl overflow-hidden h-[400px] cursor-zoom-in"
                    onClick={() => {
                      const overlay = document.createElement('div');
                      overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;cursor:zoom-out;animation:fadeIn 0.2s ease';
                      const imgEl = document.createElement('img');
                      imgEl.src = img.src;
                      imgEl.alt = img.alt;
                      imgEl.style.cssText = 'max-width:90vw;max-height:90vh;object-fit:contain;border-radius:12px;box-shadow:0 25px 60px rgba(0,0,0,0.5)';
                      overlay.appendChild(imgEl);
                      overlay.onclick = () => overlay.remove();
                      document.body.appendChild(overlay);
                    }}
                  >
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-full object-fill transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-16 md:py-24 bg-[#1E3A5F]">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          <div className="scroll-animate text-center mb-12 md:mb-16">
            <p className="text-[#E67E22] font-semibold text-sm uppercase tracking-widest mb-3">Сервис</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white" style={{ fontFamily: 'Montserrat' }}>
              Наши услуги
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((srv, i) => (
              <div
                key={i}
                className="scroll-animate group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 flex flex-col items-center text-center"
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                <div className="w-14 h-14 rounded-xl relative flex items-center justify-center mb-5 overflow-hidden bg-[#E67E22]/20">
                  <div className="absolute bottom-0 left-0 right-0 h-0 bg-[#E67E22] transition-all duration-500 ease-out group-hover:h-full" />
                  <Icon name={srv.icon} size={26} className="text-[#E67E22] group-hover:text-white transition-colors duration-300 relative z-10" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{srv.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{srv.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section id="projects" className="py-16 md:py-24 bg-[#F8F8F8]">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          <div className="scroll-animate text-center mb-12 md:mb-16">
            <p className="text-[#E67E22] font-semibold text-sm uppercase tracking-widest mb-3">Портфолио</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1E3A5F]" style={{ fontFamily: 'Montserrat' }}>
              Выполненные объекты
            </h2>
            <p className="text-[#333]/60 mt-4 max-w-xl mx-auto">
              Наведите на карточку, чтобы увидеть детали поставки
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {projects.map((proj, i) => (
              <div key={i} className="scroll-animate" style={{ transitionDelay: `${i * 0.1}s` }}>
                <FlipCard {...proj} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" className="py-16 md:py-24 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          <div className="scroll-animate text-center mb-12 md:mb-16">
            <p className="text-[#E67E22] font-semibold text-sm uppercase tracking-widest mb-3">Отзывы</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1E3A5F]" style={{ fontFamily: 'Montserrat' }}>
              Нам доверяют застройщики
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((rev, i) => (
              <Card
                key={i}
                className="scroll-animate border-0 shadow-sm hover:shadow-lg transition-shadow duration-300 bg-[#F8F8F8]"
                style={{ transitionDelay: `${i * 0.08}s` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Icon key={s} name="Star" size={16} className="text-[#E67E22] fill-[#E67E22]" />
                    ))}
                  </div>
                  <p className="text-[#333]/80 leading-relaxed mb-5 text-sm">«{rev.text}»</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1E3A5F] flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{rev.author[0]}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-[#333] text-sm">{rev.author}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="scroll-animate mt-12">
            <div className="flex flex-col items-center gap-6">
              <div className="flex flex-wrap justify-center gap-4">
                <div className="reviews-widget-card animate-float bg-gradient-to-br from-[#fff7ed] to-[#fff] border border-[#E67E22]/20 rounded-2xl px-6 py-4 flex items-center gap-4 shadow-md">
                  <div className="text-4xl font-extrabold text-[#E67E22] leading-none">4.7</div>
                  <div>
                    <div className="flex gap-0.5 mb-1">
                      {[1,2,3,4].map((s) => (
                        <Icon key={s} name="Star" size={18} className="text-[#E67E22] fill-[#E67E22]" />
                      ))}
                      <Icon name="StarHalf" size={18} className="text-[#E67E22] fill-[#E67E22]" />
                    </div>
                    <div className="text-xs text-[#333]/60 font-medium">Рейтинг на 2ГИС</div>
                  </div>
                </div>
                <div className="reviews-widget-card bg-gradient-to-br from-[#eef6ff] to-[#fff] border border-[#1E3A5F]/15 rounded-2xl px-6 py-4 flex items-center gap-4 shadow-md">
                  <div className="text-4xl font-extrabold text-[#1E3A5F] leading-none">12</div>
                  <div>
                    <div className="text-sm font-semibold text-[#1E3A5F]">отзывов</div>
                    <div className="text-xs text-[#333]/60 font-medium">от реальных клиентов</div>
                  </div>
                </div>
                <div className="reviews-widget-card bg-gradient-to-br from-[#f0fdf4] to-[#fff] border border-green-200 rounded-2xl px-6 py-4 flex items-center gap-4 shadow-md">
                  <div className="text-3xl">🏆</div>
                  <div>
                    <div className="text-sm font-semibold text-green-700">Лидер рынка</div>
                    <div className="text-xs text-[#333]/60 font-medium">Приморский край</div>
                  </div>
                </div>
              </div>
              <a
                href="https://go.2gis.com/JQ16X"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border-2 border-[#E67E22] text-[#E67E22] font-semibold hover:bg-[#E67E22] hover:text-white transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                Читать отзывы на
                <img
                  src="https://cdn.poehali.dev/projects/53d4eefc-24fa-41e9-b99a-3ee269a34aaf/bucket/370186b7-a7aa-4b7a-bf11-24700d0b1526.png"
                  alt="2ГИС"
                  className="h-6 w-auto object-contain"
                />
              </a>
            </div>
          </div>

          {/* LEAVE REVIEW */}
          <div className="scroll-animate mt-12 max-w-xl mx-auto">
            <div className="bg-[#F8F8F8] rounded-2xl p-6 border border-[#1E3A5F]/10">
              <h3 className="text-lg font-bold text-[#1E3A5F] mb-1" style={{ fontFamily: 'Montserrat' }}>Оставить отзыв</h3>
              <p className="text-sm text-[#333]/50 mb-4">Поделитесь своим опытом работы с нами</p>
              <LeaveReviewForm onSubmitted={loadReviews} />
            </div>
          </div>
        </div>
      </section>

      {/* CTA / CALLBACK FORM */}
      <section
        id="callback"
        className="py-16 md:py-24 relative"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(30,58,95,0.95) 0%, rgba(30,58,95,0.85) 100%), url('${PROJECT_IMG}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="scroll-animate text-white">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4" style={{ fontFamily: 'Montserrat' }}>
                Получите расчёт
                <br />
                <span className="text-[#E67E22]">за 60 минут</span>
              </h2>
              <p className="text-white/70 text-lg mb-8 leading-relaxed">
                Оставьте заявку — менеджер перезвонит, уточнит детали и подготовит индивидуальное коммерческое предложение.
              </p>
              <div className="space-y-4">
                {[
                  { icon: 'Clock', text: 'Ответ в течение 60 минут' },
                  { icon: 'FileText', text: 'Готовое КП с ценами и сроками' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#E67E22]/20 flex items-center justify-center flex-shrink-0">
                      <Icon name={item.icon} size={16} className="text-[#E67E22]" />
                    </div>
                    <span className="text-white/90">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="scroll-animate">
              <Card className="border-0 shadow-2xl">
                <CardContent className="p-6 md:p-8">
                  <h3 className="text-xl font-bold text-[#1E3A5F] mb-6" style={{ fontFamily: 'Montserrat' }}>
                    Оставить заявку
                  </h3>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setFormStatus('loading');
                      try {
                        const res = await fetch(func2url['send-email'], {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(formData),
                        });
                        if (res.ok) {
                          setFormStatus('success');
                          setFormData({ name: '', phone: '', message: '' });
                        } else {
                          setFormStatus('error');
                        }
                      } catch {
                        setFormStatus('error');
                      }
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <Input
                        placeholder="Ваше имя"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="h-12 bg-[#F8F8F8] border-0 text-[#333] placeholder:text-[#333]/40"
                        required
                      />
                    </div>
                    <div>
                      <Input
                        placeholder="Телефон"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="h-12 bg-[#F8F8F8] border-0 text-[#333] placeholder:text-[#333]/40"
                        required
                      />
                    </div>
                    <div>
                      <Textarea
                        placeholder="Что вам нужно? (материалы, объёмы, сроки)"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="bg-[#F8F8F8] border-0 text-[#333] placeholder:text-[#333]/40 min-h-[100px]"
                      />
                    </div>
                    {formStatus === 'success' && (
                      <div className="rounded-xl bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm font-medium">
                        Спасибо! Ваша заявка принята, мы свяжемся с вами в ближайшее время.
                      </div>
                    )}
                    {formStatus === 'error' && (
                      <div className="rounded-xl bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm font-medium">
                        Произошла ошибка. Пожалуйста, позвоните нам напрямую.
                      </div>
                    )}
                    <Button
                      type="submit"
                      size="lg"
                      disabled={formStatus === 'loading'}
                      className="w-full bg-[#E67E22] hover:bg-[#d35400] text-white font-bold text-lg h-14 disabled:opacity-70"
                    >
                      {formStatus === 'loading' ? 'Отправляем...' : 'Получить расчёт за 60 минут'}
                    </Button>
                    <p className="text-xs text-center text-[#333]/40">
                      Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACTS */}
      <section id="contacts" className="py-16 md:py-24 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          <div className="scroll-animate text-center mb-12 md:mb-16">
            <p className="text-[#E67E22] font-semibold text-sm uppercase tracking-widest mb-3">Контакты</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1E3A5F]" style={{ fontFamily: 'Montserrat' }}>
              Свяжитесь с нами
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <div className="scroll-animate space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0 shadow-md cursor-pointer">
                  <span className="text-2xl icon-spin select-none">📍</span>
                </div>
                <div>
                  <div className="font-semibold text-[#333] mb-1">Адрес</div>
                  <div className="text-[#333]/60">г. Артём, ул. Вокзальная 114</div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center flex-shrink-0 shadow-md cursor-pointer">
                  <span className="text-2xl icon-spin select-none">📞</span>
                </div>
                <div>
                  <div className="font-semibold text-[#333] mb-1">Телефоны</div>
                  <a href="tel:+74232448010" className="block text-[#1E3A5F] hover:text-[#E67E22] transition-colors font-medium">
                    +7 (423) 244-80-10
                  </a>
                  <a href="https://max.ru/u/f9LHodD0cOJeqBIEYMN3NMyf-Hx85yqfnOpRApJuFQvoU_sOxqtkoeqraow" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#1E3A5F] hover:text-[#E67E22] transition-colors font-medium mt-1">
                    +7 (914) 792-27-84 <span className="text-[#333]/40 text-sm">(Max)</span>
                    <img src="https://cdn.poehali.dev/projects/53d4eefc-24fa-41e9-b99a-3ee269a34aaf/bucket/7682a930-2e78-4941-9562-49c03023e6f2.png" alt="Max" className="w-5 h-5 object-contain flex-shrink-0" />
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center flex-shrink-0 shadow-md cursor-pointer">
                  <span className="text-2xl icon-spin select-none">✉️</span>
                </div>
                <div>
                  <div className="font-semibold text-[#333] mb-1">Email</div>
                  <a href="mailto:vostokinveststal@mail.ru" className="text-[#1E3A5F] hover:text-[#E67E22] transition-colors font-medium">
                    vostokinveststal@mail.ru
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center flex-shrink-0 shadow-md cursor-pointer">
                  <span className="text-2xl icon-spin select-none">🌐</span>
                </div>
                <div>
                  <div className="font-semibold text-[#333] mb-1">Сайт</div>
                  <a href="https://vi-stal.ru" target="_blank" rel="noopener noreferrer" className="text-[#1E3A5F] hover:text-[#E67E22] transition-colors font-medium">
                    vi-stal.ru
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center flex-shrink-0 shadow-md cursor-pointer">
                  <span className="text-2xl icon-spin select-none">🕐</span>
                </div>
                <div>
                  <div className="font-semibold text-[#333] mb-1">Режим работы</div>
                  <div className="text-[#333]/60">Пн–Пт: 8:30–17:30</div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <a
                  href="https://t.me/+79147922784"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-xl bg-[#0088cc]/10 flex items-center justify-center hover:bg-[#0088cc]/20 transition-colors group"
                >
                  <Icon name="Send" size={20} className="text-[#0088cc] group-hover:scale-110 transition-transform" />
                </a>
                <a
                  href="tel:+79147922784"
                  className="w-12 h-12 rounded-xl bg-[#E67E22]/10 flex items-center justify-center hover:bg-[#E67E22]/20 transition-colors group"
                >
                  <Icon name="PhoneCall" size={20} className="text-[#E67E22] group-hover:scale-110 transition-transform" />
                </a>
              </div>
            </div>

            <div className="scroll-animate rounded-2xl overflow-hidden shadow-lg h-[400px]">
              <iframe
                src="https://yandex.ru/map-widget/v1/?text=%D0%92%D0%BE%D1%81%D1%82%D0%BE%D0%BA-%D0%98%D0%BD%D0%B2%D0%B5%D1%81%D1%82%D0%A1%D1%82%D0%B0%D0%BB%D1%8C&ll=132.183340%2C43.354430&z=16&mode=search&ol=biz"
                width="100%"
                height="100%"
                frameBorder="0"
                title="Карта"
                style={{ border: 0 }}
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1E3A5F] text-white py-12">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="mb-4">
                <img
                  src="https://cdn.poehali.dev/projects/53d4eefc-24fa-41e9-b99a-3ee269a34aaf/bucket/b7e4dd2d-de05-4a2e-b0d5-bcf1064e0acc.png"
                  alt="ВИС"
                  className="h-14 w-auto brightness-0 invert"
                />
              </div>
              <p className="text-white/50 text-sm leading-relaxed">
                Комплексное снабжение строительных объектов на Дальнем Востоке с 2003 года.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Навигация</h4>
              <div className="space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollTo(item.id)}
                    className="block w-full text-left text-white/50 hover:text-[#E67E22] transition-colors text-sm"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Контакты</h4>
              <div className="space-y-2 text-sm text-white/50">
                <div>г. Артём, ул. Вокзальная 114</div>
                <a href="tel:+74232448010" className="block hover:text-[#E67E22] transition-colors">
                  +7 (423) 244-80-10
                </a>
                <a href="tel:+79147922784" className="block hover:text-[#E67E22] transition-colors">
                  +7 (914) 792-27-84
                </a>
                <a href="mailto:vostokinveststal@mail.ru" className="block hover:text-[#E67E22] transition-colors">
                  vostokinveststal@mail.ru
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/30 text-sm">
              © 2003–2026 ВИС (Восток-ИнвестСталь). Все права защищены.
            </p>
            <button className="text-white/30 text-sm hover:text-white/50 transition-colors">
              Политика конфиденциальности
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;