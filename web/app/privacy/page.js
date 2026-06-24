import { getLocale } from 'next-intl/server';
import { LegalShell } from '@/components/legal/LegalShell';

// NOTE: This is a tailored template, not legal advice. Before publishing, fill in
// the operator legal name and jurisdiction placeholders below and have it reviewed.
const UPDATED = '2026-06-24';
const CONTACT = 'support@subscree.app';

const content = {
    en: {
        title: 'Privacy Policy',
        intro: `This Privacy Policy explains how Subscree ("we", "us") collects, uses, and protects your information when you use the Subscree website and mobile apps (the "Service").`,
        sections: [
            {
                heading: 'Information you provide',
                body: ['We collect the information you give us when you create an account and use the Service:'],
                items: [
                    'Account details: your name, email address, and password (stored only in hashed form).',
                    'Content you add: subscriptions (names, amounts, currencies, billing cycles, dates, notes), categories, and payment-method labels — for example a name and a type such as “card”. We never collect card numbers or bank credentials, and we do not process payments.',
                    'Teams: team names and the email addresses you use to invite members.',
                ],
            },
            {
                heading: 'Information collected automatically',
                items: [
                    'Push notification token and platform (iOS/Android) — only if you enable push notifications.',
                    'Your time zone — used to deliver reminders at an appropriate local time.',
                    'Usage analytics via a privacy-focused, self-hosted tool (Umami). We record in-app events and may associate them with your account to understand how features are used. We do not use third-party advertising or cross-site tracking.',
                    'Technical data such as IP address and basic request information, processed by our servers for security and reliability.',
                ],
            },
            {
                heading: 'How we use your information',
                items: [
                    'Provide, operate, and maintain the Service.',
                    'Send the payment reminders and weekly summaries you enable.',
                    'Send essential account emails, such as password resets and team invitations.',
                    'Maintain security, prevent abuse, and diagnose problems.',
                    'Improve and develop the Service.',
                ],
            },
            {
                heading: 'Sharing within a team',
                body: ['If you create or join a team, the subscriptions and related data in that team are visible to all of its members. Invitations are delivered to the email address you specify.'],
            },
            {
                heading: 'Service providers',
                body: ['We share data only with providers that help us operate the Service, and only as needed. We do not sell your personal information. These providers include:'],
                items: [
                    'Hosting and database providers.',
                    'An email delivery provider (for reminders and account emails).',
                    'Push notification gateways — Apple Push Notification service and Google/Firebase Cloud Messaging (via Expo).',
                    'Self-hosted analytics.',
                ],
            },
            {
                heading: 'Data retention',
                body: ['We keep your information while your account is active. When you delete your account, we delete your personal data within a reasonable period, except where we must keep it to comply with legal obligations.'],
            },
            {
                heading: 'Security',
                body: ['We protect your data with measures including password hashing (bcrypt) and encryption in transit (HTTPS). No method of transmission or storage is completely secure, so we cannot guarantee absolute security.'],
            },
            {
                heading: 'Your rights',
                body: ['Depending on where you live, you may have the right to access, correct, export, or delete your personal data, and to object to or restrict certain processing. You can edit your data in the app and delete your account in Settings, or contact us for help. If you are in the EEA or UK, you may also lodge a complaint with your local data-protection authority.'],
            },
            {
                heading: 'International transfers',
                body: ['Your data may be processed and stored in countries other than the one where you live. Where required, we take steps to ensure an adequate level of protection.'],
            },
            {
                heading: 'Children',
                body: ['The Service is not directed to children under 16, and we do not knowingly collect their personal data. If you believe a child has provided us with data, contact us and we will remove it.'],
            },
            {
                heading: 'Changes to this policy',
                body: ['We may update this Privacy Policy from time to time. We will update the “Last updated” date above and, for material changes, provide a more prominent notice.'],
            },
            {
                heading: 'Contact',
                body: [
                    `If you have questions about this policy or your data, contact us at ${CONTACT}.`,
                    'Operator: Subscree, Kyiv / Ukraine.',
                ],
            },
        ],
    },
    uk: {
        title: 'Політика конфіденційності',
        intro: 'Ця Політика конфіденційності пояснює, як Subscree («ми», «нас») збирає, використовує та захищає вашу інформацію під час використання вебсайту та мобільних застосунків Subscree («Сервіс»).',
        sections: [
            {
                heading: 'Інформація, яку ви надаєте',
                body: ['Ми збираємо інформацію, яку ви надаєте під час створення облікового запису та користування Сервісом:'],
                items: [
                    'Дані облікового запису: ім’я, адреса електронної пошти та пароль (зберігається лише у хешованому вигляді).',
                    'Контент, який ви додаєте: підписки (назви, суми, валюти, цикли оплати, дати, нотатки), категорії та позначки способів оплати — наприклад назва і тип на кшталт «card». Ми ніколи не збираємо номери карток чи банківські дані й не обробляємо платежі.',
                    'Команди: назви команд та адреси електронної пошти, на які ви надсилаєте запрошення.',
                ],
            },
            {
                heading: 'Інформація, що збирається автоматично',
                items: [
                    'Токен push-сповіщень і платформа (iOS/Android) — лише якщо ви ввімкнули push-сповіщення.',
                    'Ваш часовий пояс — щоб надсилати нагадування у відповідний місцевий час.',
                    'Аналітика використання через приватний, самостійно розгорнутий інструмент (Umami). Ми фіксуємо події в застосунку та можемо пов’язувати їх із вашим обліковим записом, щоб розуміти, як використовуються функції. Ми не використовуємо стороннє рекламне чи міжсайтове відстеження.',
                    'Технічні дані, як-от IP-адреса та базова інформація про запити, що обробляються нашими серверами для безпеки й стабільності.',
                ],
            },
            {
                heading: 'Як ми використовуємо інформацію',
                items: [
                    'Надання, робота та підтримка Сервісу.',
                    'Надсилання нагадувань про оплату та тижневих підсумків, які ви ввімкнули.',
                    'Надсилання важливих листів облікового запису, як-от скидання пароля та запрошення до команди.',
                    'Забезпечення безпеки, запобігання зловживанням і усунення проблем.',
                    'Покращення та розвиток Сервісу.',
                ],
            },
            {
                heading: 'Спільний доступ у межах команди',
                body: ['Якщо ви створюєте команду або приєднуєтесь до неї, підписки та пов’язані дані цієї команди видимі всім її учасникам. Запрошення надсилаються на вказану вами адресу електронної пошти.'],
            },
            {
                heading: 'Постачальники послуг',
                body: ['Ми передаємо дані лише постачальникам, які допомагають нам забезпечувати роботу Сервісу, і лише в необхідному обсязі. Ми не продаємо вашу персональну інформацію. До таких постачальників належать:'],
                items: [
                    'Постачальники хостингу та бази даних.',
                    'Постачальник доставки електронної пошти (для нагадувань і листів облікового запису).',
                    'Шлюзи push-сповіщень — Apple Push Notification service та Google/Firebase Cloud Messaging (через Expo).',
                    'Самостійно розгорнута аналітика.',
                ],
            },
            {
                heading: 'Зберігання даних',
                body: ['Ми зберігаємо вашу інформацію, доки активний ваш обліковий запис. Після видалення облікового запису ми видаляємо ваші персональні дані впродовж розумного періоду, окрім випадків, коли зобов’язані зберігати їх згідно із законом.'],
            },
            {
                heading: 'Безпека',
                body: ['Ми захищаємо ваші дані заходами, що включають хешування паролів (bcrypt) і шифрування під час передавання (HTTPS). Жоден метод передавання чи зберігання не є цілком безпечним, тому ми не можемо гарантувати абсолютну безпеку.'],
            },
            {
                heading: 'Ваші права',
                body: ['Залежно від місця проживання ви можете мати право на доступ, виправлення, експорт або видалення своїх персональних даних, а також на заперечення чи обмеження певної обробки. Ви можете редагувати дані в застосунку та видалити обліковий запис у Налаштуваннях або звернутися до нас по допомогу. Якщо ви перебуваєте в ЄЕЗ або Великій Британії, ви також можете подати скаргу до місцевого органу із захисту даних.'],
            },
            {
                heading: 'Міжнародне передавання',
                body: ['Ваші дані можуть оброблятися та зберігатися в країнах, відмінних від тієї, де ви проживаєте. За потреби ми вживаємо заходів для забезпечення належного рівня захисту.'],
            },
            {
                heading: 'Діти',
                body: ['Сервіс не призначений для дітей віком до 16 років, і ми свідомо не збираємо їхні персональні дані. Якщо ви вважаєте, що дитина надала нам дані, зв’яжіться з нами, і ми їх видалимо.'],
            },
            {
                heading: 'Зміни до цієї політики',
                body: ['Ми можемо час від часу оновлювати цю Політику конфіденційності. Ми оновимо дату «Останнє оновлення» вище, а для суттєвих змін надамо помітніше повідомлення.'],
            },
            {
                heading: 'Контакти',
                body: [
                    `Якщо у вас є запитання щодо цієї політики або ваших даних, напишіть нам: ${CONTACT}.`,
                    'Оператор: Subscree, Київ / Україна.',
                ],
            },
        ],
    },
};

export async function generateMetadata() {
    const locale = await getLocale();
    const c = content[locale] ?? content.en;
    return { title: c.title, description: c.intro, alternates: { canonical: '/privacy' } };
}

export default async function PrivacyPage() {
    const locale = await getLocale();
    const c = content[locale] ?? content.en;
    return <LegalShell locale={locale} title={c.title} updatedISO={UPDATED} intro={c.intro} sections={c.sections} />;
}
