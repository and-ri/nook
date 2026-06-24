import { getLocale } from 'next-intl/server';
import { LegalShell } from '@/components/legal/LegalShell';

// NOTE: This is a tailored template, not legal advice. Fill in the jurisdiction
// and operator placeholders below and have it reviewed before publishing.
const UPDATED = '2026-06-24';
const CONTACT = 'support@subscree.app';

const content = {
    en: {
        title: 'Terms of Use',
        intro: `These Terms of Use ("Terms") govern your access to and use of the Subscree website and mobile apps (the "Service"). By creating an account or using the Service, you agree to these Terms.`,
        sections: [
            {
                heading: 'The Service',
                body: ['Subscree is a tool that helps you record, organize, and get reminders about your subscriptions. It is informational only: Subscree does not pay, renew, or cancel your actual subscriptions, does not access your bank or card accounts, and does not process payments on your behalf.'],
            },
            {
                heading: 'Accounts and eligibility',
                items: [
                    'You must be at least 16 years old to use the Service.',
                    'You agree to provide accurate information and keep it up to date.',
                    'You are responsible for activity under your account and for keeping your password confidential. Notify us promptly of any unauthorized use.',
                ],
            },
            {
                heading: 'Acceptable use',
                body: ['You agree not to:'],
                items: [
                    'use the Service for any unlawful purpose or in violation of these Terms;',
                    'attempt to disrupt, reverse engineer, or gain unauthorized access to the Service or its systems;',
                    'upload other people’s personal data without a lawful basis or their permission;',
                    'place an unreasonable load on the Service, including through automated requests.',
                ],
            },
            {
                heading: 'Your content',
                body: ['You keep ownership of the data you add to the Service. You grant us a limited license to host, store, and process that data solely to operate and provide the Service to you and your team. You are responsible for ensuring you have the right to add any data you enter, including the email addresses of people you invite.'],
            },
            {
                heading: 'Teams',
                body: ['A team owner can invite and remove members. Inviting someone to a team shares the team’s subscriptions and related data with them. Remove members or delete the team if you no longer wish to share.'],
            },
            {
                heading: 'Reminders and accuracy',
                body: ['Reminders, due-date notifications, and weekly summaries are provided on a best-effort basis and may be delayed or fail to deliver due to factors outside our control (for example push or email delivery, device settings, or service downtime). You remain solely responsible for tracking and paying your own subscriptions. Currency conversions and totals are approximate and provided for convenience only.'],
            },
            {
                heading: 'Fees',
                body: ['The Service is currently provided free of charge. We may introduce paid features in the future; if we do, we will make the terms clear before you are charged.'],
            },
            {
                heading: 'Third-party services',
                body: ['The mobile apps are distributed through the Apple App Store and Google Play, and your use of them is also subject to those stores’ and your device operating system’s terms.'],
            },
            {
                heading: 'Disclaimers',
                body: ['The Service is provided “as is” and “as available”, without warranties of any kind, whether express or implied, including fitness for a particular purpose and non-infringement, to the maximum extent permitted by law.'],
            },
            {
                heading: 'Limitation of liability',
                body: ['To the maximum extent permitted by law, Subscree and its operator will not be liable for any indirect, incidental, or consequential damages, or for any missed payment, charge, or loss resulting from reliance on reminders or data in the Service.'],
            },
            {
                heading: 'Termination',
                body: ['You may stop using the Service and delete your account at any time. We may suspend or terminate access if you violate these Terms or to protect the Service or other users.'],
            },
            {
                heading: 'Changes to these Terms',
                body: ['We may update these Terms from time to time. We will update the “Last updated” date and, for material changes, provide a more prominent notice. Continued use after changes means you accept the updated Terms.'],
            },
            {
                heading: 'Governing law',
                body: ['These Terms are governed by the laws of Ukraine, without regard to its conflict-of-law rules.'],
            },
            {
                heading: 'Contact',
                body: [`Questions about these Terms? Contact us at ${CONTACT}.`],
            },
        ],
    },
    uk: {
        title: 'Правила використання',
        intro: 'Ці Правила використання («Правила») регулюють ваш доступ до вебсайту та мобільних застосунків Subscree («Сервіс») і користування ними. Створюючи обліковий запис або користуючись Сервісом, ви погоджуєтеся з цими Правилами.',
        sections: [
            {
                heading: 'Про Сервіс',
                body: ['Subscree — це інструмент, що допомагає фіксувати, впорядковувати підписки та отримувати нагадування про них. Він має суто інформаційний характер: Subscree не сплачує, не поновлює та не скасовує ваші реальні підписки, не має доступу до ваших банківських чи карткових рахунків і не обробляє платежі за вас.'],
            },
            {
                heading: 'Облікові записи та право користування',
                items: [
                    'Вам має бути щонайменше 16 років, щоб користуватися Сервісом.',
                    'Ви зобов’язуєтеся надавати точну інформацію та підтримувати її в актуальному стані.',
                    'Ви відповідаєте за дії у вашому обліковому записі та за конфіденційність пароля. Невідкладно повідомляйте нас про будь-яке несанкціоноване використання.',
                ],
            },
            {
                heading: 'Допустиме використання',
                body: ['Ви погоджуєтеся не:'],
                items: [
                    'використовувати Сервіс із незаконною метою або з порушенням цих Правил;',
                    'намагатися порушити роботу, здійснити зворотну розробку чи отримати несанкціонований доступ до Сервісу або його систем;',
                    'завантажувати персональні дані інших осіб без законних підстав чи їхнього дозволу;',
                    'створювати надмірне навантаження на Сервіс, зокрема автоматизованими запитами.',
                ],
            },
            {
                heading: 'Ваш контент',
                body: ['Ви зберігаєте право власності на дані, які додаєте до Сервісу. Ви надаєте нам обмежену ліцензію на розміщення, зберігання та обробку цих даних виключно для роботи й надання Сервісу вам і вашій команді. Ви відповідаєте за наявність у вас права додавати будь-які дані, зокрема адреси електронної пошти людей, яких ви запрошуєте.'],
            },
            {
                heading: 'Команди',
                body: ['Власник команди може запрошувати та вилучати учасників. Запрошення когось до команди надає йому доступ до підписок і пов’язаних даних команди. Вилучайте учасників або видаляйте команду, якщо більше не бажаєте надавати спільний доступ.'],
            },
            {
                heading: 'Нагадування та точність',
                body: ['Нагадування, сповіщення про день оплати та тижневі підсумки надаються за принципом «найкращих зусиль» і можуть затримуватися чи не доставлятися через чинники поза нашим контролем (наприклад доставка push чи email, налаштування пристрою або недоступність сервісу). Ви залишаєтеся одноосібно відповідальними за облік і оплату власних підписок. Конвертація валют і підсумки є приблизними та наведені лише для зручності.'],
            },
            {
                heading: 'Оплата',
                body: ['Наразі Сервіс надається безкоштовно. У майбутньому ми можемо запровадити платні функції; якщо так, ми чітко повідомимо умови до того, як з вас стягуватиметься плата.'],
            },
            {
                heading: 'Сторонні сервіси',
                body: ['Мобільні застосунки розповсюджуються через Apple App Store і Google Play, тож їх використання також регулюється правилами цих магазинів та операційної системи вашого пристрою.'],
            },
            {
                heading: 'Відмова від гарантій',
                body: ['Сервіс надається «як є» та «як доступно», без жодних гарантій, прямих чи непрямих, зокрема щодо придатності для певної мети та відсутності порушень прав, у максимально дозволеному законом обсязі.'],
            },
            {
                heading: 'Обмеження відповідальності',
                body: ['У максимально дозволеному законом обсязі Subscree та його оператор не несуть відповідальності за будь-які непрямі, випадкові чи опосередковані збитки, а також за будь-який пропущений платіж, списання чи втрату, що виникли внаслідок покладання на нагадування або дані в Сервісі.'],
            },
            {
                heading: 'Припинення',
                body: ['Ви можете припинити користування Сервісом і видалити обліковий запис будь-коли. Ми можемо призупинити або припинити доступ у разі порушення вами цих Правил або для захисту Сервісу чи інших користувачів.'],
            },
            {
                heading: 'Зміни до цих Правил',
                body: ['Ми можемо час від часу оновлювати ці Правила. Ми оновимо дату «Останнє оновлення», а для суттєвих змін надамо помітніше повідомлення. Подальше користування після змін означає вашу згоду з оновленими Правилами.'],
            },
            {
                heading: 'Застосовне право',
                body: ['Ці Правила регулюються законодавством України без урахування його колізійних норм.'],
            },
            {
                heading: 'Контакти',
                body: [`Запитання щодо цих Правил? Напишіть нам: ${CONTACT}.`],
            },
        ],
    },
};

export async function generateMetadata() {
    const locale = await getLocale();
    const c = content[locale] ?? content.en;
    return { title: c.title, description: c.intro, alternates: { canonical: '/terms' } };
}

export default async function TermsPage() {
    const locale = await getLocale();
    const c = content[locale] ?? content.en;
    return <LegalShell locale={locale} title={c.title} updatedISO={UPDATED} intro={c.intro} sections={c.sections} />;
}
