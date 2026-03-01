import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

const HERO_IMG = "https://cdn.poehali.dev/projects/53d4eefc-24fa-41e9-b99a-3ee269a34aaf/bucket/8897ef8f-c9f1-4baa-8f80-8c30691ace6c.jpeg";
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
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

const navLinks = [
  { label: 'О компании', href: '#about' },
  { label: 'Продукция', href: '#products' },
  { label: 'Преимущества', href: '#advantages' },
  { label: 'Проекты', href: '#projects' },
  { label: 'Контакты', href: '#contacts' },
];

const products = [
  {
    icon: 'Building2',
    title: 'Автоклавный газобетон',
    desc: 'Блоки YTONG, HEBEL и другие ведущие бренды. Высокая теплоизоляция, лёгкий вес, точные размеры.',
    img: BLOCKS_IMG,
    tag: 'Хит продаж',
  },
  {
    icon: 'Layers',
    title: 'Облицовочный кирпич',
    desc: 'Широкий ассортимент цветов и фактур. Для фасадов жилых домов и коммерческих объектов.',
    img: null,
    tag: 'Популярно',
  },
  {
    icon: 'Pipette',
    title: 'Асбестоцементные трубы',
    desc: 'Трубы и муфты для канализации, водоснабжения и вентиляции. Долговечность и надёжность.',
    img: null,
    tag: null,
  },
  {
    icon: 'Package',
    title: 'Сухие смеси',
    desc: 'Штукатурки, клеи, стяжки от проверенных производителей. Профессиональное качество.',
    img: null,
    tag: null,
  },
  {
    icon: 'Thermometer',
    title: 'Утеплители',
    desc: 'Минеральная вата, пенопласт, экструдированный пенополистирол для стен и кровли.',
    img: null,
    tag: null,
  },
  {
    icon: 'Warehouse',
    title: 'ЖБИ изделия',
    desc: 'Плиты перекрытий, фундаментные блоки, кольца колодцев. Доставка по Приморскому краю.',
    img: null,
    tag: null,
  },
];

const advantages = [
  { icon: 'Truck', title: 'Быстрая доставка', desc: 'Собственный транспорт и логистика по всему Приморскому краю и Дальнему Востоку' },
  { icon: 'BadgeCheck', title: 'Сертифицированная продукция', desc: 'Все материалы имеют необходимые сертификаты и соответствуют ГОСТ' },
  { icon: 'Handshake', title: 'Оптовые цены', desc: 'Прямые поставки от производителей — без наценок посредников' },
  { icon: 'Headphones', title: 'Экспертная поддержка', desc: 'Консультируем по выбору материалов для вашего проекта бесплатно' },
  { icon: 'RotateCcw', title: 'Гарантия возврата', desc: 'Принимаем возврат товара надлежащего качества в течение 14 дней' },
  { icon: 'CreditCard', title: 'Удобная оплата', desc: 'Наличный и безналичный расчёт, отсрочка платежа для постоянных клиентов' },
];

const reviews = [
  {
    name: 'Александр Петров',
    role: 'Прораб, ООО «СтройМаст»',
    text: 'Работаем с ВИС уже 3 года. Всегда всё в наличии, доставка строго по графику. Газобетон YTONG — лучший выбор для малоэтажного строительства.',
    rating: 5,
    avatar: 'А',
  },
  {
    name: 'Марина Соколова',
    role: 'Частный застройщик',
    text: 'Строила дом, ребята помогли подобрать все материалы под проект. Цены честные, ниже чем в других местах. Спасибо за профессионализм!',
    rating: 5,
    avatar: 'М',
  },
  {
    name: 'Игорь Васильев',
    role: 'Директор, ИП Васильев',
    text: 'Берём кирпич и сухие смеси оптом. Всегда стабильное качество, хорошие скидки для постоянников. Рекомендую.',
    rating: 5,
    avatar: 'И',
  },
];

