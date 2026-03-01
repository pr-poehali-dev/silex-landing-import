import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export default function Admin() {
  const [requests] = useState([
    { id: 1, name: 'Иван Петров', phone: '+7 (914) 123-45-67', message: 'Нужен газобетон D500 200 блоков', date: '2024-01-15', status: 'new' },
    { id: 2, name: 'Марина Соколова', phone: '+7 (924) 987-65-43', message: 'Интересует кирпич облицовочный', date: '2024-01-14', status: 'processed' },
  ]);

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Icon name="Settings" size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-xl text-foreground">Панель администратора</h1>
            <p className="text-muted-foreground text-sm">ВИС — Восток-ИнвестСталь</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="font-heading font-bold text-2xl text-primary">2</div>
              <div className="text-muted-foreground text-sm">Заявок всего</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="font-heading font-bold text-2xl text-green-600">1</div>
              <div className="text-muted-foreground text-sm">Новых</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="font-heading font-bold text-2xl text-accent">1</div>
              <div className="text-muted-foreground text-sm">Обработано</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <h2 className="font-heading font-semibold text-foreground">Заявки с сайта</h2>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {requests.map((req) => (
                <div key={req.id} className="p-4 flex items-start gap-4 hover:bg-muted/30 transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${req.status === 'new' ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-heading font-semibold text-sm text-foreground">{req.name}</span>
                      <span className="text-xs text-muted-foreground">{req.date}</span>
                    </div>
                    <a href={`tel:${req.phone}`} className="text-primary text-sm hover:underline block mb-1">{req.phone}</a>
                    {req.message && <p className="text-muted-foreground text-xs">{req.message}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
