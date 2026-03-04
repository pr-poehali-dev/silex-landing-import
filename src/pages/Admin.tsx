import { useState } from 'react';
import func2url from '../../backend/func2url.json';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const REVIEWS_URL = func2url['reviews'];

interface Review {
  id: number;
  author: string;
  text: string;
  stars: number;
  approved: boolean;
  created_at: string;
}

export default function Admin() {
  const [password, setPassword] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch(`${REVIEWS_URL}?admin=1&password=${encodeURIComponent(inputPassword)}`);
    if (res.status === 403) {
      setError('Неверный пароль');
      setLoading(false);
      return;
    }
    const data = await res.json();
    setReviews(data.reviews || []);
    setPassword(inputPassword);
    setLoading(false);
  };

  const reload = async () => {
    const res = await fetch(`${REVIEWS_URL}?admin=1&password=${encodeURIComponent(password)}`);
    const data = await res.json();
    setReviews(data.reviews || []);
  };

  const approve = async (id: number, approved: boolean) => {
    await fetch(REVIEWS_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, approved, password }),
    });
    await reload();
  };

  const remove = async (id: number) => {
    if (!confirm('Удалить отзыв?')) return;
    await fetch(REVIEWS_URL, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, password }),
    });
    await reload();
  };

  const filtered = reviews.filter((r) => {
    if (filter === 'pending') return !r.approved;
    if (filter === 'approved') return r.approved;
    return true;
  });

  const pendingCount = reviews.filter((r) => !r.approved).length;

  if (!password) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center p-4">
        <Card className="w-full max-w-sm shadow-lg border-0">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-[#1E3A5F] flex items-center justify-center mx-auto mb-4">
                <Icon name="Shield" size={28} className="text-white" />
              </div>
              <h1 className="text-2xl font-extrabold text-[#1E3A5F]" style={{ fontFamily: 'Montserrat' }}>
                Панель управления
              </h1>
              <p className="text-sm text-[#333]/50 mt-1">Модерация отзывов</p>
            </div>
            <form onSubmit={login} className="space-y-4">
              <Input
                type="password"
                placeholder="Пароль"
                value={inputPassword}
                onChange={(e) => setInputPassword(e.target.value)}
                className="border-[#1E3A5F]/20"
                autoFocus
              />
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <Button
                type="submit"
                disabled={!inputPassword || loading}
                className="w-full bg-[#1E3A5F] hover:bg-[#16305a] text-white"
              >
                {loading ? 'Проверяем...' : 'Войти'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <header className="bg-[#1E3A5F] text-white px-6 py-4 flex items-center justify-between shadow">
        <div className="flex items-center gap-3">
          <Icon name="Shield" size={22} className="text-white" />
          <h1 className="text-lg font-bold" style={{ fontFamily: 'Montserrat' }}>Панель управления</h1>
        </div>
        <div className="flex items-center gap-4">
          <a href="/" className="text-white/70 hover:text-white text-sm transition-colors">← На сайт</a>
          <button onClick={() => setPassword('')} className="text-white/70 hover:text-white text-sm transition-colors">
            Выйти
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'pending' ? 'bg-[#E67E22] text-white' : 'bg-white text-[#333] hover:bg-[#E67E22]/10'}`}
          >
            Ожидают проверки {pendingCount > 0 && <span className="ml-1 bg-white/30 px-1.5 rounded-full">{pendingCount}</span>}
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'approved' ? 'bg-[#1E3A5F] text-white' : 'bg-white text-[#333] hover:bg-[#1E3A5F]/10'}`}
          >
            Одобренные
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'all' ? 'bg-[#333] text-white' : 'bg-white text-[#333] hover:bg-[#333]/10'}`}
          >
            Все
          </button>
          <button onClick={reload} className="ml-auto text-sm text-[#333]/50 hover:text-[#333] flex items-center gap-1 transition-colors">
            <Icon name="RefreshCw" size={14} /> Обновить
          </button>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-[#333]/40">
            <Icon name="Inbox" size={40} className="mx-auto mb-3" />
            <p>Нет отзывов в этом разделе</p>
          </div>
        )}

        <div className="space-y-4">
          {filtered.map((review) => (
            <Card key={review.id} className={`border-0 shadow-sm ${!review.approved ? 'border-l-4 border-l-[#E67E22]' : 'border-l-4 border-l-green-400'}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-[#1E3A5F]">{review.author}</span>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map((s) => (
                          <Icon key={s} name="Star" size={14} className={s <= review.stars ? 'text-[#E67E22] fill-[#E67E22]' : 'text-gray-200 fill-gray-200'} />
                        ))}
                      </div>
                      <span className="text-xs text-[#333]/40">
                        {new Date(review.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </span>
                      {review.approved
                        ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Опубликован</span>
                        : <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">На проверке</span>
                      }
                    </div>
                    <p className="text-[#333]/80 text-sm leading-relaxed">{review.text}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {!review.approved ? (
                      <Button
                        size="sm"
                        onClick={() => approve(review.id, true)}
                        className="bg-green-500 hover:bg-green-600 text-white gap-1"
                      >
                        <Icon name="Check" size={14} /> Одобрить
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => approve(review.id, false)}
                        className="border-orange-300 text-orange-600 hover:bg-orange-50 gap-1"
                      >
                        <Icon name="EyeOff" size={14} /> Скрыть
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => remove(review.id)}
                      className="border-red-200 text-red-500 hover:bg-red-50 gap-1"
                    >
                      <Icon name="Trash2" size={14} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