const stats = [
  { value: 15, suffix: '+', label: 'лет на рынке' },
  { value: 500, suffix: '+', label: 'клиентов' },
  { value: 1200, suffix: '+', label: 'объектов построено' },
  { value: 50, suffix: '+', label: 'видов продукции' },
];

export default function Index() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' });
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const heroRef = useScrollAnimation();
  const aboutRef = useScrollAnimation();
  const productsRef = useScrollAnimation();
  const advantagesRef = useScrollAnimation();
  const reviewsRef = useScrollAnimation();
  const contactsRef = useScrollAnimation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('sending');
    await new Promise((r) => setTimeout(r, 1200));
    setFormStatus('sent');
    setFormData({ name: '', phone: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* NAVBAR */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 flex items-center justify-between h-16 md:h-20">
          <a href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-heading font-bold text-sm">ВИС</span>
            </div>
            <div className="hidden sm:block">
              <div className="font-heading font-bold text-primary text-base leading-tight">Восток-ИнвестСталь</div>
              <div className="text-muted-foreground text-xs">стройматериалы оптом</div>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a href="tel:+74232000000" className="hidden md:flex items-center gap-2 text-primary font-heading font-semibold text-sm">
              <Icon name="Phone" size={16} />
              +7 (423) 200-00-00
            </a>
            <Button size="sm" className="hidden md:block" asChild>
              <a href="#contacts">Получить прайс</a>
            </Button>
            <button
              className="md:hidden p-2 text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Icon name={mobileMenuOpen ? 'X' : 'Menu'} size={24} />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t shadow-lg px-4 py-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-base font-medium text-foreground/80 hover:text-primary py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a href="tel:+74232000000" className="flex items-center gap-2 text-primary font-semibold mt-2">
              <Icon name="Phone" size={16} />
              +7 (423) 200-00-00
            </a>
          </div>
        )}
      </header>

      {/* HERO */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a3a5c 0%, #0f2440 60%, #1e4a3a 100%)' }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${HERO_IMG})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-transparent" />

        <div className="relative container mx-auto px-4 py-32 grid md:grid-cols-2 gap-12 items-center">
          <div className="scroll-animate">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-full px-4 py-1.5 text-sm font-medium mb-6 text-amber-300">
              <Icon name="MapPin" size={14} />
              Артём • Приморский край • Дальний Восток
            </div>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Стройматериалы
              <span className="block text-amber-400">оптом и в розницу</span>
            </h1>
            <p className="text-white/80 text-lg md:text-xl mb-8 max-w-lg leading-relaxed">
              Автоклавный газобетон, облицовочный кирпич, сухие смеси и ещё 50+ видов строительных материалов. Доставка по Приморскому краю.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white font-heading font-semibold text-base px-8" asChild>
                <a href="#contacts">Запросить прайс</a>
              </Button>
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 font-heading font-semibold text-base" asChild>
                <a href="#products">Каталог товаров</a>
              </Button>
            </div>
          </div>

          <div className="hidden md:block scroll-animate" style={{ transitionDelay: '0.2s' }}>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img src={HERO_IMG} alt="Строительные материалы" className="w-full h-96 object-cover" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Icon name="CheckCircle" size={20} className="text-green-600" />
                  </div>
                  <div>
                    <div className="font-heading font-bold text-sm text-foreground">Всё в наличии</div>
                    <div className="text-muted-foreground text-xs">Склад в Артёме</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <a href="#about" className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 hover:text-white transition-colors animate-float">
          <Icon name="ChevronDown" size={32} />
        </a>
      </section>

      {/* STATS */}
      <section className="bg-primary py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-heading text-3xl md:text-4xl font-bold text-white mb-1">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-white/60 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" ref={aboutRef} className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="scroll-animate">
              <div className="relative">
                <img src={WAREHOUSE_IMG} alt="Склад ВИС" className="rounded-2xl w-full h-80 object-cover shadow-lg" />
                <div className="absolute -bottom-6 -right-6 bg-accent rounded-xl p-4 shadow-xl text-white">
                  <div className="font-heading font-bold text-xl">г. Артём</div>
                  <div className="text-sm opacity-90">Приморский край</div>
                </div>
              </div>
            </div>
            <div className="scroll-animate" style={{ transitionDelay: '0.15s' }}>
              <span className="text-accent font-medium text-sm uppercase tracking-wider">О компании</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mt-2 mb-5">
                Восток-ИнвестСталь —<br />надёжный партнёр
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed mb-4">
                Более 15 лет мы обеспечиваем строительные компании, прорабов и частных застройщиков Дальнего Востока качественными материалами по оптимальным ценам.
              </p>
              <p className="text-muted-foreground text-base leading-relaxed mb-6">
                Работаем напрямую с ведущими производителями России и зарубежья. Собственный склад в Артёме площадью более 5000 м² позволяет всегда поддерживать необходимый ассортимент.
              </p>
              <div className="flex flex-col gap-3">
                {['Прямые поставки без посредников', 'Собственный парк техники для доставки', 'Профессиональные консультации бесплатно'].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon name="Check" size={14} className="text-primary" />
                    </div>
                    <span className="text-foreground text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products" ref={productsRef} className="py-20 bg-muted/40">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 scroll-animate">
            <span className="text-accent font-medium text-sm uppercase tracking-wider">Ассортимент</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">Наша продукция</h2>
            <p className="text-muted-foreground text-base max-w-2xl mx-auto">
              Более 50 видов строительных материалов от проверенных производителей. Всё в наличии на складе.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, i) => (
              <Card
                key={product.title}
                className="scroll-animate group hover:shadow-lg transition-all duration-300 border-border overflow-hidden"
                style={{ transitionDelay: `${i * 0.08}s` }}
              >
                {product.img && (
                  <div className="h-48 overflow-hidden">
                    <img src={product.img} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon name={product.icon} size={20} className="text-primary" />
                    </div>
                    {product.tag && (
                      <span className="bg-accent/10 text-accent text-xs font-medium px-2.5 py-1 rounded-full">{product.tag}</span>
                    )}
                  </div>
                  <h3 className="font-heading font-bold text-foreground text-lg mb-2">{product.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">{product.desc}</p>
                  <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-white transition-colors" asChild>
                    <a href="#contacts">Узнать цену</a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ADVANTAGES */}
      <section id="advantages" ref={advantagesRef} className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 scroll-animate">
            <span className="text-accent font-medium text-sm uppercase tracking-wider">Почему мы</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">Наши преимущества</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advantages.map((adv, i) => (
              <div
                key={adv.title}
                className="scroll-animate flex gap-4 p-6 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all"
                style={{ transitionDelay: `${i * 0.07}s` }}
              >
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon name={adv.icon} size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-foreground mb-1">{adv.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{adv.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section id="projects" className="py-20 bg-primary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-amber-400 font-medium text-sm uppercase tracking-wider">Портфолио</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mt-2 mb-4">Реализованные проекты</h2>
            <p className="text-white/60 text-base max-w-2xl mx-auto">Мы поставляем материалы на крупные строительные объекты Приморского края</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl overflow-hidden relative group">
              <img src={PROJECT_IMG} alt="Проект" className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                <div>
                  <div className="text-white font-heading font-bold text-lg">ЖК «Солнечный»</div>
                  <div className="text-white/70 text-sm">Артём, 2023 — газобетон, кирпич</div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden relative group">
              <img src={WAREHOUSE_IMG} alt="Склад" className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                <div>
                  <div className="text-white font-heading font-bold text-lg">Складской комплекс</div>
                  <div className="text-white/70 text-sm">Владивосток, 2024 — ЖБИ, сухие смеси</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" ref={reviewsRef} className="py-20 bg-muted/40">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 scroll-animate">
            <span className="text-accent font-medium text-sm uppercase tracking-wider">Отзывы</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">Что говорят клиенты</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {reviews.map((review, i) => (
              <Card key={review.name} className="scroll-animate border-border hover:shadow-md transition-shadow" style={{ transitionDelay: `${i * 0.1}s` }}>
                <CardContent className="p-6">
                  <div className="flex mb-3">
                    {Array.from({ length: review.rating }).map((_, j) => (
                      <Icon key={j} name="Star" size={16} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-foreground/80 text-sm leading-relaxed mb-5 italic">«{review.text}»</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-heading font-bold text-sm flex-shrink-0">
                      {review.avatar}
                    </div>
                    <div>
                      <div className="font-heading font-semibold text-sm text-foreground">{review.name}</div>
                      <div className="text-muted-foreground text-xs">{review.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACTS */}
      <section id="contacts" ref={contactsRef} className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 scroll-animate">
            <span className="text-accent font-medium text-sm uppercase tracking-wider">Связь</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">Свяжитесь с нами</h2>
            <p className="text-muted-foreground text-base max-w-xl mx-auto">
              Оставьте заявку — мы подберём материалы и рассчитаем стоимость для вашего проекта
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="scroll-animate">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Ваше имя</label>
                  <Input placeholder="Иван Иванов" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="h-12" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Телефон</label>
                  <Input placeholder="+7 (000) 000-00-00" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required className="h-12" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Сообщение (необязательно)</label>
                  <Textarea placeholder="Опишите, что вам нужно — материалы, объём, сроки..." rows={4} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
                </div>
                <Button type="submit" size="lg" className="w-full font-heading font-semibold text-base" disabled={formStatus === 'sending' || formStatus === 'sent'}>
                  {formStatus === 'sending' && <><Icon name="Loader2" size={16} className="animate-spin mr-2" />Отправляем...</>}
                  {formStatus === 'sent' && <><Icon name="CheckCircle" size={16} className="mr-2" />Заявка отправлена!</>}
                  {(formStatus === 'idle' || formStatus === 'error') && 'Отправить заявку'}
                </Button>
                {formStatus === 'sent' && <p className="text-green-600 text-sm text-center">Мы свяжемся с вами в течение рабочего дня</p>}
              </form>
            </div>

            <div className="scroll-animate space-y-6" style={{ transitionDelay: '0.15s' }}>
              {[
                { icon: 'MapPin', title: 'Адрес склада', content: 'г. Артём, ул. Промышленная, 15\nПриморский край' },
                { icon: 'Phone', title: 'Телефон', content: '+7 (423) 200-00-00', href: 'tel:+74232000000' },
                { icon: 'Mail', title: 'Email', content: 'info@vis-artem.ru', href: 'mailto:info@vis-artem.ru' },
                { icon: 'Clock', title: 'Режим работы', content: 'Понедельник – Пятница: 8:00 – 18:00\nСуббота: 9:00 – 14:00' },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 items-start">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon name={item.icon} size={20} className="text-primary" />
                  </div>
                  <div>
                    <div className="font-heading font-semibold text-foreground mb-1">{item.title}</div>
                    {item.href ? (
                      <a href={item.href} className="text-primary font-medium text-sm hover:underline">{item.content}</a>
                    ) : (
                      <div className="text-muted-foreground text-sm whitespace-pre-line">{item.content}</div>
                    )}
                  </div>
                </div>
              ))}

              <div className="p-5 bg-primary/5 border border-primary/20 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="MessageCircle" size={18} className="text-primary" />
                  <span className="font-heading font-semibold text-sm text-foreground">WhatsApp</span>
                </div>
                <p className="text-muted-foreground text-sm mb-3">Пишите в мессенджер — отвечаем быстро</p>
                <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-white" asChild>
                  <a href="https://wa.me/74232000000" target="_blank" rel="noopener noreferrer">Написать в WhatsApp</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-primary text-white py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <div className="font-heading font-bold text-lg mb-1">ВИС — Восток-ИнвестСталь</div>
              <div className="text-white/50 text-sm">Строительные материалы оптом и в розницу</div>
            </div>
            <nav className="flex flex-wrap gap-4 justify-center">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} className="text-white/60 hover:text-white text-sm transition-colors">{link.label}</a>
              ))}
            </nav>
            <div className="text-white/40 text-xs text-center">© 2024 ВИС. Все права защищены.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
