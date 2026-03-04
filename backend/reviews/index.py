import json
import os
import psycopg2
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
    'Access-Control-Max-Age': '86400',
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def send_notification(author, text, stars):
    """Отправляет уведомление о новом отзыве на почту"""
    try:
        smtp_user = 'vostokinveststal@mail.ru'
        smtp_password = os.environ['SMTP_PASSWORD']
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f'Новый отзыв от {author}'
        msg['From'] = smtp_user
        msg['To'] = smtp_user
        html = f"""
        <html><body style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #1E3A5F;">Новый отзыв ожидает проверки</h2>
            <table style="border-collapse: collapse; max-width: 600px; width: 100%;">
                <tr>
                    <td style="padding: 8px 12px; background: #f5f5f5; font-weight: bold; width: 120px;">Автор</td>
                    <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">{author}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 12px; background: #f5f5f5; font-weight: bold;">Оценка</td>
                    <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">{'⭐' * stars}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 12px; background: #f5f5f5; font-weight: bold;">Текст</td>
                    <td style="padding: 8px 12px;">{text}</td>
                </tr>
            </table>
            <p style="margin-top: 20px; color: #666;">Для одобрения или отклонения перейдите в <a href="/admin">панель администратора</a>.</p>
        </body></html>
        """
        msg.attach(MIMEText(html, 'html', 'utf-8'))
        with smtplib.SMTP_SSL('smtp.mail.ru', 465) as server:
            server.login(smtp_user, smtp_password)
            server.sendmail(smtp_user, smtp_user, msg.as_string())
    except Exception:
        pass


def handler(event: dict, context) -> dict:
    """Управление отзывами: GET — список одобренных, POST — добавить новый, PUT — одобрить/отклонить"""

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
    method = event.get('httpMethod', 'GET')

    # GET — вернуть одобренные отзывы для сайта
    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        admin_mode = params.get('admin') == '1'
        admin_password = params.get('password', '')

        conn = get_conn()
        cur = conn.cursor()

        if admin_mode:
            # Проверяем пароль
            if admin_password != os.environ.get('ADMIN_PASSWORD', ''):
                conn.close()
                return {'statusCode': 403, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Неверный пароль'})}
            cur.execute(
                f"SELECT id, author, text, stars, approved, created_at FROM {schema}.reviews ORDER BY created_at DESC"
            )
        else:
            cur.execute(
                f"SELECT id, author, text, stars, approved, created_at FROM {schema}.reviews WHERE approved = TRUE ORDER BY created_at DESC"
            )

        rows = cur.fetchall()
        conn.close()

        reviews = [
            {
                'id': r[0],
                'author': r[1],
                'text': r[2],
                'stars': r[3],
                'approved': r[4],
                'created_at': r[5].isoformat() if r[5] else None,
                'company': '',
                'role': '',
            }
            for r in rows
        ]
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'reviews': reviews})}

    # POST — добавить новый отзыв
    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        author = (body.get('author') or '').strip()
        text = (body.get('text') or '').strip()
        stars = int(body.get('stars') or 0)

        if not author or not text or not (1 <= stars <= 5):
            return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Заполните все поля'})}

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"INSERT INTO {schema}.reviews (author, text, stars) VALUES (%s, %s, %s) RETURNING id",
            (author, text, stars)
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        conn.close()

        send_notification(author, text, stars)

        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'ok': True, 'id': new_id})}

    # PUT — одобрить или отклонить отзыв (только для админа)
    if method == 'PUT':
        body = json.loads(event.get('body') or '{}')
        password = body.get('password', '')
        if password != os.environ.get('ADMIN_PASSWORD', ''):
            return {'statusCode': 403, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Неверный пароль'})}

        review_id = int(body.get('id') or 0)
        approved = bool(body.get('approved'))

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"UPDATE {schema}.reviews SET approved = %s WHERE id = %s", (approved, review_id))
        conn.commit()
        conn.close()

        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'ok': True})}

    # DELETE — удалить отзыв (только для админа)
    if method == 'DELETE':
        body = json.loads(event.get('body') or '{}')
        password = body.get('password', '')
        if password != os.environ.get('ADMIN_PASSWORD', ''):
            return {'statusCode': 403, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Неверный пароль'})}

        review_id = int(body.get('id') or 0)
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"DELETE FROM {schema}.reviews WHERE id = %s", (review_id,))
        conn.commit()
        conn.close()

        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'ok': True})}

    return {'statusCode': 405, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Method not allowed'})}
