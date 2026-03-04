import json
import os
import smtplib
from datetime import datetime, timezone, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def handler(event: dict, context) -> dict:
    """Отправка заявки с сайта на почту vostokinveststal@mail.ru"""

    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    body = json.loads(event.get('body') or '{}')
    name = body.get('name', '').strip()
    email = body.get('email', '').strip()
    phone = body.get('phone', '').strip()
    message = body.get('message', '').strip()

    msk_time = datetime.now(timezone(timedelta(hours=10)))
    received_at = msk_time.strftime('%d %B %Y, %H:%M (UTC+10, Владивосток)')

    source_ip = event.get('requestContext', {}).get('identity', {}).get('sourceIp', 'неизвестно')
    referer = event.get('headers', {}).get('referer') or event.get('headers', {}).get('Referer') or 'не указан'

    smtp_user = 'vostokinveststal@mail.ru'
    smtp_password = os.environ['SMTP_PASSWORD']
    to_email = 'vostokinveststal@mail.ru'

    html_body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #1E3A5F;">Новая заявка с сайта</h2>
        <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
            <tr>
                <td style="padding: 8px 12px; background: #f5f5f5; font-weight: bold; width: 140px;">Имя</td>
                <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">{name or 'не указано'}</td>
            </tr>
            <tr>
                <td style="padding: 8px 12px; background: #f5f5f5; font-weight: bold;">Email</td>
                <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">{email or 'не указан'}</td>
            </tr>
            <tr>
                <td style="padding: 8px 12px; background: #f5f5f5; font-weight: bold;">Телефон</td>
                <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">{phone or 'не указан'}</td>
            </tr>
            <tr>
                <td style="padding: 8px 12px; background: #f5f5f5; font-weight: bold;">Сообщение</td>
                <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">{message or 'не указано'}</td>
            </tr>
            <tr>
                <td style="padding: 8px 12px; background: #f5f5f5; font-weight: bold;">Источник</td>
                <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">{referer}</td>
            </tr>
            <tr>
                <td style="padding: 8px 12px; background: #fff3cd; font-weight: bold; color: #856404;">⏰ Время заявки</td>
                <td style="padding: 8px 12px; border-bottom: 1px solid #eee; background: #fff3cd; color: #856404; font-weight: bold;">{received_at}</td>
            </tr>
            <tr>
                <td style="padding: 8px 12px; background: #f5f5f5; font-weight: bold;">IP-адрес</td>
                <td style="padding: 8px 12px;">{source_ip}</td>
            </tr>
        </table>
    </body>
    </html>
    """

    msg = MIMEMultipart('alternative')
    msg['Subject'] = f'Новая заявка: {name or phone or "без имени"}'
    msg['From'] = smtp_user
    msg['To'] = to_email
    msg.attach(MIMEText(html_body, 'html', 'utf-8'))

    with smtplib.SMTP_SSL('smtp.mail.ru', 465) as server:
        server.login(smtp_user, smtp_password)
        server.sendmail(smtp_user, to_email, msg.as_string())

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'ok': True})
    }