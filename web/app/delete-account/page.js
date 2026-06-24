import { getLocale } from 'next-intl/server';
import { LegalShell } from '@/components/legal/LegalShell';

const UPDATED = '2026-06-24';
const CONTACT = 'contact@subscree.app';

const content = {
    en: {
        title: 'Delete your account',
        intro: 'You can delete your Subscree account and personal data at any time. This page explains how, and what happens to your data.',
        sections: [
            {
                heading: 'How to request deletion',
                body: ['In the app or on the web, go to Settings → Danger zone → Delete account and confirm.'],
                items: [
                    'Web: subscree.app → Settings → Delete account.',
                    'Mobile: open the app → Settings → Delete account.',
                    `If you can’t access your account, email ${CONTACT} from your registered address and we’ll process the deletion for you.`,
                ],
            },
            {
                heading: 'What happens next',
                body: ['Your account is scheduled for deletion and you are signed out. After a 7-day grace period it is permanently deleted. If you sign back in within those 7 days, you can restore your account from Settings.'],
            },
            {
                heading: 'What is deleted',
                items: [
                    'Your account and profile (name, email, password).',
                    'Your notification settings, push tokens, and notification history.',
                    'Teams where you are the only member, including their subscriptions, categories, and payment methods.',
                ],
            },
            {
                heading: 'What is kept',
                body: ['If you belong to a team shared with other people, that team and its data remain available to the other members. Items you created there stay in the team, but are no longer linked to your account. We may also retain limited records where required by law.'],
            },
            {
                heading: 'Contact',
                body: [`Questions about deleting your account or data? Email ${CONTACT}.`],
            },
        ],
    },
    uk: {
        title: 'Видалення акаунта',
        intro: 'Ви можете будь-коли видалити свій акаунт Subscree та персональні дані. Ця сторінка пояснює, як це зробити та що станеться з вашими даними.',
        sections: [
            {
                heading: 'Як надіслати запит на видалення',
                body: ['У застосунку або у вебі перейдіть до Налаштування → Небезпечна зона → Видалити акаунт і підтвердьте.'],
                items: [
                    'Веб: subscree.app → Налаштування → Видалити акаунт.',
                    'Мобільний застосунок: відкрийте застосунок → Налаштування → Видалити акаунт.',
                    `Якщо ви не маєте доступу до акаунта, напишіть на ${CONTACT} з вашої зареєстрованої адреси, і ми виконаємо видалення.`,
                ],
            },
            {
                heading: 'Що відбувається далі',
                body: ['Ваш акаунт буде заплановано до видалення, і вас буде виведено із системи. Після 7-денного періоду очікування його буде остаточно видалено. Якщо ви ввійдете впродовж цих 7 днів, ви зможете відновити акаунт у Налаштуваннях.'],
            },
            {
                heading: 'Що видаляється',
                items: [
                    'Ваш акаунт і профіль (ім’я, електронна пошта, пароль).',
                    'Ваші налаштування сповіщень, push-токени та історія сповіщень.',
                    'Команди, де ви єдиний учасник, разом із їхніми підписками, категоріями та способами оплати.',
                ],
            },
            {
                heading: 'Що зберігається',
                body: ['Якщо ви належите до команди, спільної з іншими людьми, ця команда та її дані залишаються доступними для інших учасників. Створені вами там записи лишаються в команді, але більше не пов’язані з вашим акаунтом. Ми також можемо зберігати обмежені записи, якщо цього вимагає закон.'],
            },
            {
                heading: 'Контакти',
                body: [`Питання щодо видалення акаунта чи даних? Напишіть на ${CONTACT}.`],
            },
        ],
    },
};

export async function generateMetadata() {
    const locale = await getLocale();
    const c = content[locale] ?? content.en;
    return { title: c.title, description: c.intro, alternates: { canonical: '/delete-account' } };
}

export default async function DeleteAccountPage() {
    const locale = await getLocale();
    const c = content[locale] ?? content.en;
    return <LegalShell locale={locale} title={c.title} updatedISO={UPDATED} intro={c.intro} sections={c.sections} />;
}
