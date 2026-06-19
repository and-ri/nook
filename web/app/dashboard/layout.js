import { Sidebar } from '@/components/layout/Sidebar';

export default function DashboardLayout({ children }) {
    return (
        // fixed inset-0 pins the shell to the viewport and takes it out of
        // document flow, so the page/body can never scroll — only <main> does.
        <div className="fixed inset-0 flex overflow-hidden">
            <Sidebar />
            {/* offset for mobile top bar */}
            <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
                {children}
            </main>
        </div>
    );
}
