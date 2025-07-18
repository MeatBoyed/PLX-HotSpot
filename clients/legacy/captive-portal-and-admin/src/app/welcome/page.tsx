import UserSession from '@/components/welcome-page/user-session';
import { requireAuthenticated } from '@/lib/auth/auth-service';
import { seedAuthState } from '@/lib/seed';
import { appConfig } from '@/lib/config';
import InfoCard from '@/components/welcome-page/info-card';

export default async function WelcomePage() {
    // Ensure user is authenticated, redirect if not
    const authState = appConfig.useSeedData ? seedAuthState : await requireAuthenticated();
    console.log("Welcome page auth state:", authState);

    return (
        <>
            <div className="flex flex-col items-center justify-start" style={{ backgroundColor: 'var(--brand-primary)' }}>
                <InfoCard />

                <main className="flex items-start justify-start bg-white w-full rounded-t-[20px] pt-3 pb-10 md:items-center md:justify-center max-w-md">
                    {authState.userSession && (
                        <UserSession
                            status={authState.userSession}
                            userUsage={authState.userUsage}
                        />
                    )}
                </main>
            </div>
        </>
    );
}
